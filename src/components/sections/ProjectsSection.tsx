/**
 * ProjectsSection component — Phase B: sticky structure + scroll-driven scale animation.
 * Renders project showcase using sticky stacking cards layout.
 * Each card is encapsulated in its own StickyCard component to satisfy Rules of Hooks.
 * Cards 0..(N-2) scale smoothly from 1 -> 0.96 as the user scrolls past their wrapper on desktop (>=640px).
 * The final card (N-1) remains at scale 1 without shrinking.
 * On mobile (<640px) or prefers-reduced-motion, scale animation is completely disabled (fixed at 1).
 */
import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import FadeIn from "@/components/ui/FadeIn";
import ProjectCard from "@/components/ui/ProjectCard";
import { projects } from "@/data/portfolio";
import type { Project } from "@/types";

export interface ProjectsSectionProps {
  className?: string;
}

interface StickyCardProps {
  project: Project;
  index: number;
  total: number;
  isMobile: boolean;
}

/**
 * Child component managing individual scroll measurement and scale transformation.
 */
function StickyCard({ project, index, total, isMobile }: StickyCardProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion() ?? false;

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end start"],
  });

  const isLast = index === total - 1;

  // Scale down earlier cards to 0.96 as the next card scrolls up to cover them
  const rawScale = useTransform(scrollYProgress, [0, 1], [1, isLast ? 1 : 0.96]);
  // Strictly disable scale on mobile (<640px), reduced-motion, or for the last card
  const activeScale = isMobile || prefersReducedMotion || isLast ? 1 : rawScale;

  return (
    <div ref={wrapperRef} className="relative h-auto sm:h-[85vh]">
      <motion.div
        className="static sm:sticky"
        style={{
          top: `calc(6rem + ${index * 28}px)`,
          zIndex: 10 + index,
          scale: activeScale,
          transformOrigin: "top center",
        }}
      >
        <ProjectCard project={project} />
      </motion.div>
    </div>
  );
}

export function ProjectsSection({ className = "" }: ProjectsSectionProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    setIsMobile(mq.matches);

    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <section
      id="projects"
      aria-labelledby="projects-heading"
      className={`relative z-[10] -mt-8 rounded-t-[2.5rem] sm:rounded-t-[3.125rem] md:rounded-t-[3.75rem] bg-bg py-24 md:py-32 px-4 sm:px-6 md:px-10 shadow-2xl ${className}`}
    >
      {/* Section Heading */}
      <div className="max-w-[1200px] mx-auto mb-16 md:mb-24 text-center">
        <FadeIn>
          <h2
            id="projects-heading"
            style={{ fontSize: "clamp(3rem, 12vw, 10rem)" }}
            className="font-display italic leading-[0.95] tracking-tight heading-gradient"
          >
            Projects
          </h2>
        </FadeIn>
      </div>

      {/* Sticky Cards Container */}
      <div className="max-w-[1200px] mx-auto flex flex-col gap-8 sm:gap-0">
        {projects.map((project, i) => (
          <StickyCard
            key={project.id}
            project={project}
            index={i}
            total={projects.length}
            isMobile={isMobile}
          />
        ))}
      </div>
    </section>
  );
}

export default ProjectsSection;
