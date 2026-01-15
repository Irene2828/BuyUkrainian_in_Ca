import React from "react";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
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

                {/* Mission Statement - Editorial Typography */}
                <div className="flex flex-col items-center gap-4 py-32 max-w-[1440px] mx-auto">
                    {/* Show appropriate slogan based on language */}
                    {language === 'en' ? (
                        <div className="flex flex-col items-center text-center max-w-2xl gap-3">
                            {/* Primary Line - Deep Slate Editorial */}
                            <h2 className="font-bold tracking-tight text-slate-900 font-header text-[24px]">
                                Buy Ukrainian — Support Ukraine
                            </h2>
                            {/* Secondary Line - Lowercase, 14px, slate-500 */}
                            <p className="font-medium text-slate-500 font-ui text-[14px] lowercase">
                                every purchase, every share matters.
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center text-center max-w-2xl gap-3">
                            {/* Primary Line - Deep Slate Editorial */}
                            <h2 className="font-bold tracking-tight text-slate-900 font-header whitespace-nowrap text-[24px]">
                                Купуй українське — Підтримуй Україну
                            </h2>
                            {/* Secondary Line - Lowercase, 14px, slate-500 */}
                            <p className="font-medium text-slate-500 font-ui text-[14px] lowercase">
                                every purchase, every share matters.
                            </p>
                        </div>
                    )}

                    {/* CTA Button - Solid True Black with tactile hover */}
                    <Link
                        href="/map"
                        className="btn-cta inline-flex items-center justify-center rounded-full h-[52px] py-3 pl-6 pr-7 text-[16px] font-semibold gap-3 font-ui shadow-none mt-8 transition-transform duration-200 hover:scale-[1.02] hover:bg-white hover:text-black hover:ring-1 hover:ring-black"
                        style={{ backgroundColor: '#000000', color: '#ffffff' }}
                    >
                        {t('header.exploreMap') || 'Explore the Map'} <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
