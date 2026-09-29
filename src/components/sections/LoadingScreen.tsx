/**
 * LoadingScreen component — full-screen entry loader.
 * Counts 000 -> 100 in ~1000ms wall-clock, waits for critical fonts (max 1500ms timeout),
 * cycles rotating words, and sets sessionStorage to skip on subsequent visits in the same session.
 */
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

export interface LoadingScreenProps {
  onComplete: () => void;
}

const WORDS = ["Build", "Learn", "Create"];

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [count, setCount] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  const prefersReducedMotion = useReducedMotion() ?? false;
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Cycle rotating words every 400ms
  useEffect(() => {
    if (prefersReducedMotion) return;

    const wordInterval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % WORDS.length);
    }, 400);

    return () => clearInterval(wordInterval);
  }, [prefersReducedMotion]);

  // Main counter and font loader sync
  useEffect(() => {
    let animationFrameId: number;
    const startTime = performance.now();
    const duration = 1000; // 1000ms counter duration

    // Font loading promise with 1500ms timeout race
    const fontsPromise = Promise.all([
      document.fonts.load('italic 1em "Instrument Serif"'),
      document.fonts.load('400 1em "Inter"'),
    ]).catch(() => {
      console.warn("[LoadingScreen] Font loading failed, continuing with system fallback.");
    });

    const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 1500));
    const readyBarrier = Promise.race([fontsPromise, timeoutPromise]);

    let counterDone = false;
    let barrierDone = false;

    const checkFinished = () => {
      if (counterDone && barrierDone) {
        setIsExiting(true);
        setTimeout(() => {
          try {
            sessionStorage.setItem("portfolio-loaded", "1");
          } catch {
            // Ignore private mode storage restrictions
          }
          onCompleteRef.current();
        }, 300); // 300ms fade-out transition duration
      }
    };

    readyBarrier.then(() => {
      barrierDone = true;
      checkFinished();
    });

    const updateCounter = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const currentCount = Math.floor(progress * 100);

      setCount(currentCount);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(updateCounter);
      } else {
        setCount(100);
        counterDone = true;
        checkFinished();
      }
    };

    animationFrameId = requestAnimationFrame(updateCounter);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const formattedCount = String(count).padStart(3, "0");
  const activeWord = WORDS[wordIndex];

  return (
    <motion.div
      role="progressbar"
      aria-label="Loading portfolio"
      aria-valuenow={count}
      aria-valuemin={0}
      aria-valuemax={100}
      initial={{ opacity: 1 }}
      animate={{ opacity: isExiting ? 0 : 1 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1.0] }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-bg select-none"
    >
      <div className="flex flex-col items-center justify-center space-y-6">
        {/* Massive Display Counter */}
        <span
          aria-hidden="true"
          className="font-display italic text-[clamp(6rem,20vw,16rem)] leading-none tracking-tight heading-gradient tabular-nums"
        >
          {formattedCount}
        </span>

        {/* Rotating Word Tagline */}
        <div className="h-6 flex items-center justify-center overflow-hidden">
          {prefersReducedMotion ? (
            <span className="font-mono text-sm text-text-muted uppercase tracking-widest">
              Loading
            </span>
          ) : (
            <AnimatePresence mode="wait">
              <motion.span
                key={activeWord}
                initial={{ y: 16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -16, opacity: 0 }}
                transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1.0] }}
                className="font-mono text-sm text-text-muted uppercase tracking-widest inline-block"
              >
                {activeWord} ·
              </motion.span>
            </AnimatePresence>
          )}
        </div>

        {/* Progress Bar with Accent Gradient */}
        <div className="w-64 h-1 bg-stroke rounded-full overflow-hidden mt-4">
          <div
            className="h-full accent-gradient transition-[width] duration-75 ease-out rounded-full"
            style={{ width: `${count}%` }}
          />
        </div>
      </div>
    </motion.div>
  );
}

export default LoadingScreen;
