import { useEffect } from "react";
import Lenis from "lenis";
import FadeIn from "@/components/ui/FadeIn";
import RotatingText from "@/components/ui/RotatingText";

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
                Portfolio setup complete.
              </p>
            </FadeIn>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
