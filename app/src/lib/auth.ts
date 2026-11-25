import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { SESSION_COOKIE, verifySessionToken } from "./session";

export async function isAdmin(): Promise<boolean> {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    return verifySessionToken(token);
}

/** Para Server Components y Server Functions: sin sesión válida → /admin/login */
export async function requireAdmin(): Promise<void> {
    if (!(await isAdmin())) redirect("/admin/login");
}
