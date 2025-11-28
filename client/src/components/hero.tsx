import { Button } from "@/components/ui/button";
import { MapPin, Plus } from "lucide-react";
import heroBg from "@assets/generated_images/subtle_ukrainian_pattern_background.png";
import { Link } from "wouter";

export function Hero() {
  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-[#FFFDEE] to-[#EEF7FF] py-12 md:py-24 lg:py-32">
      {/* Background Image Overlay */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.15] mix-blend-multiply pointer-events-none"
        style={{ 
          backgroundImage: `url(${heroBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />
      
      <div className="container relative z-10 mx-auto px-6 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-8 max-w-2xl mx-auto lg:mx-0">
            <h1 className="text-[28px] leading-tight md:text-[40px] lg:text-[56px] font-bold tracking-tight text-foreground">
              Discover Ukrainian Products in Canada
            </h1>
            
            <p className="text-[15px] md:text-lg text-muted-foreground max-w-[500px] leading-relaxed">
              Find and share Ukrainian-made products sold across Canada. 
              Build a community map of local businesses supporting Ukraine.
            </p>

            <div className="flex flex-col md:flex-row w-full md:w-auto gap-3 md:gap-4 pt-2">
              <Link href="/map" className="w-full md:w-auto">
                <Button className="w-full h-12 rounded-full bg-black text-white hover:bg-black/80 text-base font-medium px-8 shadow-lg shadow-black/5">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              </Link>
              <Link href="/map" className="w-full md:w-auto">
                <Button variant="outline" className="w-full h-12 rounded-full border-1.5 border-black/10 hover:bg-black/5 text-base font-medium px-8 bg-white">
                  <MapPin className="w-4 h-4 mr-2" />
                  Explore Map
                </Button>
              </Link>
            </div>
          </div>

          {/* Desktop visual (optional, maybe a floating card or illustration if needed, but spec focuses on center content for mobile, left for desktop) */}
          <div className="hidden lg:block relative h-[400px] w-full">
             {/* We can put a decorative element here or just leave it as whitespace/gradient 
                 Spec says: "Increase image/gradient height" for desktop. 
                 Let's leave it clean or maybe add a floating element later.
             */}
          </div>
        </div>
      </div>
    </section>
  );
}
