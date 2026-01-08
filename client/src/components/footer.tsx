import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-black text-[#fafafa] h-[346px] pt-0 px-[64px] font-sans overflow-hidden relative">
      <div className="mx-auto max-w-[1440px] h-full relative">

        <div className="flex justify-start gap-[160px] pt-8">
          {/* Column 1: Action links - Left Aligned Links */}
          <div className="flex flex-col gap-4">
            <h4 className="text-[14px] font-bold text-white uppercase tracking-wider">Action links</h4>
            <div className="flex flex-col gap-3">
              <Link href="/map" className="text-[16px] text-[#BBBBBB] hover:text-[#D3E4FD] transition-colors font-medium">Store map</Link>
              <Link href="/about" className="text-[16px] text-[#BBBBBB] hover:text-[#D3E4FD] transition-colors font-medium">Add a store</Link>
              <a href="/#how-it-works" className="text-[16px] text-[#BBBBBB] hover:text-[#D3E4FD] transition-colors font-medium">How it works</a>
            </div>
          </div>

          {/* Column 2: Help - Left Aligned Links */}
          <div className="flex flex-col gap-4">
            <h4 className="text-[14px] font-bold text-white uppercase tracking-wider">Help</h4>
            <div className="flex flex-col gap-3">
              <a href="/#faq" className="text-[16px] text-[#BBBBBB] hover:text-[#D3E4FD] transition-colors font-medium">Our mission</a>
              <Link href="/about" className="text-[16px] text-[#BBBBBB] hover:text-[#D3E4FD] transition-colors font-medium">Contact us</Link>
              <Link href="/privacy" className="text-[16px] text-[#BBBBBB] hover:text-[#D3E4FD] transition-colors font-medium">Privacy policy</Link>
            </div>
          </div>
        </div>

        {/* Admin Login - Left Bottom Corner */}
        <div className="absolute bottom-6 left-0">
          <Link href="/admin" className="text-[14px] font-normal text-[#888888] hover:text-[#D3E4FD] transition-colors">
            Admin Login
          </Link>
        </div>

      </div>
    </footer>
  );
}
