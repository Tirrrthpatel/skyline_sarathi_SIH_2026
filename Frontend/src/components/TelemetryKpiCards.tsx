import type { FareCalculationDetails } from "@/types/aviation"
import { TrendingDown, TrendingUp } from "lucide-react"

interface TelemetryKpiCardsProps {
  details: FareCalculationDetails
}

export function TelemetryKpiCards({ details }: TelemetryKpiCardsProps) {
  const diffFromAvg = Math.round(
    ((details.predictedFare - details.historicalAvg) / details.historicalAvg) * 100
  )
  const isCheaper = diffFromAvg <= 0

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
      
      {/* KPI Card 1: Predicted Fare */}
      <div className="p-6 bg-white dark:bg-black border-2 border-black dark:border-white text-black dark:text-white flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-2 border-b-2 border-black dark:border-white mb-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 font-mono">
              [CHANNEL 01]
            </span>
            <span className="font-mono text-[10px] font-bold uppercase bg-[#f3d400] text-black border border-black px-1.5 py-0.5">
              FAIR VALUE
            </span>
          </div>

          <span className="text-xs font-bold uppercase tracking-wider text-black dark:text-white font-mono block">
            PREDICTED TARIFF
          </span>

          <div className="font-sans font-black text-3xl sm:text-4xl text-black dark:text-white tracking-tight mt-1">
            ₹{details.predictedFare.toLocaleString("en-IN")}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t-2 border-black dark:border-white flex items-center justify-between text-xs font-mono">
          <div>
            {isCheaper ? (
              <span className="flex items-center text-black dark:text-white font-bold">
                <TrendingDown className="w-3.5 h-3.5 mr-1 text-black dark:text-white" />
                {Math.abs(diffFromAvg)}% BELOW AVG
              </span>
            ) : (
              <span className="flex items-center text-black dark:text-white font-bold">
                <TrendingUp className="w-3.5 h-3.5 mr-1" />
                +{diffFromAvg}% SURGE
              </span>
            )}
          </div>
          <span className="text-neutral-500 dark:text-neutral-400 text-[11px]">
            HIST: ₹{details.historicalAvg.toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      {/* KPI Card 2: Model Confidence */}
      <div className="p-6 bg-white dark:bg-black border-2 border-black dark:border-white text-black dark:text-white flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-2 border-b-2 border-black dark:border-white mb-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 font-mono">
              [CHANNEL 02]
            </span>
            <span className="font-mono text-[10px] font-bold uppercase bg-[#f3d400] text-black border border-black px-1.5 py-0.5">
              CONFORMAL
            </span>
          </div>

          <span className="text-xs font-bold uppercase tracking-wider text-black dark:text-white font-mono block">
            MODEL CONFIDENCE
          </span>

          <div className="font-sans font-black text-3xl sm:text-4xl text-black dark:text-white tracking-tight mt-1">
            {details.confidence}%
          </div>
        </div>

        <div className="mt-4 pt-3 border-t-2 border-black dark:border-white flex items-center justify-between text-xs font-mono">
          <span className="text-neutral-500 dark:text-neutral-400">
            INTERVAL COVERAGE
          </span>
          <span className="font-bold text-black dark:text-white">
            &plusmn;2.8% S.E.
          </span>
        </div>
      </div>

      {/* KPI Card 3: Booking Horizon */}
      <div className="p-6 bg-white dark:bg-black border-2 border-black dark:border-white text-black dark:text-white flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-2 border-b-2 border-black dark:border-white mb-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 font-mono">
              [CHANNEL 03]
            </span>
            <span className="font-mono text-[10px] font-bold uppercase bg-[#f3d400] text-black border border-black px-1.5 py-0.5">
              LEAD TIME
            </span>
          </div>

          <span className="text-xs font-bold uppercase tracking-wider text-black dark:text-white font-mono block">
            BOOKING HORIZON
          </span>

          <div className="font-sans font-black text-3xl sm:text-4xl text-black dark:text-white tracking-tight mt-1">
            T-{details.bookingWindowDays}D
          </div>
        </div>

        <div className="mt-4 pt-3 border-t-2 border-black dark:border-white flex items-center justify-between text-xs font-mono">
          <span className="text-neutral-500 dark:text-neutral-400">
            OPTIMAL RANGE
          </span>
          <span className="font-bold text-black dark:text-[#f3d400]">
            T-14 TO T-21
          </span>
        </div>
      </div>

      {/* KPI Card 4: Historical Volatility */}
      <div className="p-6 bg-white dark:bg-black border-2 border-black dark:border-white text-black dark:text-white flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-2 border-b-2 border-black dark:border-white mb-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 font-mono">
              [CHANNEL 04]
            </span>
            <span className="font-mono text-[10px] font-bold uppercase bg-[#f3d400] text-black border border-black px-1.5 py-0.5">
              VOLATILITY
            </span>
          </div>

          <span className="text-xs font-bold uppercase tracking-wider text-black dark:text-white font-mono block">
            PRICE VOLATILITY
          </span>

          <div className="font-sans font-black text-3xl sm:text-4xl text-black dark:text-white tracking-tight mt-1">
            {details.volatilityScore ?? Math.round(details.variance * 8.5)}/100
          </div>
        </div>

        <div className="mt-4 pt-3 border-t-2 border-black dark:border-white flex items-center justify-between text-xs font-mono">
          <span className="text-neutral-500 dark:text-neutral-400">
            METRO CLUSTER
          </span>
          <span className="font-bold text-black dark:text-white">
            TIER-1 PAIR
          </span>
        </div>
      </div>

    </div>
  )
}
