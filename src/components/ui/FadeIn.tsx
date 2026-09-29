import React, { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  y?: number;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
}

const EASE_SMOOTH = [0.25, 0.1, 0.25, 1.0] as const;

export function FadeIn({
  children,
  delay = 0,
  duration = 0.7,
  y = 24,
  className,
  as = 'div',
}: FadeInProps) {
  const prefersReducedMotion = useReducedMotion();

  // Cache the motion component per `as` tag to avoid re-creating on each render
  const MotionComponent = useMemo(
    () => motion.create(as as string),
    [as],
  ) as React.ComponentType<React.HTMLAttributes<HTMLElement> & {
    initial?: object;
    whileInView?: object;
    viewport?: object;
    transition?: object;
  }>;

  const initial = prefersReducedMotion
    ? { opacity: 0, y: 0 }
    : { opacity: 0, y };

  const animate = { opacity: 1, y: 0 };

  const transition = prefersReducedMotion
    ? { duration: 0.15, delay: 0, ease: EASE_SMOOTH }
    : { duration, delay, ease: EASE_SMOOTH };

  return (
    <MotionComponent
      className={className}
      initial={initial}
      whileInView={animate}
      viewport={{ once: true, margin: '-50px' }}
      transition={transition}
    >
      {children}
    </MotionComponent>
  );
}

export default FadeIn;
