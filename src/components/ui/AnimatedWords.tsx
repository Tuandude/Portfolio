/**
 * AnimatedWords component — word-level scroll reveal animation.
 * Progressively reveals text opacity (0.15 -> 1) based on scroll progress.
 * Each word is wrapped in an individual Word child component with its own useTransform.
 */
import React, { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from "framer-motion";

export interface AnimatedWordsProps {
  text: string;               // full paragraph text
  className?: string;
  as?: "p" | "div" | "span";  // default 'p'
}

interface WordProps {
  children: React.ReactNode;
  progress: MotionValue<number>;
  range: [number, number];
}

/**
 * Individual Word component:
 * Calls useTransform hook at the component level to strictly follow Rules of Hooks.
 */
function Word({ children, progress, range }: WordProps) {
  const opacity = useTransform(progress, range, [0.15, 1]);
  return <motion.span style={{ opacity }}>{children}</motion.span>;
}

export function AnimatedWords({
  text,
  className,
  as = "p",
}: AnimatedWordsProps) {
  const containerRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion() ?? false;

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.85", "end 0.3"],
  });

  // Early return with static text if reduced motion is requested
  if (prefersReducedMotion) {
    const Component = as;
    return <Component className={className}>{text}</Component>;
  }

  // Split text by whitespace into words
  const words = text.split(/\s+/).filter(Boolean);
  const totalWords = words.length;

  const MotionComponent = motion[as];

  return (
    <MotionComponent
      ref={containerRef as React.RefObject<HTMLParagraphElement>}
      className={className}
    >
      {words.map((word, i) => {
        const progressStart = i / totalWords;
        const progressEnd = (i + 1) / totalWords;

        return (
          <React.Fragment key={`${i}-${word}`}>
            <Word
              progress={scrollYProgress}
              range={[progressStart, progressEnd]}
            >
              {word}
            </Word>
            {i < totalWords - 1 ? " " : null}
          </React.Fragment>
        );
      })}
    </MotionComponent>
  );
}

export default AnimatedWords;
