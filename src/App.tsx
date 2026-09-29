import { useEffect, useState } from "react";
import Lenis from "lenis";
import { AnimatePresence } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import LoadingScreen from "@/components/sections/LoadingScreen";
import HeroSection from "@/components/sections/HeroSection";
import AboutSection from "@/components/sections/AboutSection";
import SkillsSection from "@/components/sections/SkillsSection";
import ProjectsSection from "@/components/sections/ProjectsSection";
import ContactSection from "@/components/sections/ContactSection";
import Footer from "@/components/layout/Footer";

function App() {
  const [loaded, setLoaded] = useState(() => {
    try {
      return sessionStorage.getItem("portfolio-loaded") === "1";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    // Expose Lenis instance globally on window for components
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
        <HeroSection />

        {/* 4. About Section */}
        <AboutSection />

        {/* 5. Skills Section (White Section with Overlap) */}
        <SkillsSection />

        {/* 6. Projects Section (Sticky Stacking Cards with Scale) */}
        <ProjectsSection />

        {/* 7. Contact Section */}
        <ContactSection />
      </main>

      {/* 8. Full-Width Footer */}
      <Footer />
    </div>
  );
}

export default App;
