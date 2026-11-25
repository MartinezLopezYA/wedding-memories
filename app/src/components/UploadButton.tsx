"use client";

import { useRef, useState } from "react";
import imageCompression from "browser-image-compression";
import { CheckCircle2, Loader2, UploadCloud, XCircle } from "lucide-react";

import { createUploadUrls, type UploadTarget } from "../actions/upload";

const CHUNK_SIZE = 20; // debe coincidir con MAX_FILES_PER_REQUEST del server
const CONCURRENCY = 3;

// Algunos navegadores (p. ej. Chrome en Windows con HEIC) dejan file.type vacío
const TYPE_BY_EXT: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    heic: "image/heic",
    heif: "image/heif",
    mp4: "video/mp4",
    mov: "video/quicktime",
    webm: "video/webm",
};

type Status =
    | { kind: "idle" }
    | { kind: "preparing"; total: number }
    | { kind: "uploading"; done: number; total: number; percent: number }
    | { kind: "done"; ok: number; failed: File[] }
    | { kind: "error"; message: string };

function resolveType(file: File): string {
    if (file.type) return file.type;
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    return TYPE_BY_EXT[ext] ?? "";
}

async function compress(file: File): Promise<File> {
    const type = resolveType(file);
    // Videos y HEIC se suben tal cual (la mayoría de navegadores no decodifica HEIC)
    if (!type.startsWith("image/") || type === "image/heic" || type === "image/heif") return file;
    if (file.size < 1.5 * 1024 * 1024) return file;
    try {
        return await imageCompression(file, {
            maxSizeMB: 4,
            maxWidthOrHeight: 4096,
            initialQuality: 0.85,
            useWebWorker: true,
            preserveExif: true,
        });
    } catch {
        return file;
    }
}

function putFile(file: Blob, type: string, url: string, onProgress: (loaded: number) => void) {
    return new Promise<void>((resolve, reject) => {
        // XHR en lugar de fetch: fetch no expone el progreso de subida
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", url);
        xhr.setRequestHeader("Content-Type", type);
        xhr.upload.onprogress = (e) => onProgress(e.loaded);
        xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`HTTP ${xhr.status}`)));
        xhr.onerror = () => reject(new Error("Error de red"));
        xhr.send(file);
    });
}

async function runPool<T>(items: T[], limit: number, worker: (item: T) => Promise<void>) {
    let next = 0;
    const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
        while (next < items.length) await worker(items[next++]);
    });
    await Promise.all(runners);
}

export default function UploadButton() {
    const inputRef = useRef<HTMLInputElement>(null);
    const [status, setStatus] = useState<Status>({ kind: "idle" });
    const busy = status.kind === "preparing" || status.kind === "uploading";

    async function upload(selected: File[]) {
        if (selected.length === 0) return;
        setStatus({ kind: "preparing", total: selected.length });

        const files = await Promise.all(selected.map(compress));
        const totalBytes = files.reduce((sum, f) => sum + f.size, 0);
        const loaded = new Array<number>(files.length).fill(0);
        let done = 0;
        const failed: File[] = [];

        const report = () =>
            setStatus({
                kind: "uploading",
                done,
                total: files.length,
                percent: Math.round((loaded.reduce((a, b) => a + b, 0) / totalBytes) * 100),
            });
        report();

        for (let start = 0; start < files.length; start += CHUNK_SIZE) {
            const chunk = files.slice(start, start + CHUNK_SIZE);
            const result = await createUploadUrls(
                chunk.map((f) => ({ name: f.name, type: resolveType(f), size: f.size })),
            );
            if (!result.ok) {
                setStatus({ kind: "error", message: result.error });
                return;
            }

            const jobs = chunk.map((file, i) => ({ file, index: start + i, target: result.targets[i] as UploadTarget }));
            await runPool(jobs, CONCURRENCY, async ({ file, index, target }) => {
                try {
                    await putFile(file, resolveType(file), target.url, (bytes) => {
                        loaded[index] = bytes;
                        report();
                    });
                    loaded[index] = file.size;
                    done++;
                } catch {
                    loaded[index] = file.size; // cuenta como procesado para la barra
                    failed.push(selected[index]);
                }
                report();
            });
        }

        setStatus({ kind: "done", ok: done, failed });
    }

    function onChange(e: React.ChangeEvent<HTMLInputElement>) {
        const files = Array.from(e.target.files ?? []);
        e.target.value = ""; // permite volver a elegir los mismos archivos
        upload(files);
    }

    return (
        <div className="flex w-full max-w-sm flex-col items-center gap-3">
            <input
                ref={inputRef}
                type="file"
                multiple
                accept="image/*,video/*,.heic,.heif"
                className="hidden"
                onChange={onChange}
            />
            <button
                type="button"
                disabled={busy}
                onClick={() => inputRef.current?.click()}
                className="flex min-h-12 cursor-pointer items-center gap-2 rounded-2xl bg-white px-6 py-2 font-bold text-green-700 transition-colors duration-300 hover:bg-green-900 hover:text-white disabled:cursor-wait disabled:opacity-80 disabled:hover:bg-white disabled:hover:text-green-700"
            >
                {busy ? <Loader2 className="size-5 animate-spin" /> : <UploadCloud className="size-5" />}
                {busy ? "Subiendo…" : status.kind === "done" ? "Subir más fotos" : "Subir mis fotos"}
            </button>

            <div aria-live="polite" className="w-full text-center text-sm text-white">
                {status.kind === "preparing" && <p>Preparando {status.total} archivo(s)…</p>}

                {status.kind === "uploading" && (
                    <div className="flex flex-col gap-2">
                        <div
                            className="h-2 w-full overflow-hidden rounded-full bg-white/30"
                            role="progressbar"
                            aria-valuenow={status.percent}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-label="Progreso de subida"
                        >
                            <div className="h-full bg-white transition-[width] duration-200" style={{ width: `${status.percent}%` }} />
                        </div>
                        <p>
                            {status.done} de {status.total} · {status.percent}%
                        </p>
                    </div>
                )}

                {status.kind === "done" && (
                    <div className="flex flex-col items-center gap-2">
                        {status.ok > 0 && (
                            <p className="flex items-center gap-2">
                                <CheckCircle2 className="size-5" />
                                ¡Gracias! Subimos {status.ok} archivo(s).
                            </p>
                        )}
                        {status.failed.length > 0 && (
                            <>
                                <p className="flex items-center gap-2">
                                    <XCircle className="size-5" />
                                    {status.failed.length} archivo(s) no se pudieron subir.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => upload(status.failed)}
                                    className="cursor-pointer underline underline-offset-4"
                                >
                                    Reintentar
                                </button>
                            </>
                        )}
                    </div>
                )}

                {status.kind === "error" && (
                    <p className="flex items-center justify-center gap-2">
                        <XCircle className="size-5" />
                        {status.message}
                    </p>
                )}
            </div>
        </div>
    );
}
