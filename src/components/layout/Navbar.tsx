/**
 * Navbar component — fixed floating pill navigation.
 * Desktop: floating pill at top-center with scroll shadow.
 * Mobile (<768px): compact pill with logo + menu button, opening full-screen overlay.
 * Follows Design Tokens v4 and accessibility standards with active scroll spy.
 */
import { useState, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useMotionTemplate,
  useReducedMotion,
} from "framer-motion";
import { Menu, X } from "lucide-react";

interface NavLinkItem {
  name: string;
  href: string;
  id: string;
}

const NAV_LINKS: NavLinkItem[] = [
  { name: "Home", href: "#hero", id: "hero" },
  { name: "About", href: "#about", id: "about" },
  { name: "Projects", href: "#projects", id: "projects" },
  { name: "Contact", href: "#contact", id: "contact" },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const prefersReducedMotion = useReducedMotion() ?? false;

  const { scrollY } = useScroll();
  const shadowOpacity = useTransform(scrollY, [0, 20], [0, 0.4]);
  const dynamicBoxShadow = useMotionTemplate`0 8px 32px rgba(0, 0, 0, ${shadowOpacity})`;

  // IntersectionObserver to spy on active section as user scrolls
  useEffect(() => {
    const observerCallback: IntersectionObserverCallback = (entries) => {
      // Find the entry with highest intersection ratio or topmost visible
      const visibleEntries = entries.filter((e) => e.isIntersecting);
      if (visibleEntries.length > 0) {
        // Sort by bounding client top to prefer the current reading section
        visibleEntries.sort((a, b) => Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top));
        setActiveSection(visibleEntries[0].target.id);
      }
    };

    const observer = new IntersectionObserver(observerCallback, {
      root: null,
      rootMargin: "-20% 0px -60% 0px", // Focus trigger zone in viewport upper half
      threshold: [0, 0.2, 0.5],
    });

    NAV_LINKS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Handle ESC key to close mobile menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  // Lock body scroll and stop Lenis when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
      window.__lenis?.stop();
    } else {
      document.body.style.overflow = "";
      window.__lenis?.start();
    }
    return () => {
      document.body.style.overflow = "";
      window.__lenis?.start();
    };
  }, [mobileMenuOpen]);

  const handleLinkClick = (id: string) => {
    setActiveSection(id);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <motion.nav
        aria-label="Primary"
        style={prefersReducedMotion ? undefined : { boxShadow: dynamicBoxShadow }}
        className="fixed top-6 left-1/2 -translate-x-1/2 z-[50] rounded-full border border-stroke bg-bg/75 px-4 md:px-6 py-2.5 backdrop-blur-xl transition-[border-color] duration-300 hover:border-stroke-hover shadow-lg shadow-black/20"
      >
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <a
            href="#hero"
            onClick={() => handleLinkClick("hero")}
            className="font-display italic text-lg font-bold text-text tracking-tight hover:opacity-80 transition-opacity"
            aria-label="Tuấn Đặng home"
          >
            TD
          </a>

          <div className="h-4 w-[1px] bg-stroke" aria-hidden="true" />

          <ul className="flex items-center gap-1 list-none p-0 m-0">
            {NAV_LINKS.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <li key={link.name}>
                  <a
                    href={link.href}
                    onClick={() => handleLinkClick(link.id)}
                    aria-current={isActive ? "page" : undefined}
                    className={`rounded-full px-3.5 py-1.5 font-body text-sm font-medium transition-colors duration-200 ${
                      isActive
                        ? "bg-stroke/60 text-text"
                        : "text-text-muted hover:text-text hover:bg-stroke/30"
                    }`}
                  >
                    {link.name}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Mobile Navigation Bar (<768px) */}
        <div className="flex md:hidden items-center justify-between gap-4">
          <a
            href="#hero"
            onClick={() => handleLinkClick("hero")}
            className="font-display italic text-base font-bold text-text px-1"
            aria-label="TD home"
          >
            TD
          </a>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label="Open mobile navigation menu"
            className="flex items-center justify-center p-1 text-text-muted hover:text-text focus-visible:outline-accent-start cursor-pointer"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </motion.nav>

      {/* Mobile Full-Screen Overlay Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation"
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
            transition={{
              duration: prefersReducedMotion ? 0.15 : 0.3,
              ease: [0.25, 0.1, 0.25, 1.0],
            }}
            className="fixed inset-0 z-[60] flex flex-col justify-between bg-bg/95 backdrop-blur-2xl p-8"
          >
            {/* Top Close Bar */}
            <div className="flex items-center justify-between">
              <span className="font-display italic text-2xl font-bold text-text">
                Tuan Dang
              </span>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close mobile navigation menu"
                className="flex items-center justify-center p-2 rounded-full border border-stroke bg-surface text-text-muted hover:text-text focus-visible:outline-accent-start cursor-pointer"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Centered Large Nav Links */}
            <nav className="flex flex-col items-center justify-center gap-8 my-auto">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => handleLinkClick(link.id)}
                  className="font-display italic text-4xl sm:text-5xl text-text hover:text-accent-start transition-colors no-underline"
                >
                  {link.name}
                </a>
              ))}
            </nav>

            {/* Bottom info */}
            <div className="text-center font-mono text-xs text-text-muted">
              // AI Student · Ho Chi Minh City
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Navbar;
