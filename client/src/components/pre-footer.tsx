import { useI18n } from "@/lib/i18n";

export function PreFooter() {
    const { t, language } = useI18n();

    return (
        <section className="relative w-full py-16 md:py-16 overflow-hidden flex flex-col justify-center">
            <div className="max-w-7xl mx-auto px-6 lg:px-12 w-full relative z-10">
                {/* Visual Wrapper */}
                <div className="pre-footer-visual-wrapper relative">
                    <img
                        src="/assets/footer1.png"
                        alt=""
                        className="pre-footer-outlined-image opacity-10"
                    />

                    <div className="flex flex-col items-center justify-center text-center relative z-10 w-full">
                        {/* 2-Lined Slogan */}
                        <h2 className="text-[36px] font-medium tracking-tight leading-[52.5px] font-sans text-slate-900">
                            Thanks for supporting Ukraine.
                            <span className="text-[25px] opacity-70 block leading-normal mt-3">
                                Every small action matters.
                            </span>
                        </h2>
                    </div>
                </div>
            </div>
        </section>
    );
}
