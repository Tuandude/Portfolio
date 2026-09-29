import { useEffect } from "react";
import Lenis from "lenis";
import FadeIn from "@/components/ui/FadeIn";
import RotatingText from "@/components/ui/RotatingText";
import AnimatedWords from "@/components/ui/AnimatedWords";

function App() {
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

  return (
    <div className="relative min-h-screen bg-bg text-text">
      <main>
        {/* Hero Preview Section */}
        <section className="flex min-h-screen items-center justify-center px-4">
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
                Scroll down to test AnimatedWords scroll reveal.
              </p>
            </FadeIn>
          </div>
        </section>

        {/* About Preview Section for testing AnimatedWords */}
        <section className="flex min-h-screen items-center justify-center px-6 py-24">
          <div className="max-w-2xl text-center">
            <AnimatedWords
              text="I am an AI student based in Ho Chi Minh City, passionate about building products and exploring the intersection of machine learning and creative coding. Every model is trained to converge, every interface crafted with care."
              className="text-xl sm:text-2xl font-light leading-relaxed text-text"
            />
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
