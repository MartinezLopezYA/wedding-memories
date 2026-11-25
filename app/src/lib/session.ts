// Sesión del panel admin: cookie con "<expira>.<firma HMAC>".
// Usa solo Web Crypto para funcionar igual en proxy.ts y en el servidor.
// La clave se deriva de ADMIN_PASSWORD: cambiar la contraseña cierra todas las sesiones.

export const SESSION_COOKIE = "admin_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 días

const encoder = new TextEncoder();

async function getKey(): Promise<CryptoKey> {
    const password = process.env.ADMIN_PASSWORD;
    if (!password) throw new Error("Falta la variable de entorno ADMIN_PASSWORD");
    const material = await crypto.subtle.digest("SHA-256", encoder.encode(`wedding-admin:${password}`));
    return crypto.subtle.importKey("raw", material, { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

function toBase64Url(bytes: ArrayBuffer): string {
    return btoa(String.fromCharCode(...new Uint8Array(bytes)))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array<ArrayBuffer> | null {
    try {
        const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
        return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    } catch {
        return null;
    }
}

export async function createSessionToken(): Promise<string> {
    const expires = String(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);
    const signature = await crypto.subtle.sign("HMAC", await getKey(), encoder.encode(expires));
    return `${expires}.${toBase64Url(signature)}`;
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
    if (!token) return false;
    const [expires, signature] = token.split(".");
    if (!expires || !signature || !/^\d+$/.test(expires) || Number(expires) < Date.now()) return false;
    const bytes = fromBase64Url(signature);
    if (!bytes) return false;
    // verify() compara en tiempo constante
    return crypto.subtle.verify("HMAC", await getKey(), bytes, encoder.encode(expires));
}
