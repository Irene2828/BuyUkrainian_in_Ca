import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-black text-[#fafafa] py-16 md:py-20 px-6 md:px-16 font-sans overflow-hidden relative">
      <div className="mx-auto max-w-[1440px] h-full relative">

        {/* Three Column Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16 mb-12">

          {/* Column 1: Navigation (Action Links) */}
          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              NAVIGATION
            </h4>
            <div className="flex flex-col gap-3">
              <Link
                href="/map"
                className="text-sm text-slate-300 hover:text-white transition-colors font-normal"
              >
                Explore Map
              </Link>
              <Link
                href="/map"
                className="text-sm text-slate-300 hover:text-white transition-colors font-normal"
              >
                Add a Store
              </Link>
              <a
                href="/#how-it-works"
                className="text-sm text-slate-300 hover:text-white transition-colors font-normal"
              >
                How it works
              </a>
            </div>
          </div>

          {/* Column 2: About (Help) */}
          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              ABOUT
            </h4>
            <div className="flex flex-col gap-3">
              <a
                href="/#faq"
                className="text-sm text-slate-300 hover:text-white transition-colors font-normal"
              >
                Our Mission
              </a>
              <Link
                href="/about"
                className="text-sm text-slate-300 hover:text-white transition-colors font-normal"
              >
                Contact us
              </Link>
              <Link
                href="/privacy"
                className="text-sm text-slate-300 hover:text-white transition-colors font-normal"
              >
                Privacy Policy
              </Link>
            </div>
          </div>

          {/* Column 3: Community (New) */}
          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              COMMUNITY
            </h4>
            <div className="flex flex-col gap-3">
              <a
                href="/#spread-the-word"
                className="text-sm text-slate-300 hover:text-white transition-colors font-normal"
              >
                Spread the Word
              </a>
              <Link
                href="/about"
                className="text-sm text-slate-300 hover:text-white transition-colors font-normal"
              >
                Volunteer
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Utility Row - Copyright and Admin */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-slate-800">
          <div className="text-xs text-slate-500 mb-4 md:mb-0">
            © 2026 BuyUkrainian.ca. All rights reserved.
          </div>

          {/* Discreet Admin Link */}
          <Link
            href="/admin/login"
            className="text-[10px] text-slate-500 hover:text-white transition-colors"
          >
            Admin
          </Link>
        </div>

      </div>
    </footer>
  );
}
