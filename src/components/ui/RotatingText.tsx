/**
 * RotatingText component — cycles smoothly through a list of words with
 * fixed container width to prevent layout shift. Supports prefers-reduced-motion.
 */
import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

export interface RotatingTextProps {
  words: string[];
  interval?: number;     // default 2900ms (2100ms visible + 400ms exit + 400ms enter)
  duration?: number;     // default 400ms
  className?: string;    // apply cho container
}

const EASE_SMOOTH = [0.25, 0.1, 0.25, 1.0] as const;

export function RotatingText({
  words,
  interval = 2900,
  duration = 400,
  className = "",
}: RotatingTextProps) {
  const [index, setIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion() ?? false;

  useEffect(() => {
    if (!words || words.length <= 1) return;

    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, interval);

    return () => clearInterval(timer);
  }, [words, interval]);

  if (!words || words.length === 0) return null;

  const currentWord = words[index];
  const durSec = duration / 1000;

  const variants = prefersReducedMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.2 },
      }
    : {
        initial: { y: 16, opacity: 0 },
        animate: { y: 0, opacity: 1 },
        exit: { y: -16, opacity: 0 },
        transition: { duration: durSec, ease: EASE_SMOOTH },
      };

  return (
    <span className={`inline-grid relative items-center justify-items-center ${className}`}>
      {/* Invisible spacer words occupying the same grid area to establish max bounding width */}
      {words.map((word, i) => (
        <span
          key={`spacer-${i}-${word}`}
          className="col-start-1 row-start-1 invisible select-none pointer-events-none whitespace-nowrap"
          aria-hidden="true"
        >
          {word}
        </span>
      ))}

      {/* Active animating word inside the same single grid cell */}
      <span className="col-start-1 row-start-1 flex items-center justify-center whitespace-nowrap">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={`${index}-${currentWord}`}
            initial={variants.initial}
            animate={variants.animate}
            exit={variants.exit}
            transition={variants.transition}
            className="inline-block"
          >
            {currentWord}
          </motion.span>
        </AnimatePresence>
      </span>
    </span>
  );
}

export default RotatingText;
