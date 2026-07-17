const fs = require('fs');
const content = fs.readFileSync('client/src/components/hero.tsx', 'utf-8');

// Add imports
let newContent = content.replace(
  'import heroFlagsBlend from "@/assets/flags_bg.png";',
  'import heroFlagsBlend from "@/assets/flags_bg.png";\nimport wheatFieldBg from "@/assets/golden_wheat_sunset.png";\nimport mapleLeafIcon from "@/assets/maple_leaf.png";'
);

// Replace the hero body
const startMarker = '<div className="flex flex-col h-auto md:min-h-[calc(100vh-81px)]';
const endMarker = '<div className="md:hidden mt-6 flex w-[calc(100%+1rem)] gap-3 overflow-x-auto snap-x snap-mandatory hide-scrollbar pr-[8.5rem] pb-1 pointer-events-auto">';

const startIndex = newContent.indexOf(startMarker);
const endIndex = newContent.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.log("Could not find markers!");
  process.exit(1);
}

const replacement = `        <div className="flex flex-col h-auto md:min-h-[calc(100vh-81px)] 2xl:min-h-[calc(100vh-108px)] min-[1670px]:min-h-[calc(100vh-108px)] bg-[#0057B7] md:bg-transparent justify-between relative">
        <section
            className="flex-1 relative z-10 w-full max-w-[1920px] mx-auto overflow-hidden font-sans flex items-start pt-0 mt-0 animate-in fade-in duration-700"
        >
            <div className="hidden md:block absolute top-0 left-0 w-[64%] h-full bg-[#0057B7] z-[-1]" />
            <div className="hidden md:block absolute top-0 right-0 w-[36%] h-full bg-white z-[-1]" />

            <div className="boutique-width w-full flex items-center relative z-30 h-full pointer-events-none">
                <div className="w-full">
                    <div className="hero-canopy-safe-content relative z-20 w-full max-w-full md:max-w-[520px] lg:max-w-2xl h-full flex flex-col justify-center items-start pointer-events-none pb-[11.75rem] md:py-[4.8rem]">
                    <div className="relative z-10 flex w-full flex-col items-start">
                        <div className="relative w-full min-[1280px]:max-[1669px]:pt-[clamp(30px,3.5vw,60px)] min-[1670px]:pt-[clamp(121px,11vw,192px)]">
                            <div className="relative z-10 flex flex-col items-start w-fit hero-text-align transition-transform duration-300 mt-[5vh] md:ml-[50px] lg:ml-[65px] xl:ml-[75px] md:-translate-x-[10%]">
                                    <h1
                                        className="relative z-10 w-full max-w-[calc(100vw-2.5rem)] md:max-w-none leading-[0.95] md:leading-[0.95] min-[1670px]:leading-[0.95] antialiased mb-6 md:mb-10 text-white uppercase font-bold"
                                        style={{ WebkitFontSmoothing: 'antialiased', textRendering: 'optimizeLegibility' }}
                                    >
                                        <span 
                                            className="block font-['Inter'] font-[900] text-[clamp(2.5rem,8.8vw,3.5rem)] md:text-[3.2rem] lg:text-[4rem] min-[1500px]:text-[4.5rem] min-[1670px]:text-[5rem] tracking-[-0.02em] mb-0 text-transparent"
                                            style={{ 
                                                backgroundImage: \`linear-gradient(rgba(255, 215, 0, 0.2), rgba(255, 215, 0, 0.2)), url(\${wheatFieldBg})\`,
                                                backgroundSize: '120%',
                                                backgroundPosition: 'center 60%',
                                                WebkitBackgroundClip: 'text',
                                                backgroundClip: 'text',
                                                color: 'transparent',
                                                filter: 'brightness(1.3)'
                                            }}
                                        >
                                            DISCOVER
                                        </span>
                                        <div className="md:ml-0">
                                            <span 
                                                className="block font-['Inter'] font-[900] text-[clamp(2.5rem,8.8vw,3.5rem)] md:text-[3.2rem] lg:text-[4rem] min-[1500px]:text-[4.5rem] min-[1670px]:text-[5rem] tracking-[-0.02em] mb-2 whitespace-nowrap text-transparent"
                                                style={{ 
                                                    backgroundImage: \`linear-gradient(rgba(255, 215, 0, 0.2), rgba(255, 215, 0, 0.2)), url(\${wheatFieldBg})\`,
                                                    backgroundSize: '120%',
                                                    backgroundPosition: 'center 60%',
                                                    WebkitBackgroundClip: 'text',
                                                    backgroundClip: 'text',
                                                    color: 'transparent',
                                                    filter: 'brightness(1.3)'
                                                }}
                                            >
                                                UKRAINIAN PRODUCTS
                                            </span>
                                        </div>
                                    </h1>
                                    
                                    {/* Subline and CTA Wrapper */}
                                    <div className="flex flex-col items-start self-start md:self-end w-full mt-[-2.2rem] md:mt-[-3.2rem] mb-6 md:mb-10 gap-4">
                                        <span className="relative z-10 flex items-center self-start md:self-end font-['Inter'] text-[clamp(1.56rem,5.2vw,1.95rem)] md:text-[1.8rem] lg:text-[2.34rem] min-[1500px]:text-[2.6rem] font-normal tracking-[-0.01em] opacity-90 normal-case text-white">
                                            sold across Canada 
                                            <img src={mapleLeafIcon} alt="" className="inline-block w-[0.8em] h-[0.8em] ml-[0.3em] opacity-90" aria-hidden="true" />
                                        </span>
                                        <div className="flex flex-col md:flex-row gap-4 items-center self-start md:self-end w-full md:w-auto relative z-20 pointer-events-auto">
                                            <Button 
                                                className="bg-[#F8F9FA] text-[#0057B7] hover:bg-white border-0 font-medium tracking-tight rounded-full text-[1rem] px-8 h-12 md:h-14 transition-all duration-300 w-full md:w-auto whitespace-nowrap font-['Inter'] hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] active:scale-[0.98]"
                                                onClick={() => {
                                                    const win = window as any;
                                                    win.mapState?.setViewState({
                                                        longitude: -98.0,
                                                        latitude: 54.5,
                                                        zoom: 4,
                                                        transitionDuration: 1500,
                                                        transitionEasing: (t => t * (2 - t))
                                                    });
                                                }}
                                            >
                                                Find stores near me <Search className="w-[1.2em] h-[1.2em] ml-2 opacity-80" />
                                            </Button>
                                            
                                            <Button 
                                                variant="ghost" 
                                                className="text-white hover:text-white hover:bg-white/10 h-12 md:h-14 px-6 rounded-full font-medium transition-all w-full md:w-auto font-['Inter'] text-[0.95rem]"
                                                onClick={() => {
                                                    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                                }}
                                            >
                                                How it works <ChevronDown className="w-4 h-4 ml-2 opacity-70" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

                                `;
newContent = newContent.substring(0, startIndex) + replacement + newContent.substring(endIndex);

fs.writeFileSync('client/src/components/hero.tsx', newContent);
console.log("Replaced successfully!");
