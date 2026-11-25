import Image, { getImageProps } from "next/image";

import bgHero from "../../../assets/bg-hero.png";
import bgHeroRing from "../../../assets/bg-hero-ring.png";
import bgHeroFlowers from "../../../assets/bg-hero-flowers.png";

const common = { fill: true, sizes: "100vw" };

export default function Hero() {
    const { props: { srcSet: desktop } } = getImageProps({ ...common, alt: "", src: bgHero });
    const { props: { srcSet: mobile, ...rest } } = getImageProps({ ...common, alt: "", src: bgHeroRing });

    return (
        <section className="w-full h-150 relative isolate flex items-end justify-center">
            <picture>
                <source media="(min-width: 768px)" srcSet={desktop} />
                <source srcSet={mobile} />
                <img {...rest} alt="" fetchPriority="high" className="-z-10 object-cover" />
            </picture>
            <Image src={bgHeroFlowers} alt="" {...common} loading="lazy" className="-z-10 object-cover opacity-0 animate-hero-fade motion-reduce:animate-none md:hidden"/>
            <div className="absolute inset-0 -z-10 bg-linear-to-t from-black/50 to-black/0" aria-hidden="true" />
            <div className="relative mx-4 mb-12 flex w-full max-w-md flex-col items-center gap-3 rounded-3xl border border-green-300/30 bg-green-900/20 px-8 py-10 text-center text-white shadow-2xl backdrop-blur-md md:mb-16 md:max-w-2xl md:px-16 md:py-12">
                <p className="text-xs font-medium uppercase tracking-[0.35em] md:text-sm">Nos casamos</p>
                <h1 className="font-script text-4xl leading-tight md:text-5xl">Milena &amp; Jhon</h1>
                <div className="flex w-full items-center gap-3" aria-hidden="true">
                    <span className="h-px flex-1 bg-green-300/50" />
                    <span className="size-1.5 rotate-45 bg-green-300/80" />
                    <span className="h-px flex-1 bg-green-300/50" />
                </div>
                <p className="font-serif text-xl italic md:text-2xl">Viernes 27 de diciembre de 2026</p>
            </div>
        </section>
    )
}
