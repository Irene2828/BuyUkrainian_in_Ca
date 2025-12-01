import { Facebook, Twitter, Instagram, Linkedin, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SpreadTheWord() {
  const socialLinks = [
    {
      icon: Facebook,
      label: "Facebook",
      color: "hover:text-blue-600 hover:bg-blue-50",
      url: "https://www.facebook.com"
    },
    {
      icon: Twitter,
      label: "Twitter",
      color: "hover:text-sky-500 hover:bg-sky-50",
      url: "https://www.twitter.com"
    },
    {
      icon: Instagram,
      label: "Instagram",
      color: "hover:text-pink-600 hover:bg-pink-50",
      url: "https://www.instagram.com"
    },
    {
      icon: Linkedin,
      label: "LinkedIn",
      color: "hover:text-blue-700 hover:bg-blue-50",
      url: "https://www.linkedin.com"
    },
    {
      icon: Mail,
      label: "Email",
      color: "hover:text-gray-700 hover:bg-gray-100",
      url: "mailto:hello@blueyellow.ca"
    }
  ];

  return (
    <section className="py-12 md:py-16 bg-gradient-to-r from-sky-200/70 via-sky-100/60 to-sky-50/50 backdrop-blur-md border-t border-b border-sky-300/60">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold">Spread the Word</h2>
            <p className="text-muted-foreground text-sm md:text-base">
              Help grow the Ukrainian community in Canada by sharing BlueYellow.ca
            </p>
          </div>

          {/* Social Media Icons */}
          <div className="flex items-center justify-center gap-4 flex-wrap">
            {socialLinks.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.label}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-all duration-300"
                >
                  <Button 
                    variant="outline"
                    size="lg"
                    className={`rounded-full w-14 h-14 p-0 border-gray-200 text-gray-600 ${link.color}`}
                    title={link.label}
                  >
                    <Icon className="w-6 h-6" />
                  </Button>
                </a>
              );
            })}
          </div>

          <p className="text-xs text-muted-foreground pt-4">
            Follow us and share BlueYellow.ca with your network
          </p>
        </div>
      </div>
    </section>
  );
}
