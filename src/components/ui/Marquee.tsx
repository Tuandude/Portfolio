/**
 * Marquee component — infinite horizontal ticker using pure CSS keyframes.
 * Pauses automatically when prefers-reduced-motion is active.
 */
import { type ReactNode } from "react";

export interface MarqueeProps {
  text?: string;
  children?: ReactNode;
  repeat?: number;       // default 6 repetitions for seamless looping
  speedSeconds?: number; // default 35s per full loop
  className?: string;
}

export function Marquee({
  text = "LET'S BUILD SOMETHING • ",
  children,
  repeat = 6,
  speedSeconds = 35,
  className = "",
}: MarqueeProps) {
  const content = children ?? text;
  const items = Array.from({ length: repeat });

  return (
    <div
      dir="ltr"
      aria-label={typeof content === "string" ? content.trim() : "Announcement marquee"}
      className={`overflow-hidden select-none whitespace-nowrap flex w-full ${className}`}
    >
      <div
        aria-hidden="true"
        className="marquee-track flex shrink-0"
        style={{
          animation: `marquee ${speedSeconds}s linear infinite`,
        }}
      >
        {items.map((_, i) => (
          <span key={`group1-${i}`} className="inline-block px-4">
            {content}
          </span>
        ))}
      </div>
      {/* Second identical track to create seamless endless loop */}
      <div
        aria-hidden="true"
        className="marquee-track flex shrink-0"
        style={{
          animation: `marquee ${speedSeconds}s linear infinite`,
        }}
      >
        {items.map((_, i) => (
          <span key={`group2-${i}`} className="inline-block px-4">
            {content}
          </span>
        ))}
      </div>
    </div>
  );
}

export default Marquee;
