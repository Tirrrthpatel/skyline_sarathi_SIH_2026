import { useEffect, useState } from "react"
import { ArrowRight, Compass } from "lucide-react"
import { FlipWords } from "@/components/ui/flip-words"

interface HeroSectionProps {
  onLaunchSearch: () => void
  onOpenDashboard: () => void
}

export function HeroSection({ onLaunchSearch, onOpenDashboard }: HeroSectionProps) {
  const [stats, setStats] = useState({
    obs: 0,
    mape: 0,
    success: 0,
    platforms: 0
  })

  useEffect(() => {
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
    const startTime = performance.now()
    const duration = 1200

    let rafId: number
    const animate = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = easeOutCubic(progress)

      setStats({
        obs: Math.round(10 * eased),
        mape: parseFloat((7.6 * eased).toFixed(1)),
        success: parseFloat((95.8 * eased).toFixed(1)),
        platforms: Math.round(11 * eased)
      })

      if (progress < 1) {
        rafId = requestAnimationFrame(animate)
      } else {
        setStats({
          obs: 10,
          mape: 7.6,
          success: 95.8,
          platforms: 11
        })
      }
    }

    rafId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafId)
  }, [])

  return (
    <section className="relative z-10 bg-white dark:bg-black border-b-2 border-black dark:border-white swiss-grid-pattern transition-colors duration-150">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        
        {/* Asymmetric Header Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-14 sm:mb-20">
          
          {/* Main Huge Typography (Cols 1-8) */}
          <div className="lg:col-span-8 text-left">
            
            {/* Section Index Marker */}
            <div className="flex flex-wrap items-center gap-2.5 mb-6">
              <span className="bg-[#f3d400] text-black border-2 border-black px-2.5 py-0.5 text-xs font-mono font-black uppercase tracking-widest">
                SIH26056
              </span>
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                TEAM JOLLY ROGER (ID: 171809) • SMART AUTOMATION
              </span>
            </div>

            {/* Main Headline - Relatable directly to Skyline सारथी with Aceternity FlipWords */}
            <h1 className="font-sans font-black text-5xl sm:text-7xl lg:text-[6.2rem] tracking-tighter uppercase text-black dark:text-white leading-[0.92] select-none">
              REAL-TIME<br />
              <span className="inline-block">
                <FlipWords
                  words={["AIRFARE PRICE", "CORRIDOR TARIFF", "DYNAMIC YIELD", "AVIATION CPI"]}
                  className="text-[#f3d400] dark:text-[#f3d400] px-0 font-sans font-black tracking-tighter drop-shadow-[0_2px_0_rgba(0,0,0,0.95)] dark:drop-shadow-none"
                  duration={2600}
                />
              </span><br />
              INDEX FOR INDIA.
            </h1>

            <p className="mt-8 text-xs sm:text-sm text-neutral-800 dark:text-neutral-200 font-mono max-w-2xl leading-relaxed uppercase tracking-tight">
              <strong className="text-black dark:text-white font-black">Skyline सारथी:</strong> Automated Web Scraping of Airline & OTA Portals for Augmentation of the Consumer Price Index (CPI). Real-time DGCA-weighted price index for MoSPI & RBI.
            </p>

            {/* Swiss Rectangular Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 mt-8">
              <button
                onClick={onOpenDashboard}
                className="swiss-btn-primary px-8 py-4 text-xs sm:text-sm font-bold tracking-wider inline-flex items-center gap-2 cursor-pointer select-none"
              >
                <span>EXPLORE LIVE TELEMETRY</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onLaunchSearch}
                className="swiss-btn-secondary px-8 py-4 text-xs sm:text-sm font-bold tracking-wider inline-flex items-center gap-2 cursor-pointer select-none"
              >
                <Compass className="w-4 h-4 text-black" />
                <span>CORRIDOR SEARCH ENGINE</span>
              </button>
            </div>
          </div>

          {/* Right Asymmetrical Architecture Card (Cols 9-12) - Flat, Zero Hover Shift */}
          <div className="lg:col-span-4 bg-neutral-100 dark:bg-neutral-900 border-2 border-black dark:border-white p-6 sm:p-8 text-left space-y-5 swiss-dots">
            <div className="flex items-center justify-between pb-3 border-b-2 border-black dark:border-white font-mono text-xs">
              <span className="font-bold uppercase text-black dark:text-white">PROJECT METADATA</span>
              <span className="bg-[#f3d400] text-black px-2 py-0.5 font-black border border-black text-xs">SIH-2026</span>
            </div>

            <div className="space-y-3 font-mono text-xs text-neutral-800 dark:text-neutral-200">
              <div className="flex justify-between py-1 border-b border-black/10 dark:border-white/10">
                <span className="text-neutral-500 dark:text-neutral-400">PROBLEM ID:</span>
                <span className="font-bold text-black dark:text-white">SIH26056</span>
              </div>
              <div className="flex justify-between py-1 border-b border-black/10 dark:border-white/10">
                <span className="text-neutral-500 dark:text-neutral-400">TEAM:</span>
                <span className="font-bold text-black dark:text-white">Team 21 • Jolly Roger</span>
              </div>
              <div className="flex justify-between py-1 border-b border-black/10 dark:border-white/10">
                <span className="text-neutral-500 dark:text-neutral-400">BENEFICIARY:</span>
                <span className="font-bold text-black dark:text-white">MoSPI & RBI</span>
              </div>
              <div className="flex justify-between py-1 border-b border-black/10 dark:border-white/10">
                <span className="text-neutral-500 dark:text-neutral-400">LEAD HORIZONS:</span>
                <span className="font-bold text-black dark:text-white">T+1, T+7, T+15, T+30, T+45</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-neutral-500 dark:text-neutral-400">SCRAPING:</span>
                <span className="font-bold text-black dark:text-white">robots.txt + Session Pacing</span>
              </div>
            </div>

            <div className="p-4 bg-black dark:bg-white text-white dark:text-black text-[11px] font-mono leading-relaxed">
              DUAL-PERSONA INTELLIGENCE: One pipeline delivers traveler-level booking insights and institutional CPI inflation indices.
            </div>
          </div>

        </div>

        {/* 4 Architectural Stat Blocks with 2px Black Borders - Strict, Flat, Zero Hover Effects */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-2 border-black dark:border-white divide-y-2 sm:divide-y-0 sm:divide-x-2 divide-black dark:divide-white bg-white dark:bg-black text-black dark:text-white">
          
          <div className="p-6 text-left">
            <span className="font-mono text-xs font-bold text-black dark:text-white block mb-1">
              [METRIC 01]
            </span>
            <div className="font-sans font-black text-4xl sm:text-5xl text-black dark:text-white tracking-tight">
              {stats.obs}K+
            </div>
            <p className="font-mono text-xs uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mt-2">
              Daily Scraped Observations
            </p>
          </div>

          <div className="p-6 text-left">
            <span className="font-mono text-xs font-bold text-black dark:text-white block mb-1">
              [METRIC 02]
            </span>
            <div className="font-sans font-black text-4xl sm:text-5xl text-black dark:text-white tracking-tight">
              T+1 → T+45
            </div>
            <p className="font-mono text-xs uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mt-2">
              Forward Booking Windows
            </p>
          </div>

          <div className="p-6 text-left">
            <span className="font-mono text-xs font-bold text-black dark:text-white block mb-1">
              [METRIC 03]
            </span>
            <div className="font-sans font-black text-4xl sm:text-5xl text-black dark:text-white tracking-tight">
              &le;{stats.mape}%
            </div>
            <p className="font-mono text-xs uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mt-2">
              30-Day Backtesting MAPE
            </p>
          </div>

          <div className="p-6 text-left">
            <span className="font-mono text-xs font-bold text-black dark:text-white block mb-1">
              [METRIC 04]
            </span>
            <div className="font-sans font-black text-4xl sm:text-5xl text-black dark:text-white tracking-tight">
              {stats.platforms}+
            </div>
            <p className="font-mono text-xs uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mt-2">
              Airlines & OTA Platforms
            </p>
          </div>

        </div>

      </div>
    </section>
  )
}
