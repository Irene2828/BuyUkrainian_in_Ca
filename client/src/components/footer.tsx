import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-black text-[#fafafa] pb-10 font-sans overflow-hidden relative">
      {/* Spanning Grid - 2 cols on mobile, Flex on desktop for spacing control */}
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 w-full pt-16 pb-12">
        <div className="grid grid-cols-2 md:flex md:flex-row md:justify-between gap-x-8 gap-y-10 md:gap-12">

          {/* Column 1: Navigation (Action Links) */}
          <div className="flex flex-col">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white opacity-50 mb-4 font-ui">
              NAVIGATION
            </h4>
            <div className="flex flex-col space-y-3">
              <Link
                href="/map"
                className="text-[14px] text-slate-300 hover:text-white transition-colors duration-200"
              >
                Explore Map
              </Link>
              <Link
                href="/map"
                className="text-[14px] text-slate-300 hover:text-white transition-colors duration-200"
              >
                Add a Store
              </Link>
              <a
                href="/#how-it-works"
                className="text-[14px] text-slate-300 hover:text-white transition-colors duration-200"
              >
                How it works
              </a>
            </div>
          </div>

          {/* Column 2: About (Help) */}
          <div className="flex flex-col">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white opacity-50 mb-4 font-ui">
              ABOUT
            </h4>
            <div className="flex flex-col space-y-3">
              <a
                href="/#faq"
                className="text-[14px] text-slate-300 hover:text-white transition-colors duration-200"
              >
                Our Mission
              </a>
              <Link
                href="/about"
                className="text-[14px] text-slate-300 hover:text-white transition-colors duration-200"
              >
                Contact us
              </Link>
              <Link
                href="/privacy"
                className="text-[14px] text-slate-300 hover:text-white transition-colors duration-200"
              >
                Privacy Policy
              </Link>
            </div>
          </div>

          {/* Column 3: Community (Flush Right) */}
          <div className="flex flex-col">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white opacity-50 mb-4 font-ui">
              COMMUNITY
            </h4>
            <div className="flex flex-col space-y-3">
              <a
                href="/#spread-the-word"
                className="text-[14px] text-slate-300 hover:text-white transition-colors duration-200"
              >
                Spread the Word
              </a>
              <Link
                href="/about"
                className="text-[14px] text-slate-300 hover:text-white transition-colors duration-200"
              >
                Volunteer
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar - Legal/Copyright Spanning Full Width */}
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 w-full border-t border-white/10 pt-8 mt-0 flex justify-between text-[12px] text-slate-500">
        <div>
          © 2026 BuyUkrainian.ca. All rights reserved.
        </div>

        {/* Discreet Admin Link - Far Right Corner */}
        <Link
          href="/admin/login"
          className="text-[10px] text-slate-500 hover:text-white transition-colors"
        >
          Admin
        </Link>
      </div>
    </footer>
  );
}
