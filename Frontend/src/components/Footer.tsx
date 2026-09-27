import { Plane, ArrowUpRight } from "lucide-react"

interface FooterProps {
  onNavigate: (view: "landing" | "search" | "dashboard") => void
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="w-full bg-white dark:bg-black text-black dark:text-white border-t-4 border-black dark:border-white pt-16 pb-12 swiss-noise transition-colors duration-150">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b-2 border-black dark:border-white">
          
          {/* Brand Info (5 cols) */}
          <div className="md:col-span-5 space-y-4 text-left">
            <div className="text-[11px] font-mono uppercase font-black tracking-widest text-black dark:text-white">
              00. INDEX // SYSTEM SUMMARY
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#f3d400] text-black border border-black flex items-center justify-center font-black">
                <Plane className="w-5 h-5 text-black -rotate-45" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-sans font-black text-2xl tracking-tighter uppercase text-black dark:text-white">
                  Skyline
                </span>
                <span className="font-sans font-black text-2xl tracking-normal text-black dark:text-white">
                  सारथी
                </span>
              </div>
            </div>

            <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed font-mono max-w-sm">
              Next-Gen Aviation Intelligence & Dynamic Flight Fare Telemetry. Automated real-time airfare price index platform developed for Smart India Hackathon (SIH26056) to augment India's Consumer Price Index (CPI).
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-100 dark:bg-neutral-900 border border-black dark:border-white text-[11px] font-mono font-bold uppercase">
              <span className="w-2 h-2 bg-[#f3d400] border border-black inline-block"></span>
              <span>MoSPI Transport Inflation Feed • Online</span>
            </div>
          </div>

          {/* Quick Links (3 cols) */}
          <div className="md:col-span-3 space-y-3 text-left">
            <div className="text-[11px] font-mono uppercase font-black tracking-widest text-neutral-500 dark:text-neutral-400">
              01. NAVIGATION
            </div>
            <ul className="space-y-2 text-xs font-mono font-bold uppercase">
              <li>
                <button
                  onClick={() => onNavigate("landing")}
                  className="hover:underline flex items-center gap-1 transition-colors cursor-pointer group text-left"
                >
                  <span className="text-neutral-400">01/</span>
                  <span>System Overview</span>
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("search")}
                  className="hover:underline flex items-center gap-1 transition-colors cursor-pointer group text-left"
                >
                  <span className="text-neutral-400">02/</span>
                  <span>Corridor Search Engine</span>
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("dashboard")}
                  className="hover:underline flex items-center gap-1 transition-colors cursor-pointer group text-left"
                >
                  <span className="text-neutral-400">03/</span>
                  <span>Live Telemetry Dashboard</span>
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </li>
            </ul>
          </div>

          {/* Standards & Compliance (4 cols) */}
          <div className="md:col-span-4 space-y-3 text-left">
            <div className="text-[11px] font-mono uppercase font-black tracking-widest text-neutral-500 dark:text-neutral-400">
              02. STANDARDIZATION
            </div>
            <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed font-mono">
              IndiGo (6E) • Air India (AI) • Akasa Air (QP) • SpiceJet (SG) • MakeMyTrip • EaseMyTrip • Yatra
            </p>
            <div className="p-3 bg-neutral-100 dark:bg-neutral-900 border border-black dark:border-white text-[11px] font-mono text-neutral-800 dark:text-neutral-200 leading-snug">
              Mathematical precision adherence: 0px radii, rigid grid alignment, pure typography, and sub-18ms inference latency.
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs font-mono uppercase text-neutral-600 dark:text-neutral-400 gap-3">
          <div>
            © 2026 Skyline सारथी. Team 21 Jolly Roger • Smart India Hackathon (SIH26056).
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#f3d400]"></span>
            <span>Objective Aviation Metrics for CPI Augmentation</span>
          </div>
        </div>

      </div>
    </footer>
  )
}
