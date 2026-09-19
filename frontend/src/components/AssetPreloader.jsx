import React, { useEffect, useState } from 'react';

export default function AssetPreloader({ onReady }) {
  const [progress, setProgress] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Preload critical initial 6 frames + key dashboard assets
    const criticalFrames = 6;
    let loaded = 0;
    const totalCritical = criticalFrames + 2; // + frame-240 and aircraft image

    // Safety fallback: maximum 900ms loading gate before fading into UI
    const safetyTimer = setTimeout(() => {
      setFading(true);
      setTimeout(() => onReady && onReady(), 200);
    }, 900);

    const markLoaded = () => {
      loaded++;
      setProgress(Math.round((loaded / totalCritical) * 100));
      if (loaded >= totalCritical) {
        clearTimeout(safetyTimer);
        setFading(true);
        setTimeout(() => onReady && onReady(), 200);
      }
    };

    // Preload first 6 frames
    for (let i = 1; i <= criticalFrames; i++) {
      const img = new Image();
      const numStr = String(i).padStart(3, '0');
      img.src = `/optimized-frames/frame-${numStr}.jpg`;
      img.onload = markLoaded;
      img.onerror = markLoaded;
    }

    // Preload dashboard background and aircraft image
    const bgImg = new Image();
    bgImg.src = '/optimized-frames/frame-240.jpg';
    bgImg.onload = markLoaded;
    bgImg.onerror = markLoaded;

    const planeImg = new Image();
    planeImg.src = '/indigo_a320.jpg';
    planeImg.onload = markLoaded;
    planeImg.onerror = markLoaded;

    return () => clearTimeout(safetyTimer);
  }, [onReady]);

  return (
    <div 
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#031225] text-[#F5F7FA] font-['Space_Grotesk'] transition-opacity duration-500 select-none ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Brand Mark */}
      <div className="text-center mb-8">
        <span className="text-xs font-semibold tracking-[0.4em] text-[#B8C4D1] uppercase">
          SKYLINE <span className="text-sky-400 tracking-normal font-['Noto_Sans_Devanagari',sans-serif]">सारथी</span> // AVIONICS
        </span>
        <h2 className="text-lg font-light tracking-[0.2em] text-[#F5F7FA] mt-1">
          AIRFARE PRICE PREDICTION
        </h2>
      </div>

      {/* Minimal Horizon Loading Line */}
      <div className="w-48 h-0.5 bg-[#0B3157] rounded-full overflow-hidden relative">
        <div 
          className="h-full bg-gradient-to-r from-[#2D74B4] via-[#88B3DC] to-white rounded-full transition-all duration-200"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-4 text-[10px] tracking-[0.25em] text-[#B8C4D1]/60 uppercase">
        PREPARING CINEMATIC VIEW {progress}%
      </div>
    </div>
  );
}
