export default function Information() {

    return (
        <section className="w-full max-h-150 relative isolate flex flex-col items-center py-10 px-6 gap-4 md:py-20 md:px-8">
            <p className="text-xs font-medium uppercase tracking-[0.70em] md:text-sm text-green-900">Bienvenidos</p>
            <h2 className="font-script text-4xl leading-tight md:text-6xl text-shadow-yellow-900 text-center">Gracias por ser parte de nuestro día</h2>
            <div className="flex w-full items-center gap-3" aria-hidden="true">
                <span className="h-px flex-1 bg-green-700/50" />
                <span className="size-1.5 rotate-45 bg-green-700/80" />
                <span className="h-px flex-1 bg-green-700/50" />
            </div>
            <p className="font-serif text-lg italic md:text-xl text-shadow-yellow-900 text-center">Cada uno de ustedes vio la boda desde un ángulo distinto. Las fotos que tomaron guardan momentos que nosotros quizás nunca vimos. Nos encantaría tenerlos todos en un solo lugar.</p>
        </section>
    )

}