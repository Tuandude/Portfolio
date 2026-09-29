/**
 * ScrollIndicator component — animated scroll-down hint.
 * Displays "SCROLL" eyebrow label above an indicator line with CSS keyframe highlight.
 * Can be rendered as anchor link (<a href="#target">) or button with custom Lenis click handler.
 */
export interface ScrollIndicatorProps {
  label?: string;
  targetId?: string;     // e.g. "about" -> href="#about"
  onClick?: () => void;
  className?: string;
}

export function ScrollIndicator({
  label = "SCROLL",
  targetId = "about",
  onClick,
  className = "",
}: ScrollIndicatorProps) {
  const content = (
    <>
      <span className="font-body text-[0.75rem] font-medium tracking-[0.2em] text-text-muted uppercase transition-colors group-hover:text-text">
        {label}
      </span>
      <div className="relative h-10 w-[1px] bg-stroke/60 overflow-hidden">
        <div
          className="scroll-indicator-line absolute top-0 left-0 w-full h-full accent-gradient"
          style={{
            animation: "scroll-indicator 1.5s ease-in-out infinite",
          }}
        />
      </div>
    </>
  );

  const baseClasses = `group inline-flex flex-col items-center gap-3 cursor-pointer bg-transparent border-none p-2 focus-visible:outline-none no-underline ${className}`;

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={baseClasses}
        aria-label={`Scroll down to ${targetId}`}
      >
        {content}
      </button>
    );
  }

  return (
    <a
      href={`#${targetId}`}
      className={baseClasses}
      aria-label={`Scroll down to ${targetId}`}
    >
      {content}
    </a>
  );
}

export default ScrollIndicator;
