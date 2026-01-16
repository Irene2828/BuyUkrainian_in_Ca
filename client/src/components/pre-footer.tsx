import React from "react";
import { useI18n } from "@/lib/i18n";

export function PreFooter() {
    const { t, language } = useI18n();
    return (
        <section className="pre-footer-new-container px-6 md:px-20">
            {/* Slogans centered horizontally and vertically within the background image */}
            <div className="pre-footer-visual-wrapper relative">
                <img
                    src="/assets/footer1.png"
                    alt=""
                    className="pre-footer-outlined-image opacity-10"
                />

                <div className="flex flex-col items-center text-center py-32 px-20 relative z-10">
                    <h3 className="text-[28px] font-medium text-slate-900 tracking-tight leading-tight">
                        {language === 'ua' ? 'Купуй українське — Підтримуй Україну' : 'Buy Ukrainian — Support Ukraine'}
                    </h3>
                    <p className="mt-4 text-[16px] text-slate-900/60 lowercase tracking-wide italic leading-relaxed">
                        every purchase, every share matters.
                    </p>
                </div>


            </div>
        </section>
    );
}
