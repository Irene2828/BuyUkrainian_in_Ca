import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";

export function PreFooter() {
    const { t, language } = useI18n();

    return (
        <section className="relative w-full py-16 md:py-16 min-h-[500px] overflow-hidden flex flex-col justify-center -mt-1">
            {/* Full-bleed background image */}
            <img
                src="/assets/footer1.png"
                alt=""
                className="absolute top-0 left-1/2 -translate-x-1/2 h-full w-full max-w-[1990px] object-cover opacity-10 pointer-events-none"
            />

            <div className="max-w-7xl mx-auto px-6 lg:px-12 w-full relative z-10">
                <div className="flex flex-col items-center justify-center text-center w-full">
                    {/* 2-Lined Slogan */}
                    <h2 className="text-[36px] font-semibold tracking-tight leading-[52.5px] font-sans text-black opacity-[0.65]">
                        Thanks for supporting Ukraine.
                        <span className="text-[25px] text-black font-semibold block leading-normal mt-6 tracking-[0.03em]">
                            Every small action matters.
                        </span>
                    </h2>

                    {/* Unified CTA */}
                    <div className="mt-12">
                        <Link href="/map">
                            <Button className="btn-premium-action bg-black text-white hover:bg-slate-900 group gap-1.5 font-ui shadow-none h-[46px] md:h-[52px] rounded-full px-7">
                                <span>{t('home.hero.explore') || "Explore the map"}</span>
                                <ArrowRight className="w-5 h-5 !fill-none !stroke-current transition-transform duration-300 group-hover:translate-x-1 mt-[1px]" strokeWidth={2} />
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
