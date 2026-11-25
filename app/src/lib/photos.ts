import "server-only";

import { GetObjectCommand, ListObjectsV2Command, type _Object } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { r2, R2_BUCKET, R2_EVENT_ID } from "./r2";

const URL_EXPIRES_SECONDS = 60 * 60; // 1 hora

export type MediaKind = "image" | "video";

export type MediaItem = {
    key: string;
    name: string;
    size: number;
    lastModified: string; // ISO
    kind: MediaKind;
};

const VIDEO_EXTENSIONS = new Set(["mp4", "mov", "webm"]);

function kindOf(key: string): MediaKind {
    const ext = key.split(".").pop()?.toLowerCase() ?? "";
    return VIDEO_EXTENSIONS.has(ext) ? "video" : "image";
}

/** Lista todo lo que hay en la carpeta del evento, más recientes primero. */
export async function listMedia(): Promise<MediaItem[]> {
    const objects: _Object[] = [];
    let token: string | undefined;
    do {
        const page = await r2.send(
            new ListObjectsV2Command({
                Bucket: R2_BUCKET,
                Prefix: `${R2_EVENT_ID}/`,
                ContinuationToken: token,
            }),
        );
        objects.push(...(page.Contents ?? []));
        token = page.IsTruncated ? page.NextContinuationToken : undefined;
    } while (token);

    return objects
        .filter((o): o is _Object & { Key: string } => !!o.Key && !o.Key.endsWith("/") && (o.Size ?? 0) > 0)
        .map((o) => ({
            key: o.Key,
            name: o.Key.split("/").pop() ?? o.Key,
            size: o.Size ?? 0,
            lastModified: (o.LastModified ?? new Date(0)).toISOString(),
            kind: kindOf(o.Key),
        }))
        .sort((a, b) => b.lastModified.localeCompare(a.lastModified));
}

/** URL temporal para ver el archivo en el navegador. */
export function getViewUrl(key: string): Promise<string> {
    return getSignedUrl(r2, new GetObjectCommand({ Bucket: R2_BUCKET, Key: key }), {
        expiresIn: URL_EXPIRES_SECONDS,
    });
}

/** URL temporal que fuerza la descarga con un nombre de archivo. */
export function getDownloadUrl(key: string, filename: string): Promise<string> {
    return getSignedUrl(
        r2,
        new GetObjectCommand({
            Bucket: R2_BUCKET,
            Key: key,
            ResponseContentDisposition: `attachment; filename="${filename.replace(/"/g, "")}"`,
        }),
        { expiresIn: URL_EXPIRES_SECONDS },
    );
}

export async function getObjectStream(key: string) {
    const res = await r2.send(new GetObjectCommand({ Bucket: R2_BUCKET, Key: key }));
    return res.Body?.transformToWebStream();
}

// Zona horaria para nombres de archivo y fechas visibles (ajustable con EVENT_TIME_ZONE)
export const TIME_ZONE = process.env.EVENT_TIME_ZONE ?? "America/Bogota";

/** Nombre legible para descargas: foto-2026-12-27_21-45-03-1a2b3c.jpg */
export function downloadName(item: MediaItem): string {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: TIME_ZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hourCycle: "h23",
    }).formatToParts(new Date(item.lastModified));
    const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
    const stamp = `${get("year")}-${get("month")}-${get("day")}_${get("hour")}-${get("minute")}-${get("second")}`;
    const ext = item.name.split(".").pop() ?? "bin";
    const id = item.name.slice(0, 6);
    return `${item.kind === "video" ? "video" : "foto"}-${stamp}-${id}.${ext}`;
}
