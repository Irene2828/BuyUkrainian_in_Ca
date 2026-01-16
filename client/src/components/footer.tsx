import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-black text-[#fafafa] pb-10 font-sans overflow-hidden relative">
      {/* Central Container - Tightened Grid */}
      <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-12 px-8 pt-16 pb-24">

        {/* Column 1: Navigation (Action Links) */}
        <div className="flex flex-col gap-4">
          <h4 className="text-[12px] font-bold uppercase tracking-widest text-slate-400 mb-2">
            NAVIGATION
          </h4>
          <div className="flex flex-col gap-3">
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
        <div className="flex flex-col gap-4">
          <h4 className="text-[12px] font-bold uppercase tracking-widest text-slate-400 mb-2">
            ABOUT
          </h4>
          <div className="flex flex-col gap-3">
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

        {/* Column 3: Community (New) */}
        <div className="flex flex-col gap-4">
          <h4 className="text-[12px] font-bold uppercase tracking-widest text-slate-400 mb-2">
            COMMUNITY
          </h4>
          <div className="flex flex-col gap-3">
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

      {/* Bottom Bar - Legal/Copyright */}
      <div className="max-w-4xl mx-auto px-8 border-t border-slate-800/50 mt-16 pt-8 flex justify-between items-center text-[12px] text-slate-500">
        <div>
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
    </footer>
  );
}
