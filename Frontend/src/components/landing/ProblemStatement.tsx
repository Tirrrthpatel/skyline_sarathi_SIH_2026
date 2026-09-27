import { AlertTriangle, CheckCircle } from "lucide-react"

export function ProblemStatement() {
  const problems = [
    {
      code: "01",
      title: "Dynamic Fare",
      desc: "Airfares fluctuate significantly based on dynamic yield management, travel date, surge demand algorithms, and booking lead times."
    },
    {
      code: "02",
      title: "Scattered Data",
      desc: "Fare information is fragmented across various airline websites (IndiGo, Air India, SpiceJet) and OTAs (MakeMyTrip, Cleartrip, Yatra), preventing unified visibility."
    },
    {
      code: "03",
      title: "No Unified Visibility",
      desc: "Absence of high-frequency price indices across domestic routes and advance booking horizons for national Consumer Price Index (CPI) augmentation."
    }
  ]

  const solutions = [
    {
      code: "01",
      title: "DGCA-Weighted Airfare Index & API",
      desc: "Generates a true route-weighted Airfare Price Index calibrated with DGCA passenger statistics, delivering automated feeds for MoSPI and RBI."
    },
    {
      code: "02",
      title: "Ethical & Fare Decomposition",
      desc: "Automates robots.txt-compliant scraping across 11+ platforms, rigorously isolating base tariffs from taxes, fuel surcharges, and convenience fees."
    },
    {
      code: "03",
      title: "Lead-Time Analytics & Forecasting",
      desc: "Tracks flight tariffs across T+1, T+7, T+15, T+30, and T+45 booking windows to identify structural price trajectories and inflation trends."
    }
  ]

  const pillars = [
    {
      title: "DGCA Weighted Airfare Index",
      desc: "Uses DGCA passenger traffic volume weights to construct a true representative route-weighted airfare transport basket index."
    },
    {
      title: "Compliance by Design Scraping",
      desc: "robots.txt adherence + IP rotation (Bright Data/Oxylabs) + rate limiting (req/hr) + session management for sustainable data collection."
    },
    {
      title: "Dual-Persona Intelligence",
      desc: "One single pipeline delivers traveler-level T+1 to T+45 insights and institutional RBI/MoSPI macroeconomic market analytics."
    }
  ]

  return (
    <section className="relative z-10 bg-white dark:bg-black border-b-2 border-black dark:border-white py-16 sm:py-24 transition-colors duration-150">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12 sm:mb-16 text-left">
          <div className="flex items-center gap-2 mb-2 font-mono text-xs font-bold uppercase text-black dark:text-white">
            <span>01. METHODOLOGY</span>
            <span>//</span>
            <span>SIH26056 PROBLEM & SOLUTION</span>
          </div>
          <h2 className="font-sans font-black text-3xl sm:text-5xl lg:text-6xl tracking-tighter uppercase text-black dark:text-white leading-tight">
            From Scattered Data To<br />
            <span className="text-black dark:text-white">Actionable Insights.</span>
          </h2>
          <p className="mt-4 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 font-mono leading-relaxed">
            Addressing India's fragmented civil aviation pricing landscape by replacing static surveys with automated, high-frequency web scraping and DGCA-weighted price index telemetry.
          </p>
        </div>

        {/* 2-Column Comparison Grid: Problem vs Solution - Flat Swiss Cards, Zero Hover Shifts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          
          {/* Column 1: The Problem */}
          <div className="border-2 border-black dark:border-white bg-neutral-100 dark:bg-neutral-900 p-6 sm:p-8 text-left swiss-diagonal">
            <div className="flex items-center justify-between pb-4 border-b-2 border-black dark:border-white mb-6">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-black dark:text-white" />
                <h3 className="font-sans font-black text-lg sm:text-xl uppercase tracking-tight text-black dark:text-white">
                  The Problem
                </h3>
              </div>
              <span className="font-mono text-[11px] font-bold uppercase px-2 py-0.5 bg-black dark:bg-white text-white dark:text-black">
                Current Limitations
              </span>
            </div>

            <div className="space-y-4">
              {problems.map((item) => (
                <div key={item.code} className="p-4 bg-white dark:bg-black border-2 border-black dark:border-white">
                  <div className="flex items-center gap-2 mb-1.5 font-mono">
                    <span className="text-xs font-black text-black dark:text-white">[{item.code}]</span>
                    <span className="font-black text-xs uppercase text-black dark:text-white">{item.title}</span>
                  </div>
                  <p className="text-xs text-neutral-700 dark:text-neutral-300 font-mono leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: Skyline सारथी Solution */}
          <div className="border-2 border-black dark:border-white bg-white dark:bg-black p-6 sm:p-8 text-left">
            <div className="flex items-center justify-between pb-4 border-b-2 border-black dark:border-white mb-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-black dark:text-white" />
                <h3 className="font-sans font-black text-lg sm:text-xl uppercase tracking-tight text-black dark:text-white">
                  Our Solution: Skyline सारथी
                </h3>
              </div>
              <span className="font-mono text-[11px] font-black uppercase px-2 py-0.5 bg-[#f3d400] text-black border border-black">
                SIH Innovation
              </span>
            </div>

            <div className="space-y-4">
              {solutions.map((item) => (
                <div key={item.code} className="p-4 bg-neutral-100 dark:bg-neutral-900 border-2 border-black dark:border-white">
                  <div className="flex items-center gap-2 mb-1.5 font-mono">
                    <span className="text-xs font-black text-black dark:text-white">[{item.code}]</span>
                    <span className="font-black text-xs uppercase text-black dark:text-white">{item.title}</span>
                  </div>
                  <p className="text-xs text-neutral-700 dark:text-neutral-300 font-mono leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Why Skyline सारथी? - 3 Architectural Columns */}
        <div className="border-2 border-black dark:border-white bg-neutral-100 dark:bg-neutral-900 p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-6 pb-3 border-b-2 border-black dark:border-white font-mono">
            <span className="text-xs font-black text-black dark:text-white">[WHY SKYLINE सारथी?]</span>
            <span className="text-xs uppercase font-bold text-neutral-600 dark:text-neutral-400">Core Strategic Pillars</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pillars.map((pillar, i) => (
              <div key={i} className="p-5 bg-white dark:bg-black border-2 border-black dark:border-white text-left">
                <span className="font-mono text-[10px] font-black text-black bg-[#f3d400] border border-black px-1.5 py-0.5 inline-block mb-2">
                  0{i + 1}. STRATEGY
                </span>
                <h4 className="font-sans font-black text-sm uppercase text-black dark:text-white mb-2">
                  {pillar.title}
                </h4>
                <p className="text-xs text-neutral-700 dark:text-neutral-300 font-mono leading-relaxed">
                  {pillar.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
