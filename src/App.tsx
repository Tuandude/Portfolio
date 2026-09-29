import { useEffect, useState } from "react";
import Lenis from "lenis";
import FadeIn from "@/components/ui/FadeIn";
import RotatingText from "@/components/ui/RotatingText";
import AnimatedWords from "@/components/ui/AnimatedWords";
import MagneticButton from "@/components/ui/MagneticButton";
import ProjectCard from "@/components/ui/ProjectCard";
import ScrollIndicator from "@/components/ui/ScrollIndicator";
import Marquee from "@/components/ui/Marquee";
import Toast from "@/components/ui/Toast";
import { projects } from "@/data/portfolio";

function App() {
  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  const triggerToast = () => {
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2000);
  };

  return (
    <div className="relative min-h-screen bg-bg text-text">
      <main>
        {/* Hero Preview Section */}
        <section id="hero" className="flex min-h-screen flex-col items-center justify-center px-4 gap-8">
          <div className="text-center">
            <FadeIn>
              <h1 className="font-display italic text-5xl sm:text-7xl">
                An{" "}
                <RotatingText
                  words={["AI Student", "Vibe Coder", "Builder"]}
                  className="text-accent-start"
                />{" "}
                based in HCMC
              </h1>
            </FadeIn>
            <FadeIn delay={0.3}>
              <p className="mt-6 text-text-muted" style={{ fontSize: "clamp(0.875rem, 1.2vw, 1rem)" }}>
                Testing 8/8 primitives in comprehensive sandbox.
              </p>
            </FadeIn>
          </div>

          <FadeIn delay={0.5}>
            <div className="flex gap-4">
              <MagneticButton
                className="rounded-full bg-surface border border-stroke px-6 py-3 text-text hover:border-stroke-hover cursor-pointer"
                onClick={triggerToast}
              >
                Copy Contact (Toast Test)
              </MagneticButton>
            </div>
          </FadeIn>

          <ScrollIndicator targetId="about" />
        </section>

        {/* Marquee Banner */}
        <div className="py-8 border-y border-stroke/40 bg-surface/30">
          <Marquee text="LET'S BUILD SOMETHING • " className="font-mono text-sm tracking-wider text-text-muted" />
        </div>

        {/* About Preview Section for testing AnimatedWords */}
        <section id="about" className="flex min-h-screen items-center justify-center px-6 py-24">
          <div className="max-w-2xl text-center">
            <AnimatedWords
              text="I am an AI student based in Ho Chi Minh City, passionate about building products and exploring the intersection of machine learning and creative coding. Every model is trained to converge, every interface crafted with care."
              className="text-xl sm:text-2xl font-light leading-relaxed text-text"
            />
          </div>
        </section>

        {/* Projects Preview Section for testing ProjectCard */}
        <section id="projects" className="max-w-5xl mx-auto px-6 py-24 space-y-8">
          <h2 className="font-display italic text-4xl heading-gradient">Featured Project Preview</h2>
          <ProjectCard project={projects[0]} />
        </section>
      </main>

      {/* Test Portal Toast */}
      <Toast message="Email copied to clipboard!" isVisible={toastVisible} />
    </div>
  );
}

export default App;
