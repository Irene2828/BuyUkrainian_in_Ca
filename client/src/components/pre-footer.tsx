import React from "react";

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
                    <div className="pre-footer-italic-slogan section-headline-reveal">
                        Every dollar spent right matters.
                    </div>
                </div>
            </div>
        </section>
    );
}
