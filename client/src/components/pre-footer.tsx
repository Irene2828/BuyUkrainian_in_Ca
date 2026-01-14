import React from "react";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

export function PreFooter() {
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
                        Buy Ukrainian. Support Ukraine.
                    </div>
                    <div className="text-[42px] font-medium text-slate-500 tracking-tight leading-relaxed font-header section-headline-reveal">
                        Every choice is a contribution to the mission.
                    </div>
                    <Link
                        href="/map"
                        className="btn-cta inline-flex items-center justify-center bg-black text-white rounded-full h-[50px] py-3 pl-6 pr-7 text-[16px] font-semibold gap-3 font-ui shadow-lg"
                    >
                        Explore the Map <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
