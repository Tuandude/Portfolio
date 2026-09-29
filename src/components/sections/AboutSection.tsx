/**
 * AboutSection component — biographical narrative section.
 * Features display section heading, word-level scroll reveal via AnimatedWords,
 * an authentic "Currently" activity block, secondary magnetic CTA,
 * and an inline SVG noise filter overlay.
 */
import FadeIn from "@/components/ui/FadeIn";
import AnimatedWords from "@/components/ui/AnimatedWords";
import MagneticButton from "@/components/ui/MagneticButton";

export interface AboutSectionProps {
  className?: string;
}

const ABOUT_TEXT =
  "I'm a second-year AI student passionate about building products that matter. When I'm not training models, I'm exploring creative coding, shipping small side projects, and learning in public.";

const CURRENT_ITEMS = [
  { label: "Learning", value: "Transformers & attention mechanisms" },
  { label: "Building", value: "This portfolio + a RAG side project" },
  { label: "Reading", value: "Designing Data-Intensive Applications" },
];

export function AboutSection({ className = "" }: AboutSectionProps) {
  const handleScrollToContact = () => {
    const el = document.getElementById("contact");
    if (!el) return;

    if (window.__lenis) {
      window.__lenis.scrollTo(el, { duration: 1.2 });
    } else {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className={`relative min-h-[100svh] py-24 md:py-32 px-4 sm:px-6 md:px-10 flex flex-col justify-center overflow-x-clip ${className}`}
    >
      {/* Inline SVG noise filter overlay (opacity ~0.03, pointer-events none) */}
      <div
        className="absolute inset-0 pointer-events-none z-[1] opacity-[0.03]"
        aria-hidden="true"
      >
        <svg className="w-full h-full">
          <filter id="about-noise-filter">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.8"
              numOctaves="3"
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#about-noise-filter)" />
        </svg>
      </div>

      {/* Main Content Container (z-[2]) */}
      <div className="relative z-[2] max-w-[1200px] w-full mx-auto text-center flex flex-col items-center gap-12 md:gap-16">
        {/* Section Heading */}
        <FadeIn>
          <h2
            id="about-heading"
            style={{ fontSize: "clamp(3rem, 12vw, 10rem)" }}
            className="font-display italic leading-[0.95] tracking-tight heading-gradient"
          >
            About
          </h2>
        </FadeIn>

        {/* Word Reveal Body Text */}
        <div className="max-w-2xl mx-auto">
          <AnimatedWords
            text={ABOUT_TEXT}
            className="text-lg md:text-xl leading-relaxed text-text font-body"
          />
        </div>

        {/* "Currently" Activity Block */}
        <FadeIn delay={0.2} className="w-full max-w-lg mx-auto">
          <div className="rounded-2xl border border-stroke bg-surface/40 p-6 backdrop-blur-sm text-left space-y-3">
            <div className="font-mono text-xs uppercase tracking-wider text-text-muted pb-1 border-b border-stroke/40">
              // Currently
            </div>
            <ul className="space-y-2.5 list-none p-0 m-0">
              {CURRENT_ITEMS.map((item) => (
                <li
                  key={item.label}
                  className="flex items-start gap-3 font-mono text-xs sm:text-sm"
                >
                  <span className="text-text-subtle min-w-[76px] sm:min-w-[80px]">
                    {item.label}:
                  </span>
                  <span className="text-text-muted">{item.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </FadeIn>

        {/* Contact CTA */}
        <FadeIn delay={0.3}>
          <MagneticButton
            className="rounded-full border border-stroke bg-surface/60 px-7 py-3.5 font-body text-sm font-medium text-text backdrop-blur-sm transition-colors duration-200 hover:border-stroke-hover hover:bg-surface cursor-pointer"
            onClick={handleScrollToContact}
            aria-label="Get in Touch — Scroll to contact section"
          >
            Get in Touch
          </MagneticButton>
        </FadeIn>
      </div>
    </section>
  );
}

export default AboutSection;
