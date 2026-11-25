import { Suspense } from "react";
import type { Metadata } from "next";
import { Loader2, LogOut } from "lucide-react";

import { logout } from "../src/actions/auth";
import Gallery from "../src/sections/admin/Gallery";

export const metadata: Metadata = {
    title: "Panel de los novios",
    robots: { index: false, follow: false },
};

export default function AdminPage() {
    return (
        <main className="min-h-svh bg-green-50">
            <header className="sticky top-0 z-10 border-b border-green-900/10 bg-white/90 backdrop-blur">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-8">
                    <div className="flex flex-col">
                        <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-green-900 md:text-xs">Panel de los novios</p>
                        <h1 className="font-script text-3xl leading-tight text-green-950">Milena &amp; Jhon</h1>
                    </div>
                    <form action={logout}>
                        <button
                            type="submit"
                            className="flex min-h-11 cursor-pointer items-center gap-2 rounded-2xl px-4 text-sm font-medium text-green-900 transition-colors hover:bg-green-900/10"
                        >
                            <LogOut className="size-4" />
                            Salir
                        </button>
                    </form>
                </div>
            </header>

            <section className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-10">
                {/* La galería lee la cookie de sesión y R2 en cada request: va detrás de Suspense */}
                <Suspense
                    fallback={
                        <div className="flex items-center justify-center gap-2 py-24 text-green-900">
                            <Loader2 className="size-5 animate-spin" />
                            Cargando fotos…
                        </div>
                    }
                >
                    <Gallery />
                </Suspense>
            </section>
        </main>
    );
}
