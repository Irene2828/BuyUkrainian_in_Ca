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

                {/* Mission Statement - Typographic Layering */}
                <div className="flex flex-col items-center gap-2 py-32">
                    {/* Show appropriate slogan based on language */}
                    {language === 'en' ? (
                        <div className="flex flex-col items-center text-center max-w-2xl gap-4">
                            {/* Primary Line */}
                            <h2 className="font-bold tracking-tight text-gray-900 font-header" style={{ fontSize: '24px' }}>
                                Buy Ukrainian — Support Ukraine
                            </h2>
                            {/* Secondary Line - Same size, 60% opacity */}
                            <p className="font-normal tracking-tight text-gray-900/60 font-header" style={{ fontSize: '24px' }}>
                                Every purchase, every share matters.
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center text-center max-w-2xl gap-4">
                            {/* Primary Line */}
                            <h2 className="font-bold tracking-tight text-gray-900 font-header whitespace-nowrap" style={{ fontSize: '24px' }}>
                                Купуй українське — Підтримуй Україну
                            </h2>
                            {/* Secondary Line - Same size, 60% opacity */}
                            <p className="font-normal tracking-tight text-gray-900/60 font-header" style={{ fontSize: '24px' }}>
                                Every purchase, every share matters.
                            </p>
                        </div>
                    )}


                    {/* CTA Button */}
                    <Link
                        href="/map"
                        className="btn-cta inline-flex items-center justify-center rounded-full h-[50px] py-3 pl-6 pr-7 text-[16px] font-semibold gap-3 font-ui shadow-none mt-6 hover:bg-white hover:text-black hover:ring-1 hover:ring-black"
                        style={{ backgroundColor: '#000000', color: '#ffffff' }}
                    >
                        {t('header.exploreMap') || 'Explore the Map'} <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
