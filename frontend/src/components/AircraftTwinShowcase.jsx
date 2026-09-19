import React, { useState, useEffect, useRef } from 'react';
import { Plane, Play, Pause, RotateCw, Eye, Sparkles, Sliders, Layers } from 'lucide-react';

const TOTAL_FRAMES = 240;

export default function AircraftTwinShowcase() {
  const [frameIndex, setFrameIndex] = useState(1);
  const [isPlayingAutoExplode, setIsPlayingAutoExplode] = useState(false);
  const [activeTab, setActiveTab] = useState('both'); // 'both' | 'video' | 'exploded'
  const videoRef = useRef(null);

  // Auto-play explode animation
  useEffect(() => {
    let interval = null;
    if (isPlayingAutoExplode) {
      interval = setInterval(() => {
        setFrameIndex((prev) => (prev >= TOTAL_FRAMES ? 1 : prev + 1));
      }, 40);
    }
    return () => clearInterval(interval);
  }, [isPlayingAutoExplode]);

  const setPreset = (targetFrame) => {
    setIsPlayingAutoExplode(false);
    setFrameIndex(targetFrame);
  };

  return (
    <section id="digital-twin" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 pb-6 border-b border-metallic-gray/30">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono-avionics text-carbon-primary/70 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>INTERACTIVE DIGITAL TWIN // ASSET SHOWCASE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-carbon-primary tracking-tight">
            AIRCRAFT AVIONICS & VIDEO INSPECTOR
          </h2>
        </div>
        <p className="mt-4 md:mt-0 max-w-md text-xs sm:text-sm text-carbon-primary/80 font-mono-avionics leading-relaxed">
          Interactive cockpit inspection pairing the 360-degree floating studio video with the 240-frame exploded engineering cutaway.
        </p>
      </div>

      {/* View Switcher Tabs */}
      <div className="flex items-center justify-center mb-8">
        <div className="inline-flex p-1 rounded-xl bg-engine-gray/80 border border-metallic-gray/50 shadow-satin-subtle font-mono-avionics text-xs">
          <button
            onClick={() => setActiveTab('both')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'both'
                ? 'bg-carbon-primary text-aircraft-white font-bold shadow-sm'
                : 'text-carbon-primary/70 hover:text-carbon-primary'
            }`}
          >
            DUAL SPLIT VIEW
          </button>
          <button
            onClick={() => setActiveTab('video')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'video'
                ? 'bg-carbon-primary text-aircraft-white font-bold shadow-sm'
                : 'text-carbon-primary/70 hover:text-carbon-primary'
            }`}
          >
            360 STUDIO VIDEO ONLY
          </button>
          <button
            onClick={() => setActiveTab('exploded')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'exploded'
                ? 'bg-carbon-primary text-aircraft-white font-bold shadow-sm'
                : 'text-carbon-primary/70 hover:text-carbon-primary'
            }`}
          >
            240-FRAME EXPLODED ONLY
          </button>
        </div>
      </div>

      {/* Main Showcase Grid */}
      <div className={`grid gap-8 items-stretch ${
        activeTab === 'both' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
      }`}>
        
        {/* PANEL 1: 360 STUDIO VIDEO */}
        {(activeTab === 'both' || activeTab === 'video') && (
          <div className="p-6 rounded-2xl bg-aircraft-white border border-metallic-gray/50 shadow-satin-subtle flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-metallic-gray/20 mb-4 font-mono-avionics text-xs">
                <div className="flex items-center gap-2">
                  <RotateCw className="w-4 h-4 text-carbon-primary" />
                  <span className="font-bold text-carbon-primary">360° STUDIO FLIGHT VIDEO</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-engine-gray border border-metallic-gray/40 text-[10px] text-carbon-primary/80">
                  1080P PRO-RES
                </span>
              </div>

              {/* Video Player Box */}
              <div className="relative aspect-video rounded-xl overflow-hidden bg-[#9CA19B] border border-metallic-gray/40 shadow-inner group">
                <video
                  ref={videoRef}
                  src="/airplane_video.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-contain"
                />
                <div className="absolute inset-0 pointer-events-none studio-ambient-vignette" />

                <div className="absolute top-3 left-3 z-10 px-2 py-1 rounded bg-carbon-primary/80 backdrop-blur-sm text-[10px] font-mono-avionics text-aircraft-white">
                  FEED: LIVE 360 FLIGHT
                </div>
              </div>
            </div>

            {/* Video Description */}
            <div className="mt-4 pt-4 border-t border-metallic-gray/20 font-mono-avionics text-xs text-carbon-primary/80">
              <p className="leading-relaxed mb-2">
                Cinematic studio render demonstrating aerodynamic flight surface continuity and high-altitude cruise stability.
              </p>
              <div className="flex items-center justify-between text-[11px] text-carbon-primary/60">
                <span>FPS: 60.00</span>
                <span>STATUS: CONTINUOUS ROTATION</span>
              </div>
            </div>
          </div>
        )}

        {/* PANEL 2: 240-FRAME EXPLODED DISSECTION */}
        {(activeTab === 'both' || activeTab === 'exploded') && (
          <div className="p-6 rounded-2xl bg-aircraft-white border border-metallic-gray/50 shadow-satin-subtle flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-metallic-gray/20 mb-4 font-mono-avionics text-xs">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-carbon-primary" />
                  <span className="font-bold text-carbon-primary">240-FRAME EXPLODED DISSECTION</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-carbon-primary text-aircraft-white text-[10px] font-bold">
                  FRAME {String(frameIndex).padStart(3, '0')} / {TOTAL_FRAMES}
                </span>
              </div>

              {/* Image Frame Display Box */}
              <div className="relative aspect-video rounded-xl overflow-hidden bg-[#9CA19B] border border-metallic-gray/40 shadow-inner">
                <img
                  src={`/frames/frame-${String(frameIndex).padStart(3, '0')}.jpg`}
                  alt={`Exploded view frame ${frameIndex}`}
                  className="w-full h-full object-contain transition-opacity duration-75"
                />
                <div className="absolute inset-0 pointer-events-none studio-ambient-vignette" />

                <div className="absolute top-3 right-3 z-10 px-2 py-1 rounded bg-carbon-primary/80 backdrop-blur-sm text-[10px] font-mono-avionics text-aircraft-white">
                  DISSECTION: {Math.round((frameIndex / TOTAL_FRAMES) * 100)}%
                </div>
              </div>

              {/* Interactive Frame Slider */}
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between font-mono-avionics text-[10px] text-carbon-primary/70">
                  <span>SLIDE TO EXPAND INTERNAL AVIONICS:</span>
                  <span className="font-bold text-carbon-primary">FRAME #{frameIndex}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max={TOTAL_FRAMES}
                  value={frameIndex}
                  onChange={(e) => {
                    setIsPlayingAutoExplode(false);
                    setFrameIndex(Number(e.target.value));
                  }}
                  className="w-full h-2 bg-metallic-gray/60 rounded-lg appearance-none cursor-pointer accent-carbon-primary"
                />
              </div>

              {/* Presets & Animation Controls */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 font-mono-avionics text-[10px]">
                <button
                  type="button"
                  onClick={() => setPreset(1)}
                  className={`p-2 rounded-lg border transition-all ${
                    frameIndex === 1
                      ? 'bg-carbon-primary text-aircraft-white border-carbon-primary font-bold'
                      : 'bg-engine-gray/60 hover:bg-light-gray text-carbon-primary border-metallic-gray/40'
                  }`}
                >
                  Assembled (F-001)
                </button>
                <button
                  type="button"
                  onClick={() => setPreset(80)}
                  className={`p-2 rounded-lg border transition-all ${
                    frameIndex === 80
                      ? 'bg-carbon-primary text-aircraft-white border-carbon-primary font-bold'
                      : 'bg-engine-gray/60 hover:bg-light-gray text-carbon-primary border-metallic-gray/40'
                  }`}
                >
                  Turbine Core (F-080)
                </button>
                <button
                  type="button"
                  onClick={() => setPreset(160)}
                  className={`p-2 rounded-lg border transition-all ${
                    frameIndex === 160
                      ? 'bg-carbon-primary text-aircraft-white border-carbon-primary font-bold'
                      : 'bg-engine-gray/60 hover:bg-light-gray text-carbon-primary border-metallic-gray/40'
                  }`}
                >
                  Avionics Bus (F-160)
                </button>
                <button
                  type="button"
                  onClick={() => setPreset(240)}
                  className={`p-2 rounded-lg border transition-all ${
                    frameIndex === 240
                      ? 'bg-carbon-primary text-aircraft-white border-carbon-primary font-bold'
                      : 'bg-engine-gray/60 hover:bg-light-gray text-carbon-primary border-metallic-gray/40'
                  }`}
                >
                  Full Explode (F-240)
                </button>
              </div>
            </div>

            {/* Auto Play / Pause Toggle */}
            <div className="mt-4 pt-4 border-t border-metallic-gray/20 flex items-center justify-between font-mono-avionics text-xs">
              <button
                type="button"
                onClick={() => setIsPlayingAutoExplode(!isPlayingAutoExplode)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-carbon-primary hover:bg-carbon-secondary text-aircraft-white font-bold transition-all shadow-sm active:scale-95"
              >
                {isPlayingAutoExplode ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlayingAutoExplode ? 'PAUSE CYCLE' : 'AUTO-CYCLE EXPLODE'}</span>
              </button>
              <span className="text-[11px] text-carbon-primary/60">
                PRE-RENDERED 240 FRAMES
              </span>
            </div>

          </div>
        )}

      </div>
    </section>
  );
}
