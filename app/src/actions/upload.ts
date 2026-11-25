"use server";

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { r2, R2_BUCKET, R2_EVENT_ID } from "../lib/r2";

const MAX_FILES_PER_REQUEST = 20;
const MAX_IMAGE_BYTES = 30 * 1024 * 1024; // 30 MB
const MAX_VIDEO_BYTES = 500 * 1024 * 1024; // 500 MB
const URL_EXPIRES_SECONDS = 10 * 60;

export type UploadRequest = { name: string; type: string; size: number };
export type UploadTarget = { url: string; key: string };
export type CreateUploadUrlsResult =
    | { ok: true; targets: UploadTarget[] }
    | { ok: false; error: string };

const EXTENSIONS: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/heic": "heic",
    "image/heif": "heif",
    "video/mp4": "mp4",
    "video/quicktime": "mov",
    "video/webm": "webm",
};

function validate(file: UploadRequest): string | null {
    const ext = EXTENSIONS[file.type];
    if (!ext) return `"${file.name}" no es un formato permitido.`;
    const max = file.type.startsWith("video/") ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
    if (!Number.isFinite(file.size) || file.size <= 0 || file.size > max) {
        return `"${file.name}" supera el tamaño máximo (${Math.round(max / 1024 / 1024)} MB).`;
    }
    return null;
}

/**
 * Genera URLs firmadas para que el navegador suba los archivos directo a R2.
 * Es un endpoint público (los invitados no inician sesión), por eso valida
 * tipo, tamaño y cantidad; la URL solo permite subir ese Content-Type a esa key.
 */
export async function createUploadUrls(files: UploadRequest[]): Promise<CreateUploadUrlsResult> {
    if (!Array.isArray(files) || files.length === 0) {
        return { ok: false, error: "No seleccionaste archivos." };
    }
    if (files.length > MAX_FILES_PER_REQUEST) {
        return { ok: false, error: `Puedes subir hasta ${MAX_FILES_PER_REQUEST} archivos a la vez.` };
    }
    for (const file of files) {
        const error = validate(file);
        if (error) return { ok: false, error };
    }

    const targets = await Promise.all(
        files.map(async (file) => {
            const key = `${R2_EVENT_ID}/${crypto.randomUUID()}.${EXTENSIONS[file.type]}`;
            const command = new PutObjectCommand({
                Bucket: R2_BUCKET,
                Key: key,
                ContentType: file.type,
                ContentLength: file.size,
            });
            const url = await getSignedUrl(r2, command, { expiresIn: URL_EXPIRES_SECONDS });
            return { url, key };
        }),
    );

    return { ok: true, targets };
}
