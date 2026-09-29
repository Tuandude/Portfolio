import { useEffect, useState } from "react";
import Lenis from "lenis";
import { AnimatePresence } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import LoadingScreen from "@/components/sections/LoadingScreen";
import HeroSection from "@/components/sections/HeroSection";
import AboutSection from "@/components/sections/AboutSection";
import SkillsSection from "@/components/sections/SkillsSection";
import ProjectsSection from "@/components/sections/ProjectsSection";
import Marquee from "@/components/ui/Marquee";
import Toast from "@/components/ui/Toast";
import MagneticButton from "@/components/ui/MagneticButton";

function App() {
  const [loaded, setLoaded] = useState(() => {
    try {
      return sessionStorage.getItem("portfolio-loaded") === "1";
    } catch {
      return false;
    }
  });

  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    // Expose Lenis instance globally on window for components (Navbar, Hero CTA, ScrollIndicator)
    window.__lenis = lenis;

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    // If already loaded on mount, handle hash navigation immediately
    if (loaded && window.location.hash) {
      lenis.scrollTo(window.location.hash, { immediate: true });
    }

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      window.__lenis = undefined;
    };
  }, [loaded]);

  const triggerToast = () => {
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2000);
  };

  return (
    <div className="relative min-h-screen bg-bg text-text">
      {/* 1. Loading Screen */}
      <AnimatePresence>
        {!loaded && <LoadingScreen onComplete={() => setLoaded(true)} />}
      </AnimatePresence>

      {/* 2. Floating Navbar */}
      <Navbar />

      <main>
        {/* 3. Hero Section */}
        {loaded && <HeroSection />}

        {/* 4. Marquee Banner */}
        <div className="py-8 border-y border-stroke/40 bg-surface/30">
          <Marquee text="LET'S BUILD SOMETHING • " className="font-mono text-sm tracking-wider text-text-muted" />
        </div>

        {/* 5. About Section */}
        <AboutSection />

        {/* 6. Skills Section (White Section with Overlap) */}
        <SkillsSection />

        {/* 7. Projects Section (Phase A: Sticky structure) */}
        <ProjectsSection />

        {/* 8. Contact Preview Section */}
        <section id="contact" className="min-h-[50vh] flex flex-col items-center justify-center px-6 py-24 border-t border-stroke/40 text-center">
          <h2 className="font-display italic text-4xl heading-gradient mb-4">Get In Touch</h2>
          <p className="text-text-muted max-w-md mb-8">
            Available for internships and ambitious product collaborations.
          </p>
          <MagneticButton
            className="rounded-full accent-gradient px-8 py-3.5 text-bg font-semibold cursor-pointer"
            onClick={triggerToast}
          >
            Say Hello
          </MagneticButton>
        </section>
      </main>

      {/* Global Toast */}
      <Toast message="Email copied to clipboard!" isVisible={toastVisible} />
    </div>
  );
}

export default App;
