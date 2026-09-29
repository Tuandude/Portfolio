/**
 * Footer component — terminal footer banner.
 * Features full-width infinite marquee ticker ("LET'S BUILD SOMETHING"),
 * separator line, copyright text, and an interactive "Back to top" button powered by Lenis.
 */
import { ArrowUp } from "lucide-react";
import Marquee from "@/components/ui/Marquee";

export interface FooterProps {
  className?: string;
}

export function Footer({ className = "" }: FooterProps) {
  const handleBackToTop = () => {
    if (window.__lenis) {
      window.__lenis.scrollTo("#hero", { duration: 1.2 });
    } else {
      const el = document.getElementById("hero");
      el?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer
      className={`relative w-full bg-bg border-t border-stroke overflow-hidden ${className}`}
    >
      {/* 1. Full-Width Marquee Row */}
      <div className="py-12 md:py-16 border-b border-stroke/60 bg-surface/20">
        <Marquee
          text="LET'S BUILD SOMETHING • "
          speedSeconds={35}
          className="font-display italic text-3xl md:text-5xl lg:text-6xl text-text-muted select-none"
        />
      </div>

      {/* 2. Bottom Row */}
      <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row justify-between items-center py-8 px-4 sm:px-6 md:px-10 gap-4">
        {/* Left: Copyright text */}
        <p className="font-body text-xs sm:text-sm text-text-subtle text-center sm:text-left">
          © {new Date().getFullYear()} Tuan Dang. All rights reserved.
        </p>

        {/* Right: Back to top button */}
        <button
          type="button"
          onClick={handleBackToTop}
          aria-label="Scroll back to top"
          className="group inline-flex items-center gap-2 font-mono text-xs text-text-muted hover:text-text transition-colors duration-200 cursor-pointer bg-transparent border-none p-1 focus-visible:outline-accent-start"
        >
          <span>Back to top</span>
          <ArrowUp className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-0.5" />
        </button>
      </div>
    </footer>
  );
}

export default Footer;
