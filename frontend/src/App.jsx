import React, { useState, useEffect, useRef, useCallback } from 'react';
import Lenis from 'lenis';
import Navbar from './components/Navbar';
import GoogleAuthModal from './components/GoogleAuthModal';
import HeroScrollytelling from './components/HeroScrollytelling';
import AssetPreloader from './components/AssetPreloader';
import Dashboard from './components/Dashboard';

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [viewMode, setViewMode] = useState('landing'); // 'landing' | 'dashboard'
  const heroRef = useRef(null);

  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('aero_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Initialize Lenis smooth scroll ONLY when in 'landing' mode
  useEffect(() => {
    if (!isReady || viewMode !== 'landing') return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.9,
    });

    lenis.on('scroll', () => {
      window.dispatchEvent(new Event('scroll'));
    });

    let rafId;
    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, [isReady, viewMode]);

  const handleSelectSection = (sectionId) => {
    heroRef.current?.scrollToSection(sectionId);
  };

  const handleEnterDashboard = (enteredUser) => {
    if (enteredUser) {
      setUser(enteredUser);
    }
    setViewMode('dashboard');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleReady = useCallback(() => {
    setIsReady(true);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#031225] text-[#F5F7FA] font-sans antialiased selection:bg-[#061A33] selection:text-white">
      {/* 1. Asset Preloader with safety gate */}
      {!isReady && (
        <AssetPreloader onReady={handleReady} />
      )}

      {/* 2. Global Authentication & Guest Access Modal */}
      <GoogleAuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        user={user}
        setUser={setUser}
        onEnterDashboard={handleEnterDashboard}
      />

      {/* 3. VIEW MODE CONTROLLER */}
      {viewMode === 'dashboard' ? (
        /* FIXED SINGLE-SCREEN DASHBOARD (NO CINEMATIC SCROLL DEPENDENCE) */
        <Dashboard 
          user={user}
          onOpenAuth={() => setIsAuthOpen(true)}
          onBackToTour={() => {
            setViewMode('landing');
            window.scrollTo({ top: 0, behavior: 'instant' });
          }}
        />
      ) : (
        /* CINEMATIC SCROLLYTELLING LANDING PAGE */
        <>
          <Navbar 
            scrollProgress={scrollProgress}
            onSelectSection={handleSelectSection}
            onOpenAuth={() => setIsAuthOpen(true)}
            onEnterDashboard={() => handleEnterDashboard(user)}
            user={user} 
          />

          <main className="w-full">
            <HeroScrollytelling 
              ref={heroRef}
              onProgressUpdate={setScrollProgress}
              onBeginJourney={() => setIsAuthOpen(true)}
              onEnterDashboard={() => handleEnterDashboard(user)}
              user={user}
            />
          </main>

          <footer className="w-full py-4 px-6 text-center font-['Space_Grotesk'] text-[10px] tracking-widest text-[#B8C4D1]/40 bg-[#031225] border-t border-white/10 uppercase">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
              <span>SKYLINE <span className="tracking-normal font-['Noto_Sans_Devanagari',sans-serif]">सारथी</span> // AI AIRPLANE FARE PRICE PREDICTION ENGINE</span>
              <span>PRODUCTION ARCHITECTURE // FASTAPI & SCROLLYTELLING</span>
            </div>
          </footer>
        </>
      )}
    </div>
  );
}
