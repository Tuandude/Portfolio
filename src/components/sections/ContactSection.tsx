/**
 * ContactSection component — focal contact invitation section.
 * Features display section heading "Let's Talk", prominent copy-to-clipboard email button,
 * social links row (GitHub, LinkedIn, Email), live status indicator, and toast notifications.
 */
import { useState } from "react";
import { Mail, Github, Linkedin, Copy, Check } from "lucide-react";
import FadeIn from "@/components/ui/FadeIn";
import MagneticButton from "@/components/ui/MagneticButton";
import Toast from "@/components/ui/Toast";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

export interface ContactSectionProps {
  className?: string;
}

const EMAIL = "dudenoblade@gmail.com";
const GITHUB_URL = "https://github.com/Tuandude";
const LINKEDIN_URL = "https://linkedin.com"; // placeholder link

export function ContactSection({ className = "" }: ContactSectionProps) {
  const { copy } = useCopyToClipboard();
  const [toastVisible, setToastVisible] = useState(false);
  const [copiedRecently, setCopiedRecently] = useState(false);

  const handleCopyEmail = async () => {
    const success = await copy(EMAIL);
    if (success) {
      setCopiedRecently(true);
      setToastVisible(true);
      setTimeout(() => {
        setCopiedRecently(false);
        setToastVisible(false);
      }, 2000);
    }
  };

  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className={`relative min-h-screen py-24 md:py-32 px-4 sm:px-6 md:px-10 flex flex-col justify-center items-center text-center ${className}`}
    >
      <div className="max-w-[1200px] w-full mx-auto flex flex-col items-center gap-12 md:gap-16">
        {/* Section Heading */}
        <FadeIn>
          <h2
            id="contact-heading"
            style={{ fontSize: "clamp(3rem, 12vw, 10rem)" }}
            className="font-display italic leading-[0.95] tracking-tight heading-gradient"
          >
            Let&apos;s Talk
          </h2>
        </FadeIn>

        {/* Large Email Button (Focal Point) */}
        <FadeIn delay={0.15}>
          <MagneticButton
            onClick={handleCopyEmail}
            aria-label="Copy email address to clipboard"
            className="group relative flex items-center gap-3 sm:gap-4 rounded-full border border-stroke bg-surface/50 px-6 sm:px-10 py-4 sm:py-5 backdrop-blur-sm transition-all duration-300 hover:border-stroke-hover hover:bg-surface cursor-pointer shadow-lg hover:shadow-xl hover:shadow-black/40"
          >
            <Mail className="h-5 w-5 text-accent-start transition-transform duration-300 group-hover:scale-110" />
            <span className="font-body text-base sm:text-xl md:text-2xl font-medium text-text select-all">
              {EMAIL}
            </span>
            <div className="ml-2 flex items-center justify-center p-1.5 rounded-full bg-stroke/50 text-text-muted transition-colors group-hover:text-text">
              {copiedRecently ? (
                <Check className="h-4 w-4 text-success" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </div>
          </MagneticButton>
        </FadeIn>

        {/* Social Links Row */}
        <FadeIn delay={0.25}>
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8 pt-2">
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-body text-sm font-medium text-text-muted transition-colors duration-200 hover:text-text focus-visible:outline-accent-start"
              aria-label="Visit GitHub Profile"
            >
              <Github className="h-4 w-4" />
              <span>GitHub</span>
            </a>

            <a
              href={LINKEDIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-body text-sm font-medium text-text-muted transition-colors duration-200 hover:text-text focus-visible:outline-accent-start"
              aria-label="Visit LinkedIn Profile"
            >
              <Linkedin className="h-4 w-4" />
              <span>LinkedIn</span>
            </a>

            <button
              type="button"
              onClick={handleCopyEmail}
              className="inline-flex items-center gap-2 font-body text-sm font-medium text-text-muted transition-colors duration-200 hover:text-text focus-visible:outline-accent-start cursor-pointer bg-transparent border-none p-0"
              aria-label="Copy email address"
            >
              <Mail className="h-4 w-4" />
              <span>Email</span>
            </button>
          </div>
        </FadeIn>

        {/* Status Text with Pulse Dot */}
        <FadeIn delay={0.35}>
          <div className="inline-flex items-center gap-2.5 rounded-full border border-stroke/50 bg-surface/30 px-4 py-1.5 backdrop-blur-xs">
            <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
            <span className="font-mono text-xs uppercase tracking-widest text-text-subtle">
              // open to internships — Summer 2026
            </span>
          </div>
        </FadeIn>
      </div>

      {/* Copy Feedback Toast via Portal */}
      <Toast message="Email copied to clipboard!" isVisible={toastVisible} />
    </section>
  );
}

export default ContactSection;
