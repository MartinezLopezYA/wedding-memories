import type { Metadata } from "next";

import LoginForm from "../../src/components/LoginForm";

export const metadata: Metadata = {
    title: "Panel de los novios",
    robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
    return (
        <main className="flex min-h-svh items-center justify-center bg-green-50 px-4">
            <div className="flex w-full max-w-sm flex-col items-center gap-6 rounded-3xl bg-white p-8 shadow-xl">
                <div className="flex flex-col items-center gap-1 text-center">
                    <p className="text-xs font-medium uppercase tracking-[0.35em] text-green-900">Panel de los novios</p>
                    <h1 className="font-script text-4xl text-green-950">Milena &amp; Jhon</h1>
                </div>
                <LoginForm />
            </div>
        </main>
    );
}
