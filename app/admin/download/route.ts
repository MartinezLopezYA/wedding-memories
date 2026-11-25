import { downloadZip } from "client-zip";

import { isAdmin } from "../../src/lib/auth";
import { downloadName, getObjectStream, listMedia } from "../../src/lib/photos";

// Genera el ZIP en streaming: cada archivo se lee de R2 y se escribe al vuelo,
// sin cargar todo en memoria.
export async function GET() {
    if (!(await isAdmin())) {
        return new Response("No autorizado", { status: 401 });
    }

    const items = await listMedia();

    async function* files() {
        for (const item of items) {
            const input = await getObjectStream(item.key);
            if (!input) continue;
            yield {
                name: downloadName(item),
                lastModified: new Date(item.lastModified),
                size: item.size,
                input,
            };
        }
    }

    const metadata = items.map((item) => ({ name: downloadName(item), size: item.size }));
    const zip = downloadZip(files(), { metadata });

    const headers = new Headers(zip.headers);
    headers.set("Content-Type", "application/zip");
    headers.set("Content-Disposition", 'attachment; filename="fotos-boda-milena-jhon.zip"');
    headers.set("Cache-Control", "no-store");
    return new Response(zip.body, { headers });
}
