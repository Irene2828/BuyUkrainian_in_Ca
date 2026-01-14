import React from "react";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function PreFooter() {
    const { t, language } = useI18n();
    return (
        <section className="pre-footer-new-container">
            {/* 100px gap from Spread the Word is handled by margin-top on the container in App.css */}

            {/* Slogans centered horizontally and vertically within the background image */}
            <div className="pre-footer-visual-wrapper">
                <img
                    src="/assets/footer1.png"
                    alt=""
                    className="pre-footer-outlined-image"
                />

                {/* Mission Statement - Single Language */}
                <div className="flex flex-col items-center gap-5 py-20">
                    {/* Show appropriate slogan based on language */}
                    {language === 'en' ? (
                        <div className="text-2xl font-semibold tracking-tight text-gray-900 leading-snug font-ui text-center max-w-2xl">
                            Buy Ukrainian - Support Ukraine.<br />
                            Every small action matters.
                        </div>
                    ) : (
                        <div className="text-2xl font-semibold tracking-tight text-gray-900 leading-snug font-ui text-center max-w-2xl">
                            Купуй українське. Підтримуй Україну.<br />
                            Це твій вклад у майбутнє - тут і зараз.
                        </div>
                    )}


                    {/* CTA Button */}
                    <Link
                        href="/map"
                        className="btn-cta inline-flex items-center justify-center bg-black text-white rounded-full h-[50px] py-3 pl-6 pr-7 text-[16px] font-semibold gap-3 font-ui shadow-lg mt-6"
                    >
                        {t('header.exploreMap')} <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
