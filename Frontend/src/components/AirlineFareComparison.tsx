import type { Airline } from "@/types/aviation"
import { Luggage, Clock, ArrowRight } from "lucide-react"

interface AirlineFareComparisonProps {
  airlines: (Airline & { calculatedFare: number })[]
  durationMinutes: number
  onSelectAirline?: (airline: Airline) => void
}

export function AirlineFareComparison({
  airlines,
  durationMinutes,
  onSelectAirline
}: AirlineFareComparisonProps) {
  const durationStr = `${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}m`

  return (
    <div className="border-2 border-black dark:border-white bg-white dark:bg-black p-6 sm:p-8 rounded-none text-black dark:text-white transition-colors duration-150">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 pb-6 border-b-2 border-black dark:border-white mb-6">
        <div>
          <span className="bg-[#f3d400] text-black border-2 border-black px-2 py-0.5 text-xs font-mono font-black uppercase tracking-widest inline-block mb-2">
            07. BENCHMARK // CARRIER SENSITIVITY
          </span>
          <h3 className="font-black text-xl sm:text-2xl uppercase tracking-tight text-black dark:text-white flex items-center gap-3">
            Airline Carrier Corridor Benchmark
          </h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 font-mono mt-1">
            Calibrated multiplier index with baggage & fleet entitlements
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-bold uppercase px-2.5 py-1 bg-neutral-100 dark:bg-neutral-900 border border-black dark:border-white text-black dark:text-white">
            4 Major Carriers
          </span>
          <span className="text-[11px] font-mono uppercase text-neutral-500 dark:text-neutral-400 hidden sm:inline">
            Direct Non-Stop Corridors
          </span>
        </div>
      </div>

      {/* 4 Airline Cards Grid - Static, Zero Hover Jitter */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {airlines.map((airline) => {
          const isBestValue = airline.multiplier <= 0.94
          const isFlagship = airline.code === "AI"

          return (
            <div
              key={airline.code}
              className="p-5 border-2 border-black dark:border-white rounded-none bg-white dark:bg-black text-black dark:text-white flex flex-col justify-between"
            >
              <div>
                {/* Header: Carrier Code badge & Category */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-black dark:border-white">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-9 h-9 flex items-center justify-center font-black text-xs tracking-wider border ${
                      isBestValue
                        ? "bg-[#f3d400] text-black border-black font-black"
                        : "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white"
                    }`}>
                      {airline.code}
                    </span>
                    <div>
                      <h4 className="font-black text-sm uppercase tracking-tight text-black dark:text-white leading-tight">
                        {airline.name}
                      </h4>
                      <p className="text-[10px] text-neutral-500 dark:text-neutral-400 font-mono">
                        {airline.flightNumberPrefix}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-mono font-black uppercase px-2 py-0.5 border ${
                      isBestValue
                        ? "bg-[#f3d400] text-black border-2 border-black"
                        : isFlagship
                        ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white"
                        : "bg-neutral-100 dark:bg-neutral-900 text-black dark:text-white border-black dark:border-white"
                    }`}
                  >
                    {airline.multiplier}x IDX
                  </span>
                </div>

                {/* Calculated Fare */}
                <div className="mb-4 pb-4 border-b border-black dark:border-white">
                  <span className="text-[10px] uppercase font-mono font-bold text-neutral-500 dark:text-neutral-400 block tracking-wider">
                    Dynamic Calibrated Fare
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-3xl font-black text-black dark:text-white tracking-tight">
                      ₹{airline.calculatedFare.toLocaleString("en-IN")}
                    </span>
                    <span className="text-[10px] font-mono uppercase text-neutral-500 dark:text-neutral-400">
                      / leg
                    </span>
                  </div>
                </div>

                {/* Timing & Duration */}
                <div className="space-y-2 text-xs text-neutral-800 dark:text-neutral-200 mb-4 font-mono">
                  <div className="flex items-center justify-between pb-1 border-b border-neutral-200 dark:border-neutral-800">
                    <span className="text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-black dark:text-white" /> Schedule:
                    </span>
                    <span className="font-bold text-black dark:text-white">
                      {airline.departureTime} – {airline.arrivalTime}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pb-1 border-b border-neutral-200 dark:border-neutral-800">
                    <span className="text-neutral-500 dark:text-neutral-400">Duration:</span>
                    <span className="font-bold text-black dark:text-white">
                      {durationStr} ({airline.stops})
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                      <Luggage className="w-3 h-3 text-black dark:text-white" /> Baggage:
                    </span>
                    <span className="font-bold text-black dark:text-white text-[11px] truncate max-w-[120px]" title={airline.baggage}>
                      {airline.baggage}
                    </span>
                  </div>
                </div>

                {/* Highlight */}
                <div className="p-2.5 bg-neutral-100 dark:bg-neutral-900 border border-black dark:border-white text-[11px] font-mono text-neutral-800 dark:text-neutral-200 mb-5 leading-snug">
                  {airline.highlights}
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => onSelectAirline?.(airline)}
                className={`w-full py-3 px-3 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer border-2 border-black dark:border-white rounded-none ${
                  isBestValue
                    ? "bg-[#f3d400] text-black hover:bg-black hover:text-[#f3d400] dark:hover:bg-white dark:hover:text-black font-black"
                    : "bg-black dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-black hover:text-white dark:hover:text-black"
                }`}
              >
                <span>Select Tariff</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
