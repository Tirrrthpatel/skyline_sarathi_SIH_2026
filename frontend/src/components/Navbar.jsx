import React from 'react';
import { Plane } from 'lucide-react';

export default function Navbar({ scrollProgress = 0, onOpenAuth, onEnterDashboard, user }) {
  // Hide navbar on the initial screen (scrollProgress <= 0.04) as requested in Section 2 & 4
  const isInitial = scrollProgress <= 0.04;
  const opacity = isInitial ? 0 : Math.min((scrollProgress - 0.04) / 0.04, 1);

  return (
    <header 
      className="fixed top-0 left-0 right-0 z-40 py-5 px-6 sm:px-12 flex items-center justify-between pointer-events-none transition-opacity duration-300"
      style={{
        opacity,
        pointerEvents: opacity > 0.6 ? 'auto' : 'none',
      }}
    >
      {/* LEFT: Minimal Skyline सारथी Brand */}
      <div 
        className="pointer-events-auto cursor-pointer flex items-center gap-2"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <Plane className="w-4 h-4 text-white transform -rotate-45" />
        <span className="font-['Space_Grotesk'] text-sm font-bold tracking-[0.2em] text-[#F5F7FA] uppercase drop-shadow select-none">
          Skyline <span className="text-sky-400 font-bold tracking-normal font-['Noto_Sans_Devanagari',sans-serif]">सारथी</span>
        </span>
      </div>

      {/* RIGHT: Action Triggers (Dashboard & Sign In / Profile) */}
      <div className="pointer-events-auto flex items-center gap-2.5">
        <button
          onClick={onEnterDashboard}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-['Space_Grotesk'] font-bold text-white bg-blue-600/80 hover:bg-blue-600 border border-blue-400/40 backdrop-blur-md shadow-md transition-all duration-200 active:scale-95 cursor-pointer"
        >
          <Plane className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={onOpenAuth}
          className="group inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-['Space_Grotesk'] font-bold text-slate-900 bg-white/65 hover:bg-white/85 border border-white/80 backdrop-blur-md shadow-sm transition-all duration-200 active:scale-95 select-none cursor-pointer"
        >
          <span>{user ? (user.isGuest ? 'Guest' : user.name.split(' ')[0]) : 'Sign In / Guest'}</span>
          <span className="text-xs transition-transform duration-200 group-hover:translate-x-1 text-blue-600">→</span>
        </button>
      </div>
    </header>
  );
}
