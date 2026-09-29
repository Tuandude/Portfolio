/**
 * HeroSection component — primary introduction section.
 * Features staggered entrance animations, display typography, rotating tagline,
 * dual call-to-actions with magnetic physics, and an interactive scroll indicator.
 * Complies with Design Tokens v4 and accessibility requirements.
 */
import { motion, useReducedMotion } from "framer-motion";
import RotatingText from "@/components/ui/RotatingText";
import MagneticButton from "@/components/ui/MagneticButton";
import ScrollIndicator from "@/components/ui/ScrollIndicator";

export interface HeroSectionProps {
  className?: string;
}

const EYEBROW_TEXT = "AVAILABLE FOR OPPORTUNITIES";
const EASE_EXPO = [0.16, 1, 0.3, 1] as const;
const EASE_SMOOTH = [0.25, 0.1, 0.25, 1.0] as const;

export function HeroSection({ className = "" }: HeroSectionProps) {
  const prefersReducedMotion = useReducedMotion() ?? false;

  const handleScrollTo = (targetId: string) => {
    const el = document.getElementById(targetId);
    if (!el) return;

    if (window.__lenis) {
      window.__lenis.scrollTo(el, { duration: 1.2 });
    } else {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      className={`relative flex min-h-[100svh] flex-col items-center justify-center px-4 sm:px-6 pt-24 pb-16 text-center ${className}`}
    >
      <div className="flex max-w-4xl flex-col items-center gap-6 z-[10]">
        {/* 1. Eyebrow badge */}
        <motion.div
          initial={
            prefersReducedMotion
              ? { opacity: 0 }
              : { opacity: 0, filter: "blur(8px)", y: 16 }
          }
          animate={
            prefersReducedMotion
              ? { opacity: 1 }
              : { opacity: 1, filter: "blur(0px)", y: 0 }
          }
          transition={{
            duration: prefersReducedMotion ? 0.15 : 0.8,
            delay: prefersReducedMotion ? 0 : 0.3,
            ease: EASE_SMOOTH,
          }}
          className="inline-flex items-center gap-2 rounded-full border border-stroke bg-surface/80 px-4 py-1.5 backdrop-blur-md select-none"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-text-muted">
            {EYEBROW_TEXT}
          </span>
        </motion.div>

        {/* 2. Main Name Heading */}
        <motion.h1
          id="hero-heading"
          initial={
            prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 40 }
          }
          animate={
            prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }
          }
          transition={{
            duration: prefersReducedMotion ? 0.15 : 1.2,
            delay: prefersReducedMotion ? 0 : 0.1,
            ease: EASE_EXPO,
          }}
          style={{ fontSize: "clamp(3rem, 10vw, 8rem)" }}
          className="font-display italic leading-[0.95] tracking-tight heading-gradient"
        >
          Tuấn Đặng
        </motion.h1>

        {/* 3. Rotating Tagline */}
        <motion.div
          initial={
            prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }
          }
          animate={
            prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }
          }
          transition={{
            duration: prefersReducedMotion ? 0.15 : 0.7,
            delay: prefersReducedMotion ? 0 : 0.4,
            ease: EASE_SMOOTH,
          }}
          className="font-body text-lg sm:text-xl md:text-2xl text-text-muted flex items-center justify-center flex-wrap gap-x-2"
        >
          <span>An</span>
          <RotatingText
            words={["AI Student", "Vibe Coder", "Builder"]}
            className="text-text font-medium text-accent-start"
          />
          <span>based in Ho Chi Minh City</span>
        </motion.div>

        {/* 4. Description */}
        <motion.p
          initial={
            prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }
          }
          animate={
            prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }
          }
          transition={{
            duration: prefersReducedMotion ? 0.15 : 0.7,
            delay: prefersReducedMotion ? 0 : 0.45,
            ease: EASE_SMOOTH,
          }}
          className="max-w-lg text-sm sm:text-base md:text-lg leading-relaxed text-text-muted"
        >
          Exploring the intersection of machine learning and creative coding.
          Building products that solve real problems — one commit at a time.
        </motion.p>

        {/* 5. CTA Buttons */}
        <motion.div
          initial={
            prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }
          }
          animate={
            prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }
          }
          transition={{
            duration: prefersReducedMotion ? 0.15 : 0.7,
            delay: prefersReducedMotion ? 0 : 0.5,
            ease: EASE_SMOOTH,
          }}
          className="mt-4 flex flex-wrap items-center justify-center gap-4"
        >
          <MagneticButton
            className="rounded-full bg-text px-7 py-3.5 font-body text-sm font-semibold text-bg transition-colors duration-200 hover:bg-text/90 cursor-pointer shadow-md"
            onClick={() => handleScrollTo("projects")}
            aria-label="View projects section"
          >
            View Projects
          </MagneticButton>

          <MagneticButton
            className="rounded-full border border-stroke bg-surface/60 px-7 py-3.5 font-body text-sm font-medium text-text backdrop-blur-sm transition-colors duration-200 hover:border-stroke-hover hover:bg-surface cursor-pointer"
            onClick={() => handleScrollTo("contact")}
            aria-label="Get in touch section"
          >
            Get in Touch
          </MagneticButton>
        </motion.div>
      </div>

      {/* 6. Scroll Indicator (pinned bottom center) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: prefersReducedMotion ? 0.15 : 0.8,
          delay: prefersReducedMotion ? 0 : 0.8,
        }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[10]"
      >
        <ScrollIndicator
          targetId="about"
          onClick={() => handleScrollTo("about")}
        />
      </motion.div>
    </section>
  );
}

export default HeroSection;
