import { Search, MapPin, Share2 } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    {
      icon: Search,
      title: "Looking for authentic products Made in Ukraine?",
      text: "Explore our verified directory to find what you need with instant directions.",
    },
    {
      icon: MapPin,
      title: "Found a new product on the shelf?",
      text: "Add it to the map. With less than two minutes of your time, you can help the map grow, and help Ukrainian companies sell products in Canada.",
    },
    {
      icon: Share2,
      title: "Want to help the Ukrainian economy?",
      text: "Share the map with your network via social media, word of mouth, email, or any other way possible. The more people that use the map, the more you help Ukrainian companies sell products in Canada.",
    },
  ];

  return (
    <section id="how-it-works" className="font-sans overflow-hidden bg-white">
      <div className="w-full flex flex-col md:flex-row">
        
        {/* Left Column: Yellow Block (Image) - 38% width */}
        <div className="w-full md:w-[38%] bg-[#FFD700] p-8 flex items-center justify-center min-h-[450px] md:min-h-[550px]">
          {/* White Photo Frame - Centered with barely visible shadow */}
          <div className="bg-white w-full max-w-xs sm:max-w-sm aspect-square p-6 md:p-8 shadow-sm border border-slate-100/50 flex items-center justify-center relative">
            <img 
              src="/ukrainian_pottery.png" 
              alt="Ukrainian Pottery" 
              className="w-full h-full object-contain mix-blend-multiply"
            />
          </div>
        </div>

        {/* Right Column: Blue Block (Text) - 62% width */}
        <div className="w-full md:w-[62%] bg-[#0057B7] p-8 md:p-12 lg:p-16 flex flex-col gap-8 justify-center items-center">
          {steps.map((step, index) => (
            <div
              key={index}
              className="w-full max-w-2xl z-10 relative flex items-start gap-6"
            >
              {/* Icon Wrapper */}
              <div className="shrink-0 pt-1">
                <step.icon className="w-6 h-6 text-white" strokeWidth={2} />
              </div>
              
              {/* Content */}
              <div className="text-reveal flex-1 flex flex-col pt-0.5 min-w-0" style={{ transitionDelay: `${index * 80}ms` }}>
                <h3 className="text-white font-bold text-[18px] mb-2 leading-tight w-full whitespace-normal">
                  {step.title}
                </h3>
                <p className="text-white/85 font-normal text-[16px] leading-relaxed">
                  {step.text}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
