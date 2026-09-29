/**
 * SkillsSection component — "What I Do" editorial skills list.
 * Distinctive transition: light white background with rounded top corners
 * overlapping the previous section with negative margin-top.
 * Features 2-column numbered list (01-04), heading-gradient-light, and semantic HTML.
 */
import FadeIn from "@/components/ui/FadeIn";

export interface SkillsSectionProps {
  className?: string;
}

interface SkillItem {
  number: string;
  title: string;
  description: string;
}

const SKILLS: SkillItem[] = [
  {
    number: "01",
    title: "Machine Learning",
    description:
      "Training models, from logistic regression to transformers. Comfortable with PyTorch and scikit-learn.",
  },
  {
    number: "02",
    title: "Web Development",
    description:
      "Full-stack web apps with React, TypeScript, and modern tooling. Building products end-to-end.",
  },
  {
    number: "03",
    title: "Computer Vision",
    description:
      "Image classification, object detection, and experimenting with vision-language models.",
  },
  {
    number: "04",
    title: "Problem Solving",
    description:
      "Breaking down ambiguous problems into shippable pieces. Learning in public, shipping small.",
  },
];

export function SkillsSection({ className = "" }: SkillsSectionProps) {
  return (
    <section
      id="skills"
      aria-labelledby="skills-heading"
      className={`relative z-[10] -mt-8 rounded-t-[2.5rem] sm:rounded-t-[3.125rem] md:rounded-t-[3.75rem] bg-white text-bg py-24 md:py-32 px-4 sm:px-6 md:px-10 shadow-2xl ${className}`}
    >
      <div className="max-w-[1200px] mx-auto flex flex-col items-center">
        {/* Section Heading with dark gradient */}
        <FadeIn>
          <h2
            id="skills-heading"
            style={{ fontSize: "clamp(3rem, 12vw, 10rem)" }}
            className="font-display italic leading-[0.95] tracking-tight heading-gradient-light text-center"
          >
            What I Do
          </h2>
        </FadeIn>

        {/* 2-column Editorial Numbered List */}
        <ol className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 max-w-4xl w-full mx-auto pt-16 list-none p-0 m-0">
          {SKILLS.map((skill, index) => (
            <li key={skill.number}>
              <FadeIn delay={index * 0.1} className="h-full">
                <article className="flex flex-col gap-3 border-b border-white-stroke pb-6 h-full">
                  {/* Row 1: Number + Title */}
                  <div className="flex items-baseline gap-4">
                    <span
                      aria-hidden="true"
                      className="font-display italic text-4xl md:text-5xl heading-gradient-light select-none shrink-0"
                    >
                      {skill.number}
                    </span>
                    <h3 className="font-body text-xl md:text-2xl font-semibold text-bg tracking-tight">
                      {skill.title}
                    </h3>
                  </div>

                  {/* Row 2: Description indented */}
                  <p className="font-body text-sm md:text-base leading-relaxed text-white-muted pl-12 md:pl-16">
                    {skill.description}
                  </p>
                </article>
              </FadeIn>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export default SkillsSection;
