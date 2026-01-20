import React from "react";
import { useI18n } from "@/lib/i18n";

export function PreFooter() {
    const { t, language } = useI18n();
    return (
        <section className="py-20 md:py-32">
            <div className="max-w-7xl mx-auto px-6 lg:px-12">
                {/* Slogans centered horizontally and vertically within the background image */}
                <div className="pre-footer-visual-wrapper relative">
                    <img
                        src="/assets/footer1.png"
                        alt=""
                        className="pre-footer-outlined-image opacity-10"
                    />

                    <div className="flex flex-col items-center text-center py-32 px-20 relative z-10">
                        <h3 className="text-[28px] md:text-[36px] font-medium text-slate-900 tracking-tight leading-tight">
                            {language === 'ua' ? 'Купуй українське. Підтримуй Україну.' : 'Buy Ukrainian. Support Ukraine.'}
                        </h3>
                        <p className="mt-6 text-[16px] md:text-[20px] text-slate-900/60 lowercase tracking-wide italic leading-relaxed">
                            {language === 'ua' ? 'кожна покупка, кожне поширення має значення.' : 'every purchase, every share matters.'}
                        </p>
                    </div>


                </div>
            </div>
        </section>
    );
}
