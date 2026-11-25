"use client";

import { useActionState } from "react";
import { Loader2, LogIn } from "lucide-react";

import { login, type LoginState } from "../actions/auth";

export default function LoginForm() {
    const [state, action, pending] = useActionState<LoginState, FormData>(login, null);

    return (
        <form action={action} className="flex w-full flex-col gap-4">
            <label className="flex flex-col gap-1 text-sm font-medium text-green-950">
                Usuario
                <input
                    name="username"
                    autoComplete="username"
                    required
                    className="min-h-11 rounded-xl border border-green-900/20 bg-white px-3 text-base font-normal outline-none focus:border-green-700 focus:ring-2 focus:ring-green-700/20"
                />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-green-950">
                Contraseña
                <input
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="min-h-11 rounded-xl border border-green-900/20 bg-white px-3 text-base font-normal outline-none focus:border-green-700 focus:ring-2 focus:ring-green-700/20"
                />
            </label>

            <p aria-live="polite" className="min-h-5 text-sm text-red-700">
                {state?.error}
            </p>

            <button
                type="submit"
                disabled={pending}
                className="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-green-800 px-6 font-bold text-white transition-colors hover:bg-green-900 disabled:cursor-wait disabled:opacity-80"
            >
                {pending ? <Loader2 className="size-5 animate-spin" /> : <LogIn className="size-5" />}
                Entrar
            </button>
        </form>
    );
}
