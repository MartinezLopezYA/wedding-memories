export default function Footer() {

    return (
        <footer className="w-full flex flex-col items-center py-6 px-4 gap-2 md:py-10 md:px-8">
            <p className="text-xs font-medium uppercase tracking-[0.70em] md:text-sm text-green-900">Hecho con amor</p>
            <h2 className="font-script text-4xl leading-tight md:text-6xl text-shadow-yellow-900 text-center">Por Milena &amp; Jhon</h2>
            <div className="flex w-full items-center gap-3" aria-hidden="true">
                <span className="h-px flex-1 bg-green-700/50" />
                <span className="size-1.5 rotate-45 bg-green-700/80" />
                <span className="h-px flex-1 bg-green-700/50" />
            </div>
            <p className="font-serif text-lg italic md:text-xl text-shadow-yellow-900 text-center">Gracias por ser parte de nuestro día y por ayudarnos a crear recuerdos que durarán toda la vida.</p>
        </footer>
    )

}