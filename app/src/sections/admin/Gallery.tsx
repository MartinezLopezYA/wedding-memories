import { Download, FolderDown, ImageOff, Play } from "lucide-react";

import { requireAdmin } from "../../lib/auth";
import { downloadName, getDownloadUrl, getViewUrl, listMedia, TIME_ZONE } from "../../lib/photos";

function formatBytes(bytes: number): string {
    if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

const dateFormat = new Intl.DateTimeFormat("es", {
    timeZone: TIME_ZONE,
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
});

export default async function Gallery() {
    await requireAdmin();

    const items = await listMedia();
    const media = await Promise.all(
        items.map(async (item) => {
            const filename = downloadName(item);
            const [viewUrl, downloadUrl] = await Promise.all([getViewUrl(item.key), getDownloadUrl(item.key, filename)]);
            return { ...item, filename, viewUrl, downloadUrl };
        }),
    );

    const photos = media.filter((m) => m.kind === "image").length;
    const videos = media.length - photos;
    const totalBytes = media.reduce((sum, m) => sum + m.size, 0);

    if (media.length === 0) {
        return (
            <div className="flex flex-col items-center gap-3 py-24 text-center text-green-900">
                <ImageOff className="size-10" />
                <p className="font-serif text-xl italic">Todavía no hay fotos. Cuando los invitados suban, aparecerán aquí.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="text-sm text-green-950">
                    <span className="font-semibold">{photos}</span> fotos · <span className="font-semibold">{videos}</span> videos ·{" "}
                    {formatBytes(totalBytes)}
                </p>
                {/* <a> normal: es una descarga, no una navegación */}
                <a
                    href="/admin/download"
                    className="flex min-h-11 items-center gap-2 rounded-2xl bg-green-800 px-5 font-semibold text-white transition-colors hover:bg-green-900"
                >
                    <FolderDown className="size-5" />
                    Descargar todo (ZIP)
                </a>
            </div>

            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {media.map((m) => (
                    <li key={m.key} className="group relative overflow-hidden rounded-2xl bg-green-900/10 shadow-sm">
                        <a href={m.viewUrl} target="_blank" rel="noopener noreferrer" className="block aspect-square">
                            {m.kind === "image" ? (
                                // eslint-disable-next-line @next/next/no-img-element -- URL firmada temporal, no pasa por el optimizador
                                <img src={m.viewUrl} alt={`Foto subida el ${dateFormat.format(new Date(m.lastModified))}`} loading="lazy" decoding="async" className="size-full object-cover transition-transform duration-300 group-hover:scale-105" />
                            ) : (
                                <span className="relative block size-full">
                                    {/* #t=0.1 hace que iOS muestre el primer cuadro como miniatura */}
                                    <video src={`${m.viewUrl}#t=0.1`} preload="metadata" muted playsInline className="size-full object-cover" />
                                    <span className="absolute inset-0 flex items-center justify-center bg-black/20">
                                        <Play className="size-10 fill-white text-white" aria-label="Video" />
                                    </span>
                                </span>
                            )}
                        </a>
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-linear-to-t from-black/60 to-transparent p-2 pt-8">
                            <span className="text-xs text-white">
                                {dateFormat.format(new Date(m.lastModified))} · {formatBytes(m.size)}
                            </span>
                            <a
                                href={m.downloadUrl}
                                aria-label={`Descargar ${m.filename}`}
                                className="pointer-events-auto flex size-11 shrink-0 items-center justify-center rounded-full bg-white/90 text-green-900 transition-colors hover:bg-white"
                            >
                                <Download className="size-5" />
                            </a>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
