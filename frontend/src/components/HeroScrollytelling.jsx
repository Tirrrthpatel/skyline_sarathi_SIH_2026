import React, { useRef, useEffect, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { 
  ArrowRight, 
  TrendingDown, 
  Cpu, 
  Database, 
  Layers, 
  BarChart3, 
  Sparkles,
  Calendar,
  CheckCircle2,
  Plane,
  Compass
} from 'lucide-react';
// Dashboard is mounted in App.jsx as a fixed single-screen application

const TOTAL_FRAMES = 240;
const FRAME_DIRECTORY = '/optimized-frames';
const FRAME_PREFIX = 'frame-';

/**
 * Maps scroll progress (0.0 -> 0.90) to camera frame index (1 -> 240)
 * Beyond 0.90, the camera freezes on the final cinematic frame (240) as the dashboard appears.
 */
function mapProgressToFrame(p) {
  if (p <= 0.0) return 1;
  if (p >= 0.90) return 240; // Freeze at final cloudscape for dashboard

  // Normalize 0.0 -> 0.90 to 0.0 -> 1.0
  const normP = p / 0.90;

  if (normP <= 0.12) {
    return 1 + (normP / 0.12) * (30 - 1);
  } else if (normP <= 0.29) {
    return 30 + ((normP - 0.12) / (0.29 - 0.12)) * (70 - 30);
  } else if (normP <= 0.46) {
    return 70 + ((normP - 0.29) / (0.46 - 0.29)) * (110 - 70);
  } else if (normP <= 0.58) {
    return 110 + ((normP - 0.46) / (0.58 - 0.46)) * (140 - 110);
  } else if (normP <= 0.67) {
    return 140 + ((normP - 0.58) / (0.67 - 0.58)) * (160 - 140);
  } else if (normP <= 0.79) {
    return 160 + ((normP - 0.67) / (0.79 - 0.67)) * (190 - 160);
  } else if (normP <= 0.92) {
    return 190 + ((normP - 0.79) / (0.92 - 0.79)) * (220 - 190);
  } else {
    return 220 + ((normP - 0.92) / (1.00 - 0.92)) * (240 - 220);
  }
}

/**
 * Calculates smooth GPU-accelerated opacity, translateY, and scale for each scene
 * (Omitted CSS blur filter to ensure 60fps on mobile and Cloudflare tunnel)
 */
function getSectionTransform(progress, start, center, end) {
  if (progress < start || progress > end) {
    return { opacity: 0, translateY: 24, scale: 0.96, pointerEvents: 'none' };
  }

  const halfSpan = (end - start) / 2;
  const dist = Math.abs(progress - center) / halfSpan;

  if (dist >= 1.0) {
    return { opacity: 0, translateY: 24, scale: 0.96, pointerEvents: 'none' };
  }

  let opacity = 1;
  let translateY = 0;
  let scale = 1;

  if (dist > 0.35) {
    const t = (dist - 0.35) / (1.0 - 0.35);
    opacity = Math.max(0, 1 - t * 1.2);
    scale = 1 - t * 0.04;
    translateY = (progress > center ? -1 : 1) * t * 20;
  }

  return {
    opacity,
    translateY,
    scale,
    pointerEvents: opacity > 0.6 ? 'auto' : 'none',
  };
}

const HeroScrollytelling = forwardRef(function HeroScrollytelling(
  { onBeginJourney, onProgressUpdate, onEnterDashboard, user },
  ref
) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Scene 2 Flight Input State
  const [scene2Params, setScene2Params] = useState({
    origin: 'AMD',
    destination: 'DEL',
    departure_date: '2026-10-20',
    travellers: 1,
    cabin_class: 'economy',
    trip_type: 'one_way'
  });

  // Animation references
  const imagesRef = useRef([]);
  const lastDrawnImageRef = useRef(null);
  const lastDrawnIndexRef = useRef(-1);
  const currentFrameRef = useRef(1);
  const targetFrameRef = useRef(1);
  const destroyedRef = useRef(false);
  const lastRequestedIdxRef = useRef(-999);
  const requestedSetRef = useRef(new Set());

  // Scroll to specific section
  useImperativeHandle(ref, () => ({
    scrollToSection(sectionId) {
      if (!containerRef.current) return;
      const totalScrollable = containerRef.current.offsetHeight - window.innerHeight;
      let targetProgress = 0;
      if (sectionId === 'flight') targetProgress = 0.22;
      else if (sectionId === 'prediction') targetProgress = 0.35;
      else if (sectionId === 'insights') targetProgress = 0.49;
      else if (sectionId === 'dates') targetProgress = 0.62;
      else if (sectionId === 'factors') targetProgress = 0.74;
      else if (sectionId === 'pipeline') targetProgress = 0.85;
      else if (sectionId === 'dashboard') targetProgress = 0.95;
      window.scrollTo({ top: targetProgress * totalScrollable, behavior: 'smooth' });
    },
  }));

  const scrollToDashboard = () => {
    if (!containerRef.current) return;
    const totalScrollable = containerRef.current.offsetHeight - window.innerHeight;
    window.scrollTo({ top: 0.95 * totalScrollable, behavior: 'smooth' });
  };

  // Ultra-fast Canvas draw function with hardware buffer scaling, deduplication, and nearest-frame fallback
  const drawFrame = useCallback((frameNum) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const safeIndex = Math.min(Math.max(1, Math.round(frameNum)), TOTAL_FRAMES) - 1;
    let img = imagesRef.current[safeIndex];

    // Outward nearest-neighbor fallback: fast O(1) average lookup
    if (!img || !img.complete || img.naturalWidth === 0) {
      for (let offset = 0; offset < TOTAL_FRAMES; offset++) {
        const left = safeIndex - offset;
        if (left >= 0 && imagesRef.current[left]?.complete && imagesRef.current[left]?.naturalWidth > 0) {
          img = imagesRef.current[left];
          break;
        }
        const right = safeIndex + offset;
        if (right < TOTAL_FRAMES && imagesRef.current[right]?.complete && imagesRef.current[right]?.naturalWidth > 0) {
          img = imagesRef.current[right];
          break;
        }
      }
    }

    const imageToDraw = (img && img.complete && img.naturalWidth > 0)
      ? img
      : lastDrawnImageRef.current;

    if (!imageToDraw || imageToDraw.naturalWidth === 0) return;

    // Deduplication: skip redraw if the exact same image and frame index is already on screen
    if (imageToDraw === lastDrawnImageRef.current && safeIndex === lastDrawnIndexRef.current) {
      return;
    }

    lastDrawnImageRef.current = imageToDraw;
    lastDrawnIndexRef.current = safeIndex;

    const bufferWidth = canvas.width;
    const bufferHeight = canvas.height;

    ctx.imageSmoothingEnabled = true;

    const imgWidth = imageToDraw.naturalWidth;
    const imgHeight = imageToDraw.naturalHeight;
    const imgRatio = imgWidth / imgHeight;
    const screenRatio = bufferWidth / bufferHeight;

    let drawWidth, drawHeight;
    let offsetX = 0;
    let offsetY = 0;

    if (screenRatio > imgRatio) {
      drawWidth = bufferWidth;
      drawHeight = bufferWidth / imgRatio;
      offsetY = (bufferHeight - drawHeight) / 2;
    } else {
      drawHeight = bufferHeight;
      drawWidth = bufferHeight * imgRatio;
      offsetX = (bufferWidth - drawWidth) / 2;
    }

    ctx.drawImage(imageToDraw, offsetX, offsetY, drawWidth, drawHeight);
  }, []);

  // Preload frames: 1. Keyframe grid across whole timeline, 2. Progressive background fill
  useEffect(() => {
    destroyedRef.current = false;
    const preloadedImages = new Array(TOTAL_FRAMES);

    const loadSingleFrame = (idx) => {
      if (idx < 0 || idx >= TOTAL_FRAMES) return;
      if (requestedSetRef.current.has(idx)) return;
      requestedSetRef.current.add(idx);

      const frameIndex = idx + 1;
      const img = new Image();
      img.decoding = 'async';
      const framePadded = String(frameIndex).padStart(3, '0');
      img.src = `${FRAME_DIRECTORY}/${FRAME_PREFIX}${framePadded}.jpg`;

      img.onload = () => {
        if (!destroyedRef.current) {
          preloadedImages[idx] = img;
          const cur = Math.round(currentFrameRef.current);
          const tgt = Math.round(targetFrameRef.current);
          if (Math.abs(cur - (idx + 1)) <= 15 || Math.abs(tgt - (idx + 1)) <= 15) {
            drawFrame(currentFrameRef.current);
          }
        }
      };
      img.onerror = () => {
        if (!destroyedRef.current && img.src.includes('optimized-frames')) {
          img.src = `/frames/${FRAME_PREFIX}${framePadded}.jpg`;
        }
      };
      preloadedImages[idx] = img;
    };

    // Phase 1: Load 25 keyframes sampled across the entire timeline (every 10th frame + 240)
    // Guarantees immediate working scroll animation across all 750vh in ~1 second!
    for (let i = 0; i < TOTAL_FRAMES; i += 10) {
      loadSingleFrame(i);
    }
    loadSingleFrame(TOTAL_FRAMES - 1);

    // Phase 2: Load initial 15 frames for silky smooth start
    for (let i = 0; i < 15; i++) {
      loadSingleFrame(i);
    }

    // Phase 3: Fill remainder in gentle background batches
    let currentBatchStart = 15;
    const batchSize = 12;

    const loadNextBatch = () => {
      if (destroyedRef.current || currentBatchStart >= TOTAL_FRAMES) return;
      const end = Math.min(currentBatchStart + batchSize, TOTAL_FRAMES);
      for (let i = currentBatchStart; i < end; i++) {
        loadSingleFrame(i);
      }
      currentBatchStart = end;
      if (currentBatchStart < TOTAL_FRAMES) {
        setTimeout(loadNextBatch, 100);
      }
    };

    const timer = setTimeout(loadNextBatch, 300);
    imagesRef.current = preloadedImages;

    return () => {
      destroyedRef.current = true;
      clearTimeout(timer);
    };
  }, [drawFrame]);

  // Handle high-DPI resize & requestAnimationFrame loop (Mobile-optimized 1x DPR)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      // 1x DPR on mobile (<768px) to prevent GPU fillrate choking; max 1.5x on desktop
      const dpr = window.innerWidth < 768 ? 1 : Math.min(window.devicePixelRatio || 1, 1.5);
      const width = window.innerWidth;
      const height = window.innerHeight;

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      lastDrawnIndexRef.current = -1; // force redraw on resize
      drawFrame(currentFrameRef.current);
    };

    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });

    let rafId;
    const loop = () => {
      const target = targetFrameRef.current;
      const current = currentFrameRef.current;
      const diff = target - current;

      if (Math.abs(diff) > 0.02) {
        currentFrameRef.current += diff * 0.28; // Snappy, direct response without lag
        drawFrame(currentFrameRef.current);
      } else if (current !== target) {
        currentFrameRef.current = target;
        drawFrame(target);
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
    };
  }, [drawFrame]);

  // Track scroll position across 750vh with throttled on-demand priority loader
  useEffect(() => {
    const handleScroll = () => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const scrollableDistance = container.offsetHeight - window.innerHeight;

      if (scrollableDistance <= 0) return;

      const progress = Math.min(Math.max(0, -rect.top / scrollableDistance), 1);
      setScrollProgress(progress);
      onProgressUpdate?.(progress);

      const targetFrame = mapProgressToFrame(progress);
      targetFrameRef.current = targetFrame;

      // Throttled on-demand priority load (each frame requested at most once)
      const targetIdx = Math.round(targetFrame) - 1;
      if (Math.abs(targetIdx - lastRequestedIdxRef.current) >= 2) {
        lastRequestedIdxRef.current = targetIdx;
        for (let d = -2; d <= 2; d++) {
          const idx = targetIdx + d;
          if (idx >= 0 && idx < TOTAL_FRAMES && !requestedSetRef.current.has(idx)) {
            requestedSetRef.current.add(idx);
            const frameIndex = idx + 1;
            const img = new Image();
            img.decoding = 'async';
            const framePadded = String(frameIndex).padStart(3, '0');
            img.src = `${FRAME_DIRECTORY}/${FRAME_PREFIX}${framePadded}.jpg`;
            img.onload = () => {
              if (!destroyedRef.current) {
                imagesRef.current[idx] = img;
                drawFrame(currentFrameRef.current);
              }
            };
            imagesRef.current[idx] = img;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [onProgressUpdate, drawFrame]);

  // ====================================================================
  // PROGRESSIVE SCENE TIMINGS
  // ====================================================================
  // Initial Minimal Screen (0.0 -> 0.05): SkyPredict logo + BEGIN JOURNEY CTA
  const isInitial = scrollProgress <= 0.04;
  const initialOpacity = Math.max(0, 1 - (scrollProgress / 0.04));

  // Scene 1: "Your journey starts with the right price." (~0.05 -> 0.17)
  const s1 = getSectionTransform(scrollProgress, 0.04, 0.10, 0.18);
  // Scene 2: "Where are you flying next?" + Minimal Flight Input (~0.17 -> 0.31)
  const s2 = getSectionTransform(scrollProgress, 0.17, 0.24, 0.32);
  // Scene 3: Fare Prediction Visualization (~0.31 -> 0.44)
  const s3 = getSectionTransform(scrollProgress, 0.31, 0.37, 0.45);
  // Scene 4: Price Insight & Curve (~0.44 -> 0.57)
  const s4 = getSectionTransform(scrollProgress, 0.44, 0.50, 0.58);
  // Scene 5: Date Analysis (~0.57 -> 0.70)
  const s5 = getSectionTransform(scrollProgress, 0.57, 0.63, 0.71);
  // Scene 6: Fare Factors (~0.70 -> 0.82)
  const s6 = getSectionTransform(scrollProgress, 0.70, 0.76, 0.83);
  // Scene 7: Machine Learning Pipeline (~0.82 -> 0.91)
  const s7 = getSectionTransform(scrollProgress, 0.82, 0.87, 0.92);

  // Dashboard Layered Transition: begins at 0.90, full at 0.93 - 1.0
  const isDashboardVisible = scrollProgress >= 0.89;
  const dashboardOpacity = Math.min(Math.max((scrollProgress - 0.89) / 0.04, 0), 1);

  return (
    <div ref={containerRef} className="relative w-full h-[750vh] bg-[#0e274c]">
      {/* Sticky Fullscreen Viewport holding the cinematic hardware canvas */}
      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden select-none bg-[#0e274c]">
        
        {/* Fallback poster */}
        <img
          src={`${FRAME_DIRECTORY}/${FRAME_PREFIX}001.jpg`}
          alt="Aviation Background Frame"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />

        {/* 60FPS Hardware Canvas - Remains as the continuous background */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full block"
          style={{
            imageRendering: '-webkit-optimize-contrast',
            filter: 'contrast(1.04) brightness(1.01) saturate(1.02)',
            transform: 'translate3d(0, 0, 0)',
            willChange: 'transform',
          }}
        />

        {/* ====================================================================
            INITIAL LANDING SCREEN (0% scroll)
            Extremely minimal: Background + SkyPredict logo + Center BEGIN JOURNEY CTA
            Flow A: Click -> Login / Sign Up modal (NO scroll)
            Flow B: Scroll -> Begins cinematic camera movement
            ==================================================================== */}
        {initialOpacity > 0.01 && (
          <div 
            className="absolute inset-0 z-30 flex flex-col items-center justify-between p-8 sm:p-12 text-center select-none"
            style={{
              opacity: initialOpacity,
              pointerEvents: initialOpacity > 0.5 ? 'auto' : 'none',
              transition: 'opacity 0.2s ease-out',
            }}
          >
            {/* Minimal Brand */}
            <div className="flex items-center gap-2.5 pt-4">
              <Plane className="w-5 h-5 text-white transform -rotate-45" />
              <span className="font-['Space_Grotesk'] font-bold text-sm tracking-[0.2em] text-white uppercase drop-shadow-md">
                Skyline <span className="text-sky-400 font-bold tracking-normal font-['Noto_Sans_Devanagari',sans-serif]">सारथी</span>
              </span>
            </div>

            {/* Center: BEGIN JOURNEY CTA */}
            <div className="max-w-md w-full my-auto flex flex-col items-center">
              <button
                onClick={onBeginJourney}
                className="group inline-flex items-center gap-3 px-10 py-4 sm:py-4.5 rounded-full bg-[#061A33] hover:bg-blue-900 text-[#F5F7FA] font-['Space_Grotesk'] font-bold text-xs uppercase tracking-[0.22em] shadow-[0_8px_30px_rgba(0,0,0,0.8)] border border-white/20 hover:scale-105 active:scale-95 transition-all duration-300 pointer-events-auto cursor-pointer"
              >
                <span>BEGIN JOURNEY</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1.5 text-[#88B3DC]" />
              </button>

              {/* Transparent Subtitle */}
              <div className="mt-4 flex justify-center">
                <p className="text-white/90 text-xs font-['Space_Grotesk'] font-medium tracking-wider drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] text-center">
                  Predict your fare. Plan your journey.
                </p>
              </div>
            </div>

            {/* Scroll Hint */}
            <div className="pb-4 flex items-center justify-center">
              <span className="inline-flex items-center gap-2 text-[10px] font-['Space_Grotesk'] font-bold text-white/90 tracking-widest uppercase drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
                <span>Scroll to explore</span>
                <span className="animate-bounce text-sky-400">↓</span>
              </span>
            </div>
          </div>
        )}

        {/* ====================================================================
            SCENE 1: FIRST SCROLL CONTENT (~10% scroll)
            "Your journey starts with the right price."
            ==================================================================== */}
        {s1.opacity > 0.01 && (
          <div 
            className="absolute inset-0 z-20 flex flex-col items-center justify-center p-4 sm:p-6 text-center select-none"
            style={{
              opacity: s1.opacity,
              transform: `translate3d(0, ${s1.translateY}px, 0) scale(${s1.scale})`,
              pointerEvents: s1.pointerEvents,
              willChange: 'opacity, transform',
            }}
          >
            <div className="max-w-2xl bg-transparent px-2">
              <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-['Space_Grotesk'] font-bold tracking-[0.16em] text-[#F5F7FA] uppercase leading-none drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)]">
                Your journey starts
              </h1>
              <span className="block font-['Playfair_Display'] italic font-medium text-3xl sm:text-5xl md:text-6xl lg:text-7xl text-white tracking-wide mt-2 mb-4 sm:mb-6 leading-tight drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)]">
                with the right price.
              </span>

              {/* Subtitle - Transparent */}
              <div className="mt-2 sm:mt-4 flex justify-center">
                <p className="text-white/90 text-xs sm:text-sm font-['Space_Grotesk'] font-medium tracking-wider drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] text-center">
                  Predict. Compare. Travel smarter.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================================
            SCENE 2: FLIGHT SEARCH CONTENT (~24% scroll)
            "Where are you flying next?" + Minimal Flight Input
            ==================================================================== */}
        {s2.opacity > 0.01 && (
          <div 
            className="absolute inset-0 z-20 flex flex-col items-center justify-center p-4 sm:p-6 text-center select-none"
            style={{
              opacity: s2.opacity,
              transform: `translate3d(0, ${s2.translateY}px, 0) scale(${s2.scale})`,
              pointerEvents: s2.pointerEvents,
              willChange: 'opacity, transform',
            }}
          >
            <div className="max-w-2xl w-full bg-transparent px-2">
              <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-['Space_Grotesk'] font-bold tracking-[0.16em] text-[#F5F7FA] uppercase leading-none drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)]">
                Where are you
              </h2>
              <span className="block font-['Playfair_Display'] italic font-medium text-3xl sm:text-5xl md:text-6xl lg:text-7xl text-white tracking-wide mt-1.5 mb-3 sm:mb-4 leading-tight drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)]">
                flying next?
              </span>

              {/* Subtitle - Transparent */}
              <div className="mt-1 mb-4 sm:mb-6 flex justify-center">
                <p className="text-white/90 text-xs sm:text-sm font-['Space_Grotesk'] font-medium tracking-wide drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] max-w-md text-center">
                  Enter your journey details and discover what your flight could cost.
                </p>
              </div>

              {/* Transparent Glass Prediction Input Card */}
              <div className="p-4 sm:p-5 rounded-3xl bg-white/45 backdrop-blur-2xl border border-white/70 shadow-[0_8px_32px_0_rgba(15,23,42,0.15)] text-left max-w-lg mx-auto w-full">
                <div className="grid grid-cols-2 gap-2.5 mb-2.5">
                  <div className="p-2 sm:p-2.5 rounded-xl bg-white/60 border border-white/80 shadow-sm">
                    <span className="block text-[9px] font-bold text-slate-700 uppercase">FROM</span>
                    <input
                      type="text"
                      value={scene2Params.origin}
                      onChange={(e) => setScene2Params({ ...scene2Params, origin: e.target.value.toUpperCase() })}
                      className="w-full bg-transparent text-xs font-bold text-slate-900 uppercase focus:outline-none mt-0.5"
                    />
                    <span className="text-[9px] text-slate-500 font-semibold truncate block">Ahmedabad (AMD)</span>
                  </div>
                  <div className="p-2 sm:p-2.5 rounded-xl bg-white/60 border border-white/80 shadow-sm">
                    <span className="block text-[9px] font-bold text-slate-700 uppercase">TO</span>
                    <input
                      type="text"
                      value={scene2Params.destination}
                      onChange={(e) => setScene2Params({ ...scene2Params, destination: e.target.value.toUpperCase() })}
                      className="w-full bg-transparent text-xs font-bold text-slate-900 uppercase focus:outline-none mt-0.5"
                    />
                    <span className="text-[9px] text-slate-500 font-semibold truncate block">Delhi (DEL)</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mb-3.5 text-xs">
                  <div className="p-1.5 sm:p-2 rounded-xl bg-white/60 border border-white/80 shadow-sm text-center">
                    <span className="block text-[8px] text-slate-700 font-bold uppercase">DATE</span>
                    <span className="font-bold text-slate-900 text-[10px] sm:text-[11px]">20 Oct 2026</span>
                  </div>
                  <div className="p-1.5 sm:p-2 rounded-xl bg-white/60 border border-white/80 shadow-sm text-center">
                    <span className="block text-[8px] text-slate-700 font-bold uppercase">TRAVELLER</span>
                    <span className="font-bold text-slate-900 text-[10px] sm:text-[11px]">1 Adult</span>
                  </div>
                  <div className="p-1.5 sm:p-2 rounded-xl bg-white/60 border border-white/80 shadow-sm text-center">
                    <span className="block text-[8px] text-slate-700 font-bold uppercase">CLASS</span>
                    <span className="font-bold text-slate-900 text-[10px] sm:text-[11px]">Economy</span>
                  </div>
                </div>

                <button
                  onClick={onEnterDashboard || scrollToDashboard}
                  className="w-full py-2.5 sm:py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-['Space_Grotesk'] font-bold text-xs uppercase tracking-[0.16em] shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>Predict Fare</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================================
            SCENE 3: FARE PREDICTION VISUALIZATION (~37% scroll)
            "A ticket price is never just a number."
            ==================================================================== */}
        {s3.opacity > 0.01 && (
          <div 
            className="absolute inset-0 z-20 flex flex-col items-center justify-center p-4 sm:p-6 text-center select-none"
            style={{
              opacity: s3.opacity,
              transform: `translate3d(0, ${s3.translateY}px, 0) scale(${s3.scale})`,
              pointerEvents: s3.pointerEvents,
              willChange: 'opacity, transform',
            }}
          >
            <div className="max-w-2xl w-full bg-transparent px-2">
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-['Space_Grotesk'] font-bold tracking-[0.16em] text-[#F5F7FA] uppercase leading-none drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)]">
                A ticket price
              </h2>
              <span className="block font-['Playfair_Display'] italic font-medium text-3xl sm:text-5xl md:text-6xl text-white tracking-wide mt-1 mb-2.5 sm:mb-3 leading-tight drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)]">
                is never just a number.
              </span>

              {/* Subtitle - Transparent */}
              <div className="mt-1 mb-4 sm:mb-6 flex justify-center">
                <p className="text-white/90 text-xs sm:text-sm font-['Space_Grotesk'] font-medium tracking-wide drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] max-w-md text-center">
                  Our machine-learning model analyzes route, airline, timing & historical factors to estimate expected fare.
                </p>
              </div>

              {/* Transparent Glass Prediction Card */}
              <div className="p-4 sm:p-6 rounded-3xl bg-white/45 backdrop-blur-2xl border border-white/70 shadow-[0_8px_32px_0_rgba(15,23,42,0.15)] text-left max-w-lg mx-auto w-full">
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-300/70 mb-3 sm:mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                    <span className="text-[10px] tracking-[0.2em] font-bold text-slate-900 uppercase font-['Space_Grotesk']">
                      AMD → DEL // 20 OCT 2026
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-white/70 border border-slate-300 text-[9px] sm:text-[10px] font-bold text-slate-900 shadow-sm">
                    CONFIDENCE 87%
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <span className="block text-[9px] sm:text-[10px] font-bold tracking-[0.2em] text-slate-600 uppercase">PREDICTED FARE</span>
                    <span className="text-2xl sm:text-4xl font-bold font-['Space_Grotesk'] text-slate-900">₹5,612</span>
                  </div>
                  <div>
                    <span className="block text-[9px] sm:text-[10px] font-bold tracking-[0.2em] text-slate-600 uppercase">EXPECTED RANGE</span>
                    <span className="text-base sm:text-xl font-bold font-['Space_Grotesk'] text-slate-800 mt-1 block">
                      ₹4,400 — ₹5,300
                    </span>
                  </div>
                </div>

                <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-slate-300/70 flex items-center justify-between text-[10px] sm:text-[11px] text-slate-800">
                  <span className="flex items-center gap-1.5 text-emerald-800 font-bold">
                    <TrendingDown className="w-3.5 h-3.5" />
                    Optimal Booking Window (14d Ahead)
                  </span>
                  <span className="font-semibold text-slate-700">Direct // 1h 35m</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================================
            SCENE 4: PRICE INSIGHT (~50% scroll)
            "Know the price. Before you book."
            ==================================================================== */}
        {s4.opacity > 0.01 && (
          <div 
            className="absolute inset-0 z-20 flex flex-col items-center justify-center p-4 sm:p-6 text-center select-none"
            style={{
              opacity: s4.opacity,
              transform: `translate3d(0, ${s4.translateY}px, 0) scale(${s4.scale})`,
              pointerEvents: s4.pointerEvents,
              willChange: 'opacity, transform',
            }}
          >
            <div className="max-w-2xl w-full bg-transparent px-2">
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-['Space_Grotesk'] font-bold tracking-[0.16em] text-[#F5F7FA] uppercase leading-none drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)]">
                Know the price.
              </h2>
              <span className="block font-['Playfair_Display'] italic font-medium text-3xl sm:text-5xl md:text-6xl text-white tracking-wide mt-1 mb-2 sm:mb-3 leading-tight drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)]">
                Before you book.
              </span>

              {/* Subtitle - Transparent */}
              <div className="mt-1 mb-4 sm:mb-6 flex justify-center">
                <p className="text-white/90 text-xs sm:text-sm font-['Space_Grotesk'] font-medium tracking-wide drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] max-w-md text-center">
                  Understand whether the current fare is relatively low, average or high based on historical patterns.
                </p>
              </div>

              {/* Transparent Glass Graph Card with Text & Graph in Black */}
              <div className="p-4 sm:p-6 rounded-3xl bg-white/45 backdrop-blur-2xl border border-white/70 shadow-[0_8px_32px_0_rgba(15,23,42,0.15)] text-left max-w-xl mx-auto w-full">
                <div className="flex items-center justify-between mb-2.5 text-[9px] sm:text-[10px]">
                  <span className="font-bold tracking-wider uppercase text-slate-900 font-['Space_Grotesk']">
                    HISTORICAL VS PREDICTED FARE TREND
                  </span>
                  <span className="text-emerald-800 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                    Current: Low (Great Deal)
                  </span>
                </div>

                <div className="relative h-24 sm:h-28 w-full">
                  <svg className="w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="blackGlassGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0f172a" stopOpacity="0.16" />
                        <stop offset="100%" stopColor="#0f172a" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <rect x="0" y="30" width="400" height="40" fill="rgba(15, 23, 42, 0.04)" rx="4" />
                    <line x1="0" y1="50" x2="400" y2="50" stroke="#94a3b8" strokeDasharray="4 4" strokeWidth="1" />
                    <path d="M 0,80 Q 80,40 160,65 T 320,35 L 400,45 L 400,100 L 0,100 Z" fill="url(#blackGlassGradient)" />
                    {/* Graph in Black */}
                    <path d="M 0,80 Q 80,40 160,65 T 320,35 L 400,45" fill="none" stroke="#000000" strokeWidth="3" />
                    <circle cx="320" cy="35" r="5.5" fill="#000000" stroke="#FFFFFF" strokeWidth="2.5" />
                  </svg>

                  <div className="absolute top-1 right-2 text-[8px] sm:text-[9px] font-mono font-bold text-slate-900 bg-white/80 border border-slate-300 px-2 py-0.5 rounded backdrop-blur-sm shadow-sm">
                    AVG FARE ₹5,420
                  </div>
                  <div className="absolute top-5 sm:top-6 left-1/2 text-[8px] sm:text-[9px] font-mono font-bold text-slate-900 bg-white/90 border border-emerald-400 px-2 py-0.5 rounded shadow-sm">
                    PREDICTED ₹4,850 (-11%)
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-slate-300/80 text-center">
                  <div>
                    <span className="block text-[8px] sm:text-[9px] text-slate-600 font-bold">HISTORICAL LOW</span>
                    <span className="text-xs sm:text-sm font-black text-slate-900">₹4,200</span>
                  </div>
                  <div>
                    <span className="block text-[8px] sm:text-[9px] text-slate-600 font-bold">AVERAGE FARE</span>
                    <span className="text-xs sm:text-sm font-black text-slate-900">₹5,420</span>
                  </div>
                  <div>
                    <span className="block text-[8px] sm:text-[9px] text-emerald-800 font-bold">PREDICTED NOW</span>
                    <span className="text-xs sm:text-sm font-black text-emerald-900">₹4,850</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================================
            SCENE 5: DATE ANALYSIS (~63% scroll)
            "Timing changes everything."
            ==================================================================== */}
        {s5.opacity > 0.01 && (
          <div 
            className="absolute inset-0 z-20 flex flex-col items-center justify-center p-4 sm:p-6 text-center select-none"
            style={{
              opacity: s5.opacity,
              transform: `translate3d(0, ${s5.translateY}px, 0) scale(${s5.scale})`,
              pointerEvents: s5.pointerEvents,
              willChange: 'opacity, transform',
            }}
          >
            <div className="max-w-2xl w-full bg-transparent px-2">
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-['Space_Grotesk'] font-bold tracking-[0.16em] text-[#F5F7FA] uppercase leading-none drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)]">
                Timing changes
              </h2>
              <span className="block font-['Playfair_Display'] italic font-medium text-3xl sm:text-5xl md:text-6xl text-white tracking-wide mt-1 mb-2 sm:mb-3 leading-tight drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)]">
                everything.
              </span>

              {/* Subtitle - Transparent */}
              <div className="mt-1 mb-4 sm:mb-6 flex justify-center">
                <p className="text-white/90 text-xs sm:text-sm font-['Space_Grotesk'] font-medium tracking-wide drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] max-w-md text-center">
                  Compare expected fares across travel dates and identify potentially better-value dates.
                </p>
              </div>

              <div className="grid grid-cols-5 gap-1.5 sm:gap-3 max-w-xl mx-auto w-full">
                {[
                  { date: '18 Oct', price: '₹5.2k', label: 'Sun', isBest: false },
                  { date: '19 Oct', price: '₹4.9k', label: 'Mon', isBest: false },
                  { date: '20 Oct', price: '₹4.8k', label: 'Tue', isBest: true },
                  { date: '21 Oct', price: '₹5.6k', label: 'Wed', isBest: false },
                  { date: '22 Oct', price: '₹6.1k', label: 'Thu', isBest: false },
                ].map((item) => (
                  <div
                    key={item.date}
                    className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl text-center backdrop-blur-2xl transition-all duration-300 ${
                      item.isBest
                        ? 'bg-emerald-100/90 border-2 border-emerald-500 shadow-md scale-105 text-emerald-950'
                        : 'bg-white/45 border border-white/70 shadow-md text-slate-900'
                    }`}
                  >
                    <span className={`block text-[8px] sm:text-[9px] font-mono font-bold ${item.isBest ? 'text-emerald-800' : 'text-slate-600'}`}>{item.label}</span>
                    <span className={`block text-[11px] sm:text-xs font-bold mt-0.5 sm:mt-1 ${item.isBest ? 'text-emerald-950' : 'text-slate-900'}`}>{item.date}</span>
                    <span className={`block text-xs sm:text-base font-extrabold mt-1 sm:mt-2 ${item.isBest ? 'text-emerald-800' : 'text-slate-900'}`}>
                      {item.price}
                    </span>
                    {item.isBest && (
                      <span className="mt-1 inline-block text-[7px] sm:text-[8px] tracking-wider uppercase font-bold text-emerald-900 bg-emerald-200/80 px-1 py-0.2 sm:px-1.5 sm:py-0.5 rounded border border-emerald-400">
                        BEST
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ====================================================================
            SCENE 6: FARE FACTORS (~76% scroll)
            "What moves your fare?"
            ==================================================================== */}
        {s6.opacity > 0.01 && (
          <div 
            className="absolute inset-0 z-20 flex flex-col items-center justify-center p-4 sm:p-6 text-center select-none"
            style={{
              opacity: s6.opacity,
              transform: `translate3d(0, ${s6.translateY}px, 0) scale(${s6.scale})`,
              pointerEvents: s6.pointerEvents,
              willChange: 'opacity, transform',
            }}
          >
            <div className="max-w-2xl w-full bg-transparent px-2">
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-['Space_Grotesk'] font-bold tracking-[0.16em] text-[#F5F7FA] uppercase leading-none drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)]">
                What moves
              </h2>
              <span className="block font-['Playfair_Display'] italic font-medium text-3xl sm:text-5xl md:text-6xl text-white tracking-wide mt-1 mb-2 sm:mb-3 leading-tight drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)]">
                your fare?
              </span>

              {/* Subtitle - Transparent */}
              <div className="mt-1 mb-4 sm:mb-6 flex justify-center">
                <p className="text-white/90 text-xs sm:text-sm font-['Space_Grotesk'] font-medium tracking-wide drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] max-w-md text-center">
                  Eight multivariate data signals processed concurrently in our feature engineering layers.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 max-w-xl mx-auto w-full">
                {[
                  { name: 'Airline', weight: '+14%', detail: 'IndiGo / AI / Vistara' },
                  { name: 'Route', weight: 'High', detail: 'Metro Corridor' },
                  { name: 'Departure Date', weight: 'Season', detail: 'Off-Peak Midweek' },
                  { name: 'Stops', weight: '+22%', detail: 'Direct vs 1-Stop' },
                  { name: 'Flight Duration', weight: '1h 35m', detail: 'Direct Speed' },
                  { name: 'Booking Timing', weight: '-18%', detail: '14-Day Advance' },
                  { name: 'Demand Index', weight: '0.74', detail: 'Moderate Capacity' },
                  { name: 'Historical Patterns', weight: '99.4%', detail: 'Seasonal Align' },
                ].map((factor) => (
                  <div 
                    key={factor.name}
                    className="p-2.5 sm:p-3 rounded-2xl bg-white/45 backdrop-blur-2xl border border-white/70 shadow-md text-left transition-colors"
                  >
                    <span className="block text-[9px] sm:text-[10px] font-bold text-slate-700">{factor.name}</span>
                    <span className="text-xs sm:text-sm font-black text-slate-900 mt-0.5 block">{factor.weight}</span>
                    <span className="text-[8px] sm:text-[9px] text-slate-600 mt-1 block truncate font-medium">{factor.detail}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ====================================================================
            SCENE 7: MACHINE LEARNING PIPELINE (~87% scroll)
            "Powered by data. Built to predict."
            ==================================================================== */}
        {s7.opacity > 0.01 && (
          <div 
            className="absolute inset-0 z-20 flex flex-col items-center justify-center p-4 sm:p-6 text-center select-none"
            style={{
              opacity: s7.opacity,
              transform: `translate3d(0, ${s7.translateY}px, 0) scale(${s7.scale})`,
              pointerEvents: s7.pointerEvents,
              willChange: 'opacity, transform',
            }}
          >
            <div className="max-w-3xl w-full bg-transparent px-2">
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-['Space_Grotesk'] font-bold tracking-[0.16em] text-[#F5F7FA] uppercase leading-none drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)]">
                Powered by data.
              </h2>
              <span className="block font-['Playfair_Display'] italic font-medium text-3xl sm:text-5xl md:text-6xl text-white tracking-wide mt-1 mb-2 sm:mb-3 leading-tight drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)]">
                Built to predict.
              </span>

              {/* Subtitle - Transparent */}
              <div className="mt-1 mb-4 sm:mb-6 flex justify-center">
                <p className="text-white/90 text-xs sm:text-sm font-['Space_Grotesk'] font-medium tracking-wide drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] max-w-md text-center">
                  Machine learning transforms historical flight data into meaningful fare predictions.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 max-w-2xl mx-auto w-full">
                {[
                  { step: '01', title: 'Flight Data', desc: 'OTA & Scraper', icon: Database },
                  { step: '02', title: 'Features', desc: 'Engineering & Weights', icon: Layers },
                  { step: '03', title: 'ML Model', desc: 'Ensemble Regressor', icon: Cpu },
                  { step: '04', title: 'Prediction', desc: '₹5,612 Estimated', icon: Sparkles },
                  { step: '05', title: 'Insight', desc: 'Booking Advice', icon: BarChart3 },
                ].map((node, i) => {
                  const Icon = node.icon;
                  return (
                    <React.Fragment key={node.title}>
                      <div className="p-2.5 sm:p-3.5 rounded-2xl bg-white/45 backdrop-blur-2xl border border-white/70 shadow-md w-full sm:w-28 text-center">
                        <Icon className="w-4 h-4 mx-auto text-blue-600 mb-1" />
                        <span className="block text-[9px] sm:text-[10px] font-bold text-slate-900">{node.title}</span>
                        <span className="block text-[8px] text-slate-600 font-medium truncate">{node.desc}</span>
                      </div>
                      {i < 4 && (
                        <div className="hidden sm:block text-slate-900 text-sm font-black">→</div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ====================================================================
            SCENE 8 & DASHBOARD TRANSITION (Sections 22 & 23)
            When the final cinematic scene (Frame 240) is reached:
            - Camera freezes on the final cloudscape
            - The final background remains visible
            - Dashboard UI appears layered over the final cinematic background!
            ==================================================================== */}
        {isDashboardVisible && (
          <div 
            className="absolute inset-0 z-30 flex items-center justify-center p-6 text-center"
            style={{
              opacity: dashboardOpacity,
              pointerEvents: dashboardOpacity > 0.5 ? 'auto' : 'none',
              transition: 'opacity 0.3s ease-out',
            }}
          >
            <div className="max-w-xl p-8 rounded-3xl bg-white/20 backdrop-blur-2xl border border-white/50 shadow-[0_20px_50px_rgba(15,23,42,0.15)] text-slate-900 font-['Space_Grotesk'] animate-fadeIn">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/40 border border-white/60 text-blue-950 text-[11px] font-bold tracking-widest uppercase mb-3.5 shadow-sm backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                SKYLINE <span className="tracking-normal font-['Noto_Sans_Devanagari',sans-serif]">सारथी</span> // TELEMETRY READY
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-950 mb-2.5 drop-shadow-sm">
                Skyline <span className="text-blue-700 font-['Noto_Sans_Devanagari',sans-serif]">सारथी</span> Fare Predictor
              </h2>
              <p className="text-xs sm:text-sm text-slate-900 font-medium mb-6 leading-relaxed max-w-lg mx-auto">
                Step into the fixed, single-screen aviation dashboard. Access dynamic route maps, machine-learning fare estimates, and aircraft models without scrolling.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={onEnterDashboard}
                  className="w-full sm:w-auto px-7 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Plane className="w-4 h-4" />
                  <span>Launch Live Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={onBeginJourney}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-white/40 hover:bg-white/70 text-slate-900 font-bold text-xs uppercase tracking-wider border border-white/60 backdrop-blur-md transition-all cursor-pointer shadow-sm"
                >
                  Sign In / Guest Pass
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
});

export default HeroScrollytelling;
