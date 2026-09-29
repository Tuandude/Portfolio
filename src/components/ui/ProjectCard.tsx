/**
 * ProjectCard component — editorial card display for individual projects.
 * Used inside sticky stacking cards in the Projects section.
 * Complies with Design Tokens v4: responsive layout, accessible markup, status badges.
 */
import { Github, ExternalLink } from "lucide-react";
import type { Project } from "@/types";

export interface ProjectCardProps {
  project: Project;
  className?: string;
}

export function ProjectCard({ project, className = "" }: ProjectCardProps) {
  const formattedIndex = String(project.index).padStart(2, "0");
  const headingId = `project-title-${project.id}`;

  // Status badge styling per spec
  const statusConfig = {
    live: {
      label: "Status: live",
      classes: "text-success border-success/30 bg-success/10",
      showPulse: true,
    },
    wip: {
      label: "Status: work in progress",
      classes: "text-warning border-warning/30 bg-warning/10",
      showPulse: false,
    },
    archived: {
      label: "Status: archived",
      classes: "text-text-subtle border-stroke bg-surface-hover",
      showPulse: false,
    },
  }[project.status];

  return (
    <article
      aria-labelledby={headingId}
      className={`group relative flex flex-col justify-between rounded-3xl border border-stroke bg-surface p-6 md:p-8 min-h-[60vh] transition-colors duration-300 hover:border-stroke-hover ${className}`}
    >
      {/* Top Header Row: Project Index, Category & Status Badge */}
      <div className="flex items-center justify-between border-b border-stroke/60 pb-4">
        <div className="flex items-baseline gap-4">
          <span
            aria-hidden="true"
            className="font-display italic text-4xl sm:text-5xl md:text-6xl heading-gradient select-none"
          >
            {formattedIndex}
          </span>
          <span className="font-mono text-xs uppercase tracking-wider text-text-muted">
            {project.category}
          </span>
        </div>

        {/* Status Badge */}
        <div
          role="status"
          aria-label={statusConfig.label}
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-xs uppercase tracking-wider ${statusConfig.classes}`}
        >
          {statusConfig.showPulse && (
            <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
          )}
          <span>{project.status}</span>
        </div>
      </div>

      {/* Main Grid Content: Visual Placeholder (left on desktop) & Details (right on desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-center py-6 my-auto">
        {/* Visual Placeholder */}
        <div className="md:col-span-5 relative aspect-[16/10] overflow-hidden rounded-2xl border border-stroke/50 flex items-center justify-center bg-gradient-to-br from-[#89AACC]/20 to-[#4E85BF]/10 select-none">
          {/* Subtle noise grid pattern overlay */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(circle, #F5F5F5 1px, transparent 1px)",
              backgroundSize: "16px 16px",
            }}
          />

          {/* Faded title overlay */}
          <span
            aria-hidden="true"
            className="font-display italic text-4xl sm:text-5xl text-center px-4 leading-none text-text opacity-[0.08] truncate max-w-full"
          >
            {project.title}
          </span>
        </div>

        {/* Text Details */}
        <div className="md:col-span-7 flex flex-col justify-center space-y-4">
          <div className="space-y-1">
            <span className="font-mono text-xs text-text-subtle">{project.year}</span>
            <h3
              id={headingId}
              className="font-body text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-text"
            >
              {project.title}
            </h3>
          </div>

          <p className="font-body text-sm sm:text-base leading-relaxed text-text-muted">
            {project.description}
          </p>

          {/* Tech tags */}
          <div className="flex flex-wrap gap-2 pt-2">
            {project.tech.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-stroke px-3 py-1 font-mono text-xs text-text-muted transition-colors duration-200 hover:border-stroke-hover hover:text-text"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Footer Actions / Links */}
      <div className="flex items-center gap-6 border-t border-stroke/60 pt-4 mt-auto">
        {project.github && (
          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`View GitHub repository for ${project.title}`}
            className="inline-flex items-center gap-2 font-body text-sm font-medium text-text-muted transition-colors hover:text-text focus-visible:outline-accent-start"
          >
            <Github className="h-4 w-4" />
            <span>Source Code</span>
          </a>
        )}

        {project.demo && (
          <a
            href={project.demo}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`View live demo for ${project.title}`}
            className="inline-flex items-center gap-2 font-body text-sm font-medium text-text-muted transition-colors hover:text-text focus-visible:outline-accent-start"
          >
            <ExternalLink className="h-4 w-4" />
            <span>Live Demo</span>
          </a>
        )}

        {!project.github && !project.demo && (
          <span className="font-mono text-xs text-text-subtle italic">
            // Development in progress
          </span>
        )}
      </div>
    </article>
  );
}

export default ProjectCard;
