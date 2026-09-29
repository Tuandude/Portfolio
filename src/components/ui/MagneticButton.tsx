/**
 * MagneticButton component — button with physics-based cursor magnet effect.
 * Only activates when device supports precise pointer and hover capabilities:
 * (hover: hover) and (pointer: fine). Includes touch tap feedback and handler/style merging.
 */
import React, { useRef, useState, useEffect } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
  type HTMLMotionProps,
} from "framer-motion";

export interface MagneticButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onAnimationStart"> {
  children: React.ReactNode;
  strength?: number;   // default 0.3
  maxOffset?: number;  // default 20 (px)
  className?: string;
}

const SPRING_GENTLE = { stiffness: 100, damping: 15 };
const SPRING_SNAPPY = { stiffness: 300, damping: 20 };

export function MagneticButton({
  children,
  strength = 0.3,
  maxOffset = 20,
  className = "",
  disabled,
  style,
  onMouseMove,
  onMouseLeave,
  ...props
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const [canHover, setCanHover] = useState(false);
  const prefersReducedMotion = useReducedMotion() ?? false;

  // Raw mouse delta values
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth interpolated springs
  const springX = useSpring(x, SPRING_GENTLE);
  const springY = useSpring(y, SPRING_GENTLE);

  useEffect(() => {
    // Check if device supports precise mouse hover
    const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    setCanHover(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setCanHover(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ref.current || !canHover || prefersReducedMotion || disabled) {
      onMouseMove?.(e);
      return;
    }

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = (e.clientX - centerX) * strength;
    const deltaY = (e.clientY - centerY) * strength;

    // Clamp offsets within [-maxOffset, maxOffset]
    const clampedX = Math.max(-maxOffset, Math.min(maxOffset, deltaX));
    const clampedY = Math.max(-maxOffset, Math.min(maxOffset, deltaY));

    x.set(clampedX);
    y.set(clampedY);

    onMouseMove?.(e);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    x.set(0);
    y.set(0);
    onMouseLeave?.(e);
  };

  const isInteractive = canHover && !prefersReducedMotion && !disabled;

  return (
    <motion.button
      {...(props as HTMLMotionProps<"button">)}
      ref={ref}
      className={className}
      disabled={disabled}
      style={{
        ...(isInteractive ? { x: springX, y: springY } : {}),
        ...style,
      }}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      transition={{ type: "spring", ...SPRING_SNAPPY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </motion.button>
  );
}

export default MagneticButton;
