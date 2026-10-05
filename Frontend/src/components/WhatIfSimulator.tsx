import { useState, useMemo } from "react"
import { RefreshCw } from "lucide-react"

interface WhatIfSimulatorProps {
  baseFare: number
  initialDaysAhead?: number
  initialCabinClass?: 'Economy' | 'Premium Economy' | 'Business'
}

const CABIN_CLASSES = [
  { name: "Economy", mul: "1.0X" },
  { name: "Business", mul: "2.8X" },
] as const

export function WhatIfSimulator({
  baseFare,
  initialDaysAhead = 14,
  initialCabinClass = "Economy"
}: WhatIfSimulatorProps) {
  const [daysAhead, setDaysAhead] = useState(initialDaysAhead)
  const [cabinClass, setCabinClass] = useState<"Economy" | "Business">(
    initialCabinClass === "Business" ? "Business" : "Economy"
  )

  const recalculatedFare = useMemo(() => {
    let windowMultiplier = 1.0
    if (daysAhead <= 2) windowMultiplier = 1.62
    else if (daysAhead <= 7) windowMultiplier = 1.35
    else if (daysAhead <= 14) windowMultiplier = 1.08
    else if (daysAhead >= 21 && daysAhead <= 35) windowMultiplier = 0.88
    else windowMultiplier = 0.95

    let cabinMultiplier = 1.0
    if (cabinClass === "Business") cabinMultiplier = 2.8

    const rawRatio = windowMultiplier * cabinMultiplier
    return Math.round(baseFare * (rawRatio / 1.08))
  }, [baseFare, daysAhead, cabinClass])

  const diffAmount = recalculatedFare - baseFare
  const diffPct = Math.round((diffAmount / baseFare) * 100)

  const handleReset = () => {
    setDaysAhead(initialDaysAhead)
    setCabinClass(initialCabinClass === "Business" ? "Business" : "Economy")
  }

  return (
    <div className="p-6 sm:p-8 rounded-none bg-white dark:bg-black border-2 border-black dark:border-white text-black dark:text-white text-left transition-colors duration-150">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b-2 border-black dark:border-white">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-[#f3d400] text-black border-2 border-black px-2 py-0.5 text-xs font-mono font-black uppercase tracking-widest">
              06. SENSITIVITY
            </span>
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
              ELASTICITY SIMULATOR
            </span>
          </div>

          <h3 className="font-sans font-black text-xl sm:text-2xl text-black dark:text-white tracking-tight uppercase">
            Dynamic "What-If" Engine
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono uppercase mt-0.5">
            Test Fare Sensitivity Across Booking Horizon and Cabin Class
          </p>
        </div>

        <button
          onClick={handleReset}
          className="swiss-btn-secondary px-3.5 py-1.5 text-xs font-mono font-bold uppercase inline-flex items-center gap-1.5 cursor-pointer rounded-none"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>RESET</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

        {/* Left Inputs (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">

          {/* Days Ahead Slider (1 to 60) */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="sim-days-ahead" className="text-xs font-bold text-black dark:text-white font-mono uppercase tracking-wider">
                Booking Horizon (Advance T-Minus)
              </label>
              <span className="font-mono font-black text-xs text-black bg-[#f3d400] border border-black px-2 py-0.5">
                T-{daysAhead} DAYS OUT
              </span>
            </div>
            <input
              id="sim-days-ahead"
              type="range"
              min="1"
              max="60"
              value={daysAhead}
              onChange={(e) => setDaysAhead(Number(e.target.value))}
              className="w-full h-3 bg-neutral-100 dark:bg-neutral-900 border-2 border-black dark:border-white appearance-none cursor-pointer accent-black dark:accent-white"
            />
            <div className="flex justify-between text-[10px] text-neutral-500 dark:text-neutral-400 font-mono uppercase mt-1">
              <span>T-1 (SURGE)</span>
              <span className="text-black dark:text-white font-black">T-21 TO T-35 (OPTIMAL)</span>
              <span>T-60 (STANDARD)</span>
            </div>
          </div>

          {/* Cabin Class Multipliers */}
          <div>
            <label className="text-xs font-bold text-black dark:text-white font-mono uppercase tracking-wider block mb-2">
              Cabin Class Entitlement
            </label>
            <div className="grid grid-cols-2 gap-3">
              {CABIN_CLASSES.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setCabinClass(c.name)}
                  className={`py-3 px-3 border-2 text-center transition-colors cursor-pointer rounded-none ${cabinClass === c.name
                      ? "bg-[#f3d400] text-black border-2 border-black font-black"
                      : "bg-neutral-100 dark:bg-neutral-900 text-black dark:text-white border-black dark:border-white hover:bg-neutral-200 dark:hover:bg-neutral-800"
                    }`}
                >
                  <span className="block text-xs font-bold uppercase truncate">{c.name}</span>
                  <span className={`block text-[10px] font-mono mt-0.5 ${cabinClass === c.name ? "text-black font-bold" : "text-neutral-500 dark:text-neutral-400"}`}>
                    {c.mul}
                  </span>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Right Output: Simulated Live Fare Card (5 Cols) */}
        <div className="lg:col-span-5 bg-neutral-100 dark:bg-neutral-900 border-2 border-black dark:border-white p-6 sm:p-8 text-black dark:text-white flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-mono pb-2 border-b-2 border-black dark:border-white mb-4">
              <span className="font-bold uppercase">OUTCOME MODEL</span>
              <span className="bg-[#f3d400] text-black border border-black px-1.5 py-0.5 font-black uppercase">
                CALIBRATED
              </span>
            </div>

            <span className="text-xs text-neutral-500 dark:text-neutral-400 block font-mono uppercase font-bold">
              Adjusted Ticket Benchmark
            </span>
            <div className="text-4xl sm:text-5xl font-sans font-black text-black dark:text-white my-2">
              ₹{recalculatedFare.toLocaleString("en-IN")}
            </div>

            {/* Difference badge */}
            <div className="mt-4">
              <span
                className="inline-block px-3 py-1 text-xs font-mono font-black uppercase border-2 border-black bg-[#f3d400] text-black"
              >
                {diffAmount <= 0 ? "SAVINGS" : "PREMIUM"}: {diffAmount >= 0 ? "+" : ""}
                ₹{Math.abs(diffAmount).toLocaleString("en-IN")} ({diffPct >= 0 ? "+" : ""}{diffPct}%)
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t-2 border-black dark:border-white text-xs font-mono space-y-2">
          <div className="flex justify-between">
            <span className="text-neutral-500 dark:text-neutral-400">BASELINE TARIFF:</span>
            <span className="font-bold text-black dark:text-white">₹{baseFare.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500 dark:text-neutral-400">HORIZON VECTOR:</span>
            <span className="font-bold text-black dark:text-white">
              {daysAhead <= 7 ? "SURGE PRESSURE" : daysAhead <= 35 ? "OPTIMAL DISCOUNT" : "STANDARD RACK"}
            </span>
          </div>
        </div>
      </div>

    </div>
  )
}
