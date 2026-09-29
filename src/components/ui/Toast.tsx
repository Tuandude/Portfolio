/**
 * Toast component — notification toast for actions like copy-to-clipboard.
 * Positioned fixed at bottom center (z-toast: 100) using React Portal
 * to prevent transform/filter clipping from parent sections.
 */
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

export interface ToastProps {
  message: string;
  isVisible: boolean;
  className?: string;
}

export function Toast({ message, isVisible, className = "" }: ToastProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isVisible && (
        <motion.div
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: 16, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.95 }}
          transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1.0] }}
          className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 rounded-full border border-stroke bg-surface/90 px-4 py-2 font-mono text-xs text-text shadow-lg backdrop-blur-md pointer-events-none ${className}`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
          <span>{message}</span>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

export default Toast;
