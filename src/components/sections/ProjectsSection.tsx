/**
 * ProjectsSection component — Phase A: sticky structure, no scale yet.
 * Renders project showcase using sticky stacking cards layout.
 * On desktop (>=640px): cards pin with staggered top offsets (top: calc(6rem + i*28px))
 * and stacking z-index (10 + i).
 * On mobile (<640px): sticky is disabled, cards stack naturally in flow.
 */
import FadeIn from "@/components/ui/FadeIn";
import ProjectCard from "@/components/ui/ProjectCard";
import { projects } from "@/data/portfolio";

export interface ProjectsSectionProps {
  className?: string;
}

export function ProjectsSection({ className = "" }: ProjectsSectionProps) {
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
          <div
            key={project.id}
            className="relative h-auto sm:h-[85vh]"
          >
            <div
              className="static sm:sticky"
              style={{
                top: `calc(6rem + ${i * 28}px)`,
                zIndex: 10 + i,
              }}
            >
              <ProjectCard project={project} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default ProjectsSection;
