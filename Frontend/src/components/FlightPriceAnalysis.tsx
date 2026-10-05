import { useState, useRef } from "react"
import type { FunnelStage } from "@/types/aviation"

interface FlightPriceAnalysisProps {
  stages: FunnelStage[]
  predictedFare: number
}

export function FlightPriceAnalysis({ stages, predictedFare }: FlightPriceAnalysisProps) {
  const [activeStage, setActiveStage] = useState<FunnelStage | null>(null)
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  if (stages.length === 0) {
    return (
      <div className="p-6 sm:p-8 rounded-none bg-white dark:bg-black border-2 border-black dark:border-white text-black dark:text-white">
        <h3 className="font-black text-xl uppercase">Fare breakdown unavailable</h3>
        <p className="mt-2 text-sm font-mono text-neutral-500 dark:text-neutral-400">
          No fare breakdown data is available.
        </p>
      </div>
    )
  }

  const maxAmount = Math.max(...stages.map((s) => s.amount), predictedFare * 1.4)

  const getClampedTooltipPct = (index: number) => {
    const rawPct = ((index + 0.5) / stages.length) * 100
    return Math.min(72, Math.max(28, rawPct))
  }

  return (
    <div className="p-6 sm:p-8 rounded-none bg-white dark:bg-black border-2 border-black dark:border-white text-black dark:text-white text-left transition-colors duration-150">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b-2 border-black dark:border-white">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-[#f3d400] text-black border-2 border-black px-2 py-0.5 text-xs font-mono font-black uppercase tracking-widest">
              04. WATERFALL
            </span>
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
              5-STAGE DECOMPOSITION
            </span>
          </div>

          <h3 className="font-sans font-black text-xl sm:text-2xl text-black dark:text-white tracking-tight uppercase">
            Tariff Breakdown Funnel
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono uppercase mt-0.5">
            Algorithmic Yield Decay From Gross Tariff To CPI Index
          </p>
        </div>
      </div>

      {/* Waterfall Visualizer Container */}
      <div ref={containerRef} className="relative pt-6 pb-2">
        
        {/* Clamped Hover Tooltip */}
        {activeStage && hoverIndex !== null && (
          <div
            style={{ left: `${getClampedTooltipPct(hoverIndex)}%` }}
            className="absolute top-0 -translate-x-1/2 pointer-events-none z-30 bg-black dark:bg-white text-white dark:text-black px-4 py-3 text-xs border-2 border-black dark:border-white rounded-none min-w-[220px]"
          >
            <div className="flex items-center justify-between border-b border-white/20 dark:border-black/20 pb-1.5 mb-1.5 font-mono">
              <span className="font-bold uppercase">{activeStage.name}</span>
              <span className={`font-mono text-xs font-black px-1.5 py-0.5 ${
                hoverIndex === 1
                  ? "bg-[#f3d400] text-black border border-black"
                  : "text-white dark:text-black"
              }`}>
                {activeStage.pctOfPredicted}%
              </span>
            </div>
            <div className="flex justify-between items-baseline font-mono mb-1">
              <span className="text-neutral-400 dark:text-neutral-600 text-[11px] uppercase">Amount:</span>
              <span className="font-bold text-sm text-white dark:text-black">
                ₹{activeStage.amount.toLocaleString("en-IN")}
              </span>
            </div>
            <p className="text-[10px] text-neutral-300 dark:text-neutral-700 font-mono leading-tight mt-1">
              {activeStage.description}
            </p>
          </div>
        )}

        {/* Vertical Waterfall Bar Graph */}
        <div className="flex items-end justify-between gap-3 h-[180px] px-2 border-b-2 border-black dark:border-white pb-1">
          {stages.map((stage, idx) => {
            const heightPct = Math.max(14, Math.min(100, (stage.amount / maxAmount) * 100))
            const isPredicted = idx === 1
            const isHovered = hoverIndex === idx

            return (
              <div
                key={stage.id}
                className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                onMouseEnter={() => {
                  setActiveStage(stage)
                  setHoverIndex(idx)
                }}
                onMouseLeave={() => {
                  setActiveStage(null)
                  setHoverIndex(null)
                }}
              >
                <span className={`text-[10px] font-mono font-bold mb-1.5 ${
                  isPredicted ? "text-black dark:text-white font-black" : "text-neutral-500 dark:text-neutral-400"
                }`}>
                  ₹{Math.round(stage.amount / 1000)}k
                </span>

                <div
                  style={{ height: `${heightPct}%` }}
                  className={`w-full transition-colors duration-150 border-2 border-black dark:border-white ${
                    isPredicted
                      ? "bg-[#f3d400] text-black"
                      : isHovered
                      ? "bg-neutral-800 dark:bg-neutral-200"
                      : "bg-neutral-300 dark:bg-neutral-700"
                  }`}
                />
              </div>
            )
          })}
        </div>

        {/* Stage Labels */}
        <div className="flex justify-between gap-2 mt-3 px-1">
          {stages.map((stage, idx) => (
            <div key={stage.id} className="flex-1 text-center font-mono">
              <span className="text-[10px] font-bold uppercase text-neutral-600 dark:text-neutral-400 block truncate">
                0{idx + 1}
              </span>
              <span className="text-[10px] font-bold text-black dark:text-white truncate block">
                {stage.name.split(" ")[0]}
              </span>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
