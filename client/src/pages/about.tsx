import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { MapPin, Heart, Users, Globe, Flag, ShoppingBag } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col pt-[100px]">
      <Header />

      <main className="flex-1">
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-sm font-medium mb-6">
                <Flag className="w-4 h-4" />
                About BuyUkrainian.ca
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 section-headline-reveal" data-testid="about-title">
                Connecting Canadians with{" "}
                <span className="text-blue-accent">Ukrainian</span>{" "}
                <span className="text-yellow-accent">Products</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                BuyUkrainian.ca is an independent, grassroots initiative aimed to support Ukraine’s economy by helping people find products from Ukraine in Canadian stores.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-16">
              <div className="bg-card border rounded-2xl p-8">
                <Heart className="w-10 h-10 text-blue-accent mb-4" />
                <h3 className="text-xl font-semibold mb-3 section-headline-reveal">Our Mission</h3>
                <p className="text-muted-foreground">
                  We believe in the power of community. Our mission is to create a comprehensive
                  directory that makes it easy to find Ukrainian products across Canada, from
                  traditional foods and crafts to modern Ukrainian-made goods.
                </p>
              </div>

              <div className="bg-card border rounded-2xl p-8">
                <Users className="w-10 h-10 text-yellow-accent mb-4" />
                <h3 className="text-xl font-semibold mb-3 section-headline-reveal">Community-Powered</h3>
                <p className="text-muted-foreground">
                  Every pin on our map comes from community members like you. Submit your
                  favorite Ukrainian stores and products, and help others discover the
                  treasures of Ukrainian culture.
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-yellow-50 dark:from-blue-950/50 dark:to-yellow-950/50 rounded-3xl p-8 md:p-12 mb-16">
              <h2 className="text-2xl md:text-3xl font-semibold font-['Lora'] tracking-tight mb-6 text-center text-[var(--color-section-headline)] section-headline-reveal">Why BuyUkrainian?</h2>
              <div className="grid sm:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-blue-accent/10 flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-8 h-8 text-blue-accent" />
                  </div>
                  <h4 className="font-semibold mb-2">Easy Discovery</h4>
                  <p className="text-sm text-muted-foreground">
                    Find Ukrainian stores and products near you with our interactive map.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-yellow-accent/10 flex items-center justify-center mx-auto mb-4">
                    <ShoppingBag className="w-8 h-8 text-yellow-accent" />
                  </div>
                  <h4 className="font-semibold mb-2">Authentic Products</h4>
                  <p className="text-sm text-muted-foreground">
                    From honey to embroidery, discover genuine Ukrainian goods.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-blue-accent/10 flex items-center justify-center mx-auto mb-4">
                    <Globe className="w-8 h-8 text-blue-accent" />
                  </div>
                  <h4 className="font-semibold mb-2">Coast to Coast</h4>
                  <p className="text-sm text-muted-foreground">
                    Growing database of locations across all Canadian provinces.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <h2 className="text-2xl font-semibold font-['Lora'] tracking-tight mb-4 text-[var(--color-section-headline)] section-headline-reveal">Ready to Explore?</h2>
              <p className="text-muted-foreground mb-6">
                Discover Ukrainian products in your area or add a location you know about.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/map">
                  <Button className="rounded-[32px] px-8 h-12 bg-[#0057B7] hover:bg-[#0047A0] hover:scale-[1.02] tracking-normal text-white" data-testid="button-explore-map">
                    <MapPin className="w-5 h-5 mr-2" />
                    Explore the Map
                  </Button>
                </Link>
                <Link href="/map">
                  <Button variant="outline" className="rounded-[32px] px-8 h-12 tracking-normal" data-testid="button-add-location">
                    Add a Location
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
