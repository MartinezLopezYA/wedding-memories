import "server-only";

import { S3Client } from "@aws-sdk/client-s3";

function requireEnv(name: string): string {
    const value = process.env[name];
    if (!value) throw new Error(`Falta la variable de entorno ${name}`);
    return value;
}

export const R2_BUCKET = requireEnv("R2_BUCKET_NAME");
export const R2_EVENT_ID = requireEnv("R2_EVENT_ID");

export const r2 = new S3Client({
    region: "auto",
    endpoint: `https://${requireEnv("CLOUDFLARE_ACCOUNT_ID")}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: requireEnv("R2_ACCESS_KEY_ID"),
        secretAccessKey: requireEnv("R2_SECRET_ACCESS_KEY"),
    },
    // Las versiones recientes del SDK agregan checksums CRC32 a las URLs firmadas,
    // lo que rompe los PUT desde el navegador contra R2. Solo cuando sea obligatorio.
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
});
