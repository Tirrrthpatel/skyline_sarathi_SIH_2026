import type { FareCalculationDetails } from "@/types/aviation"
import { TrendingDown, TrendingUp } from "lucide-react"

interface TelemetryKpiCardsProps {
  details: FareCalculationDetails
}

export function TelemetryKpiCards({ details }: TelemetryKpiCardsProps) {
  const isModelEstimate = details.predictionSource === "linear_regression"
  const diffFromAvg = details.historicalAvg
    ? Math.round(
      ((details.predictedFare - details.historicalAvg) / details.historicalAvg) * 100
    )
    : 0
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
              {isModelEstimate ? "MODEL ESTIMATE" : "FAIR VALUE"}
            </span>
          </div>

          <span className="text-xs font-bold uppercase tracking-wider text-black dark:text-white font-mono block">
            {isModelEstimate ? "ESTIMATED TARIFF" : "PREDICTED TARIFF"}
          </span>

          <div className="font-sans font-black text-3xl sm:text-4xl text-black dark:text-white tracking-tight mt-1">
            ₹{details.predictedFare.toLocaleString("en-IN")}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t-2 border-black dark:border-white flex items-center justify-between text-xs font-mono">
          {isModelEstimate ? (
            <span className="text-neutral-600 dark:text-neutral-300 text-[10px]">
              TEST MAE: ₹{(details.modelTestMae ?? 0).toLocaleString("en-IN")}
            </span>
          ) : (
            <>
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
            </>
          )}
        </div>
        {isModelEstimate && (
          <p className="mt-2 text-[10px] font-mono text-neutral-500 dark:text-neutral-400">
            Experimental estimate · {details.modelTrainingSamples ?? 0} route observations
          </p>
        )}
      </div>

      {/* KPI Card 2: Lowest observed booking window */}
      <div className="p-6 bg-white dark:bg-black border-2 border-black dark:border-white text-black dark:text-white flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-2 border-b-2 border-black dark:border-white mb-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 font-mono">
              [CHANNEL 02]
            </span>
            <span className="font-mono text-[10px] font-bold uppercase bg-[#f3d400] text-black border border-black px-1.5 py-0.5">
              OBSERVED DATA
            </span>
          </div>

          <span className="text-xs font-bold uppercase tracking-wider text-black dark:text-white font-mono block">
            LOWEST AVG FARE WINDOW
          </span>

          <div className="font-sans font-black text-3xl sm:text-4xl text-black dark:text-white tracking-tight mt-1">
            {details.bestBookingWindowDays == null
              ? "N/A"
              : details.bestBookingWindowDays === 0
                ? "TODAY"
                : `T-${details.bestBookingWindowDays}D`}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t-2 border-black dark:border-white flex items-center justify-between text-xs font-mono">
          <span className="text-neutral-500 dark:text-neutral-400">
            CONSIDER BUYING BY
          </span>
          <span className="font-bold text-black dark:text-white">
            {details.recommendedPurchaseDate ?? "Not available"}
          </span>
        </div>
        <p className="mt-2 text-[10px] font-mono text-neutral-500 dark:text-neutral-400">
          {details.bestWindowAverageFare == null
            ? "Not enough fare history to estimate a window."
            : `Avg ₹${details.bestWindowAverageFare.toLocaleString("en-IN")} · ${details.bookingWindowSampleSize ?? 0} observations`}
        </p>
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
