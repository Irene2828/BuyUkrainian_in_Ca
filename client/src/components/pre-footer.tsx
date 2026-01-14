import React from "react";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function PreFooter() {
    const { t } = useI18n();
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

                {/* Slogans Container - Centered via Flexbox on the parent */}
                <div className="slogan-container">
                    <div className="pre-footer-main-slogan section-headline-reveal">
                        {t('prefooter.slogan1')}
                    </div>
                    <div className="text-[42px] font-medium text-slate-500 tracking-tight leading-relaxed font-header section-headline-reveal text-center my-6">
                        {t('prefooter.slogan2')}
                    </div>
                    <Link
                        href="/map"
                        className="btn-cta inline-flex items-center justify-center bg-black text-white rounded-full h-[50px] py-3 pl-6 pr-7 text-[16px] font-semibold gap-3 font-ui shadow-lg"
                    >
                        {t('header.exploreMap')} <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
