import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE, verifySessionToken } from "./app/src/lib/session";

// Chequeo optimista: corta temprano a quien no tiene sesión.
// La página y el route handler del admin vuelven a verificar (requireAdmin / isAdmin).
export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const isLogin = pathname === "/admin/login";
    const valid = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);

    if (!valid && !isLogin) {
        return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    if (valid && isLogin) {
        return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
}

export const config = {
    matcher: ["/admin", "/admin/:path*"],
};
