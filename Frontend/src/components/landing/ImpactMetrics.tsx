import { CheckSquare } from "lucide-react"

export function ImpactMetrics() {
  const benefits = [
    {
      code: "01",
      audience: "For MoSPI & RBI",
      title: "High-Frequency Airfare Monitoring",
      desc: "Automated, time-stamped fare observations and a DGCA-weighted Airfare Index enable continuous airfare monitoring and macroeconomic CPI augmentation."
    },
    {
      code: "02",
      audience: "For Travelers",
      title: "Fare Transparency & Predictive Insights",
      desc: "Historical fare trends and ML-based future price forecasts help travelers compare observed prices and make optimal booking decisions across T+1..T+45 horizons."
    },
    {
      code: "03",
      audience: "For Developers",
      title: "Automated & Traceable Data Pipeline",
      desc: "Scheduled collection, automated validation, continuous health monitoring, and complete traceability support maintainable, enterprise-scale operations."
    },
    {
      code: "04",
      audience: "For Analysts & Travel Industry",
      title: "Granular Market Intelligence",
      desc: "Route-level trends, booking lead-time elasticity patterns, and structured historical datasets support academic research and commercial revenue analysis."
    }
  ]

  const models = [
    {
      tier: "B2G | Government Analytics",
      badge: "Institutional",
      bullets: [
        "Official Airfare Price Index feed for MoSPI",
        "Statistical APIs for RBI monetary policy analysis",
        "Quarterly inflation assessment research reports"
      ]
    },
    {
      tier: "B2B | Aviation Intelligence",
      badge: "Commercial",
      bullets: [
        "Competitor corridor fare trends & route analytics",
        "Dynamic yield elasticity & pricing benchmark feeds",
        "Enterprise API access for travel management firms"
      ]
    },
    {
      tier: "B2C | Freemium Platform",
      badge: "Public",
      bullets: [
        "Free live corridor fare comparisons across 4 carriers",
        "Predictive buy/wait alerts for upcoming travel dates",
        "Flight price sensitivity and what-if simulation tools"
      ]
    }
  ]

  return (
    <section className="relative z-10 bg-white dark:bg-black border-b-2 border-black dark:border-white py-16 sm:py-24 transition-colors duration-150">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12 sm:mb-16 text-left">
          <div className="flex items-center gap-2 mb-2 font-mono text-xs font-bold uppercase text-black dark:text-white">
            <span>03. IMPACT</span>
            <span>//</span>
            <span>VALUE CREATION & BUSINESS MODEL</span>
          </div>
          <h2 className="font-sans font-black text-3xl sm:text-5xl lg:text-6xl tracking-tighter uppercase text-black dark:text-white leading-tight">
            From Scattered Fare Data To<br />
            <span className="text-black dark:text-white">Actionable Insights.</span>
          </h2>
          <p className="mt-4 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 font-mono leading-relaxed">
            Delivering measurable value across 4 distinct stakeholders: Government, Academic Researchers, Aviation Industry, and Air Travelers.
          </p>
        </div>

        {/* 4 Benefit Cards Grid - Flat Swiss Cards, Zero Hover Shifts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {benefits.map((benefit) => (
            <div
              key={benefit.code}
              className="p-6 sm:p-8 border-2 border-black dark:border-white bg-white dark:bg-black text-left flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b-2 border-black dark:border-white mb-4">
                  <span className="font-mono font-black text-xs text-black dark:text-white">
                    [{benefit.code}]
                  </span>
                  <span className="font-mono text-[10px] font-black uppercase px-2 py-0.5 bg-[#f3d400] text-black border border-black">
                    {benefit.audience}
                  </span>
                </div>
                <h3 className="font-sans font-black text-lg sm:text-xl uppercase tracking-tight text-black dark:text-white mb-2">
                  {benefit.title}
                </h3>
                <p className="text-xs text-neutral-700 dark:text-neutral-300 font-mono leading-relaxed">
                  {benefit.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Business Model Strip (Slide 5) */}
        <div className="border-2 border-black dark:border-white bg-neutral-100 dark:bg-neutral-900 p-6 sm:p-8">
          <div className="flex items-center justify-between pb-4 border-b-2 border-black dark:border-white mb-6 font-mono text-xs">
            <span className="font-black text-black dark:text-white uppercase">[BUSINESS MODEL & DEPLOYMENT ARCHITECTURE]</span>
            <span className="text-neutral-600 dark:text-neutral-400 uppercase hidden sm:inline">Self-Sustaining Operations</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {models.map((m, idx) => (
              <div key={idx} className="p-5 bg-white dark:bg-black border-2 border-black dark:border-white text-left flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-black/10 dark:border-white/10 mb-3">
                    <span className="font-mono font-black text-xs text-black dark:text-white uppercase">{m.tier}</span>
                    <span className="font-mono text-[9px] font-black uppercase px-1.5 py-0.5 bg-[#f3d400] text-black border border-black">
                      {m.badge}
                    </span>
                  </div>
                  <div className="space-y-2 font-mono text-xs text-neutral-800 dark:text-neutral-200">
                    {m.bullets.map((b, bIdx) => (
                      <div key={bIdx} className="flex items-start gap-2">
                        <CheckSquare className="w-3.5 h-3.5 text-black dark:text-white shrink-0 mt-0.5" />
                        <span className="leading-snug">{b}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t-2 border-black dark:border-white flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] font-mono text-neutral-600 dark:text-neutral-400">
            <span>FUNDING & INFRASTRUCTURE: Innovation Grants • Institutional Partnerships • Open-Source Stack</span>
            <span className="text-black dark:text-white font-bold">ESTIMATED INFRA COST: ~₹2,500/MONTH</span>
          </div>
        </div>

      </div>
    </section>
  )
}
