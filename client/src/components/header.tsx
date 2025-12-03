import { Link, useLocation } from "wouter";
import { Plus, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export function Header() {
  const [, navigate] = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border/50">
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
          <Link href="/about" className="text-sm font-medium hover:text-blue-accent transition-colors">About the Project</Link>
          <a href="/#how-it-works" className="text-sm font-medium hover:text-blue-accent transition-colors">How It Works</a>
          <a href="/#faq" className="text-sm font-medium hover:text-blue-accent transition-colors">FAQ</a>
        </nav>

        {/* CTA / Mobile Menu */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <div className="hidden md:block">
            <Button 
              className="rounded-full px-6 h-10 bg-yellow-accent text-black hover:bg-yellow-400 border-none font-medium"
              onClick={() => navigate("/map")}
              data-testid="button-add-product-header"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add a New Product
            </Button>
          </div>
          <div className="hidden md:block">
            <Button 
              variant="outline" 
              className="rounded-full px-6 h-10 border-border"
              onClick={() => navigate("/map")}
              data-testid="button-explore-map-header"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Explore the Map
            </Button>
          </div>
          
          {/* Mobile Actions */}
          <div className="flex md:hidden items-center gap-4">
             <Link href="/about" className="text-xs font-medium text-foreground/80">About</Link>
             <a href="/#faq" className="text-xs font-medium text-foreground/80">FAQ</a>
             <Button 
               variant="ghost"
               className="text-xs font-bold text-blue-accent p-0 h-auto"
               onClick={() => navigate("/map")}
               data-testid="button-add-product-mobile"
             >
               Add Product
             </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
