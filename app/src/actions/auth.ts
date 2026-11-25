"use server";

import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE_SECONDS } from "../lib/session";

export type LoginState = { error: string } | null;

// Compara hashes de igual longitud en tiempo constante (no revela cuántos caracteres coinciden)
function safeEqual(a: string, b: string): boolean {
    const hash = (value: string) => createHash("sha256").update(value).digest();
    return timingSafeEqual(hash(a), hash(b));
}

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
    const expectedUser = process.env.ADMIN_USERNAME;
    const expectedPassword = process.env.ADMIN_PASSWORD;
    if (!expectedUser || !expectedPassword) {
        return { error: "El panel no está configurado (faltan ADMIN_USERNAME / ADMIN_PASSWORD)." };
    }

    const username = String(formData.get("username") ?? "");
    const password = String(formData.get("password") ?? "");

    // Ambas comparaciones siempre se ejecutan
    const validUser = safeEqual(username, expectedUser);
    const validPassword = safeEqual(password, expectedPassword);
    if (!validUser || !validPassword) {
        return { error: "Usuario o contraseña incorrectos." };
    }

    (await cookies()).set(SESSION_COOKIE, await createSessionToken(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/admin",
        maxAge: SESSION_MAX_AGE_SECONDS,
    });
    redirect("/admin");
}

export async function logout(): Promise<void> {
    (await cookies()).delete({ name: SESSION_COOKIE, path: "/admin" });
    redirect("/admin/login");
}
