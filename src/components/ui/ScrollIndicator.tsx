/**
 * ScrollIndicator component — animated scroll-down hint.
 * Displays "SCROLL" eyebrow label above an indicator line with CSS keyframe highlight.
 */
export interface ScrollIndicatorProps {
  label?: string;
  onClick?: () => void;
  className?: string;
}

export function ScrollIndicator({
  label = "SCROLL",
  onClick,
  className = "",
}: ScrollIndicatorProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex flex-col items-center gap-3 cursor-pointer bg-transparent border-none p-2 focus-visible:outline-none ${className}`}
      aria-label={`Scroll down to next section`}
    >
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
    </button>
  );
}

export default ScrollIndicator;
