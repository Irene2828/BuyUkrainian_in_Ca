import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { MapPin, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-yellow-50 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="text-center max-w-md">
        <div className="relative w-32 h-32 mx-auto mb-8">
          <div className="absolute inset-0 rounded-full bg-blue-accent opacity-20 animate-ping"></div>
          <div className="relative w-full h-full rounded-full bg-gradient-to-b from-blue-accent to-yellow-accent flex items-center justify-center">
            <MapPin className="w-12 h-12 text-white" />
          </div>
        </div>
        
        <h1 className="text-6xl font-bold text-foreground mb-4" data-testid="text-404">404</h1>
        <h2 className="text-2xl font-semibold text-foreground mb-2">Page Not Found</h2>
        <p className="text-muted-foreground mb-8">
          Oops! This page seems to have wandered off the map. 
          Let's get you back to discovering Ukrainian products.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button className="rounded-[32px] px-6 h-11 bg-[#0057B7] hover:bg-[#0047A0] hover:scale-[1.02] tracking-normal text-white" data-testid="button-go-home">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </Link>
          <Link href="/map">
            <Button variant="outline" className="rounded-[32px] px-6 h-11 tracking-normal" data-testid="button-explore-map">
              <MapPin className="w-4 h-4 mr-2" />
              Explore Map
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
