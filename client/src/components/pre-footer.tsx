import { useI18n } from "@/lib/i18n";
import { HelpCircle, Plus, Users } from "lucide-react";
import { Link } from "wouter";
import { NavigationLink } from "@/components/ui/navigation-link";

export function PreFooter() {
    const { t } = useI18n();

    return (
        <section className="relative w-full py-16 md:py-16 min-h-[500px] overflow-hidden flex flex-col justify-center -mt-1">
            {/* Full-bleed background image */}
            <img
                src="/assets/footer1.png"
                alt=""
                className="absolute top-0 left-1/2 -translate-x-1/2 h-full w-full max-w-[1990px] object-cover opacity-10 pointer-events-none"
            />

            <div className="max-w-[1600px] mx-auto px-6 lg:px-12 w-full relative z-10">
                <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-12 w-full">
                    {/* Left: Mission Statement */}
                    <div className="flex flex-col items-center md:items-start text-center md:text-left max-w-xl">
                        <h2 className="text-[36px] font-semibold tracking-tight leading-[52.5px] font-sans text-slate-900 opacity-[0.65]">
                            Thanks for supporting Ukraine.
                            <span className="text-[25px] text-slate-900 font-semibold block leading-normal mt-6 tracking-[0.03em]">
                                Every small action matters.
                            </span>
                        </h2>

                        {/* Unified CTA */}
                        <div className="mt-12">
                            <Link href="/map">
                                <button className="group rounded-full bg-black hover:bg-black text-white px-8 py-3 text-base font-medium transition-all duration-300 hover:-translate-y-0.5 hover:font-semibold flex items-center gap-2 tracking-[0.3px]">
                                    <span>Add a store</span>
                                    <Plus className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" strokeWidth={1.5} />
                                </button>
                            </Link>
                        </div>
                    </div>

                    {/* Right: Direct Navigation Bridge */}
                    <nav className="flex flex-col gap-4 items-start text-left" aria-label="Additional navigation">
                        <NavigationLink href="/map" icon={Plus} label="Add a Store" />
                        <NavigationLink href="#faq" icon={HelpCircle} label="FAQ" isExternal />
                        <NavigationLink href="#spread-the-word" icon={Users} label="Join the Community" isExternal />
                    </nav>
                </div>
            </div>
        </section>
    );
}
