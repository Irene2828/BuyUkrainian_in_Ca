import mapBg from "@assets/generated_images/dark_mode_map_of_canada.png";
import { MapPin, ShoppingBag, Store } from "lucide-react";
import { Link } from "wouter";
import { HomeAddForm } from "./home-add-form";

const stats = [
  { icon: MapPin, count: 124, label: "Locations" },
  { icon: ShoppingBag, count: 347, label: "Products" },
  { icon: Store, count: 89, label: "Stores" },
];

export function MapSection() {
  return (
    <section className="py-8 md:py-16 bg-white">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-8 md:mb-12 space-y-2">
          <h2 className="text-xl md:text-2xl font-bold">Discover & Share</h2>
          <p className="text-muted-foreground text-[15px]">Browse the interactive map or add your favorite locations</p>
        </div>

        {/* Two-Column Layout: Map Preview (Left, Wider) + Form (Right) */}
        <div className="grid lg:grid-cols-5 gap-6 items-stretch">
          
          {/* Left: Map Preview (3 columns on lg) */}
          <div className="lg:col-span-3">
            <Link href="/map">
              <div className="relative w-full bg-white rounded-[24px] overflow-hidden shadow-2xl shadow-black/20 group cursor-pointer transition-transform duration-500 hover:scale-[1.01] h-full min-h-[450px]">
                {/* Map Container */}
                <div className="relative w-full h-full">
                  <img 
                    src={mapBg} 
                    alt="Map of Canada" 
                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500"
                  />
                  
                  {/* CSS Overlay Pins - Blue/Yellow Flag style */}
                  {/* Pin 1 */}
                  <div className="absolute top-[60%] left-[20%] transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer hover:scale-125 transition-transform duration-300">
                     <div className="w-4 h-4 md:w-5 md:h-5 rounded-full shadow-[0_0_15px_rgba(255,215,0,0.4)] border border-white/20"
                          style={{ background: 'linear-gradient(to bottom, #1E90FF 50%, #FFD700 50%)' }}>
                     </div>
                  </div>
                  {/* Pin 2 */}
                  <div className="absolute top-[70%] left-[25%] transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer hover:scale-125 transition-transform duration-300">
                     <div className="w-4 h-4 md:w-5 md:h-5 rounded-full shadow-[0_0_15px_rgba(255,215,0,0.4)] border border-white/20"
                          style={{ background: 'linear-gradient(to bottom, #1E90FF 50%, #FFD700 50%)' }}>
                     </div>
                  </div>
                  {/* Pin 3 */}
                  <div className="absolute top-[65%] left-[45%] transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer hover:scale-125 transition-transform duration-300">
                     <div className="w-4 h-4 md:w-5 md:h-5 rounded-full shadow-[0_0_15px_rgba(255,215,0,0.4)] border border-white/20"
                          style={{ background: 'linear-gradient(to bottom, #1E90FF 50%, #FFD700 50%)' }}>
                     </div>
                  </div>
                  
                  {/* Gradient overlay for text readability at bottom */}
                  <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black/60 to-transparent"></div>
                  
                  {/* Call to Action Overlay on Hover */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="px-6 py-3 bg-white/90 backdrop-blur rounded-full text-black font-bold shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      Open Interactive Map
                    </span>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="absolute bottom-0 left-0 w-full bg-black/50 backdrop-blur-sm border-t border-white/10 pointer-events-none">
                  <div className="grid grid-cols-3 divide-x divide-white/10">
                    {stats.map((stat, i) => (
                      <div key={i} className="flex flex-col items-center justify-center py-4 md:py-6">
                        <stat.icon className="w-5 h-5 md:w-6 md:h-6 text-yellow-accent mb-1 md:mb-2" />
                        <span className="text-lg md:text-2xl font-bold text-white">{stat.count}</span>
                        <span className="text-[11px] md:text-sm text-gray-400 uppercase tracking-wider font-medium">{stat.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Right: Add Form (2 columns on lg) */}
          <div className="lg:col-span-2">
            <HomeAddForm />
          </div>
        </div>
      </div>
    </section>
  );
}
