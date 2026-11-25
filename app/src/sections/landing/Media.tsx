import { Camera } from "lucide-react";

import UploadButton from "../../components/UploadButton";

export default function Media() { 

    return (
        <section className="w-full max-h-150 flex flex-col items-center py-10 px-6 gap-4 md:py-20 md:px-8 bg-green-900/80">
            <Camera className="size-10 text-white" />
            <p className="text-xs font-medium uppercase tracking-[0.70em] md:text-sm text-white">Recuerdos</p>
            <h2 className="font-script text-4xl leading-tight md:text-6xl text-shadow-yellow-900 text-center text-white">Comparte tus fotos</h2>
            <div className="flex w-full items-center gap-3" aria-hidden="true">
                <span className="h-px flex-1 bg-green-300/50" />
                <span className="size-1.5 rotate-45 bg-green-300/80" />
                <span className="h-px flex-1 bg-green-300/50" />
            </div>
            <p className="font-serif text-lg italic md:text-xl text-shadow-yellow-900 text-center text-white">Nos encantaría tener todos los recuerdos de nuestro día en un solo lugar. Si tomaste fotos o videos, por favor compártelos con nosotros.</p>
            <UploadButton />
            <p className="text-sm font-serif italic text-white">Fotos JPG, PNG o HEIC · Videos MP4 o MOV</p>
        </section>
    )

}