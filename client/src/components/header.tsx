import { Link } from "wouter";
import { Menu, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between max-w-7xl">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="relative w-4 h-4 rounded-full bg-blue-accent flex items-center justify-center overflow-hidden">
            <div className="absolute bottom-0 w-full h-1/2 bg-yellow-accent"></div>
          </div>
          <span className="font-semibold text-lg tracking-tight">BlueYellow.ca</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <a href="#about" className="text-sm font-medium hover:text-blue-accent transition-colors">About the Project</a>
          <a href="#how-it-works" className="text-sm font-medium hover:text-blue-accent transition-colors">How It Works</a>
          <a href="#faq" className="text-sm font-medium hover:text-blue-accent transition-colors">FAQ</a>
        </nav>

        {/* CTA / Mobile Menu */}
        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            <Link href="/map">
              <Button className="rounded-full px-6 h-10 bg-yellow-accent text-black hover:bg-yellow-400 border-none font-medium">
                Add a New Product
              </Button>
            </Link>
          </div>
          <div className="hidden md:block">
             <Link href="/map">
               <Button variant="outline" className="rounded-full px-6 h-10 border-border">
                Explore the Map
              </Button>
             </Link>
          </div>
          
          {/* Mobile Actions - Spec says "3 text links: About, FAQ, Add Product" in top bar for mobile? 
             Wait, spec says: "Right: 3 text links: About · FAQ · Add Product"
             Let's try to fit them or use a clean approach. 
             Actually, 3 text links might be tight on small screens. 
             Let's follow the spec "Right: 3 text links" literally but style them small.
          */}
          <div className="flex md:hidden items-center gap-4">
             <a href="#about" className="text-xs font-medium text-foreground/80">About</a>
             <a href="#faq" className="text-xs font-medium text-foreground/80">FAQ</a>
             <Link href="/map" className="text-xs font-bold text-blue-accent">Add Product</Link>
          </div>
        </div>
      </div>
    </header>
  );
}
