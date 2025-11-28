import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-[#F8F8F8] pt-16 pb-8 border-t border-border/40">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Column 1 */}
          <div className="space-y-4">
            <h4 className="font-semibold text-base">About BlueYellow.ca</h4>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Connecting Ukrainians in Canada with products from home. 
              A community-driven platform to support authentic businesses.
            </p>
          </div>

          {/* Column 2 */}
          <div className="space-y-4">
            <h4 className="font-semibold text-base">Quick Links</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/map" className="hover:text-blue-accent transition-colors">Find Products</Link></li>
              <li><Link href="/map" className="hover:text-blue-accent transition-colors">Add Location</Link></li>
              <li><a href="#how-it-works" className="hover:text-blue-accent transition-colors">How It Works</a></li>
              <li><a href="#about" className="hover:text-blue-accent transition-colors">About Us</a></li>
            </ul>
          </div>

          {/* Column 3 */}
          <div className="space-y-4">
            <h4 className="font-semibold text-base">Support</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#faq" className="hover:text-blue-accent transition-colors">FAQ</a></li>
              <li><a href="mailto:hello@blueyellow.ca" className="hover:text-blue-accent transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-blue-accent transition-colors">Community Guidelines</a></li>
              <li><a href="#" className="hover:text-blue-accent transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Column 4 - Admin */}
          <div className="space-y-4">
            <h4 className="font-semibold text-base">Admin</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link href="/admin/login" className="hover:text-blue-accent transition-colors font-medium">
                  Dashboard
                </Link>
              </li>
              <li><span className="text-xs text-gray-400">For moderators only</span></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-black/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>© 2025 BlueYellow.ca</span>
          </div>
          <div className="flex items-center gap-1">
            <span>Made with</span>
            <span className="text-yellow-accent">♥</span>
            <span>for the Ukrainian community in Canada</span>
          </div>
          <a href="mailto:hello@blueyellow.ca" className="hover:text-blue-accent transition-colors">hello@blueyellow.ca</a>
        </div>
      </div>
    </footer>
  );
}
