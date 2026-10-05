import type { TelemetryPredictionResult } from "@/types/aviation"
import { Plane, Edit3 } from "lucide-react"

interface ActiveRouteStripProps {
  telemetry: TelemetryPredictionResult
  onChangeFlight: () => void
}

export function ActiveRouteStrip({ telemetry, onChangeFlight }: ActiveRouteStripProps) {
  const { params, originAirport, destinationAirport, details, bearing } = telemetry

  const formattedDuration = details.flightDurationMinutes === null
    ? "N/A"
    : `${Math.floor(details.flightDurationMinutes / 60)}h ${details.flightDurationMinutes % 60}m`

  return (
    <div className="w-full rounded-none p-5 sm:p-6 bg-white dark:bg-black border-2 border-black dark:border-white text-black dark:text-white transition-colors duration-150">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        
        {/* Left: Corridor Route Info */}
        <div className="flex items-center gap-4 text-left">
          <div className="w-12 h-12 bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shrink-0 border-2 border-black dark:border-white">
            <Plane className="w-5 h-5 text-white dark:text-black rotate-45" />
          </div>

          <div>
            <div className="flex items-center gap-3">
              <span className="font-sans font-black text-2xl sm:text-3xl tracking-tight text-black dark:text-white">
                {originAirport.code}
              </span>
              <div className="px-2.5 py-0.5 bg-[#f3d400] text-black border border-black text-xs font-mono font-black">
                ━━━━▶
              </div>
              <span className="font-sans font-black text-2xl sm:text-3xl tracking-tight text-black dark:text-white">
                {destinationAirport.code}
              </span>
            </div>
            
            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono uppercase mt-1">
              {originAirport.city} TO {destinationAirport.city} • CORRIDOR IN-{originAirport.code}{destinationAirport.code}
            </p>
          </div>
        </div>

        {/* Middle: Flight Telemetry Metas */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-xs border-t lg:border-t-0 pt-4 lg:pt-0 border-black/20 dark:border-white/20 text-left font-mono">
          
          <div className="border-l-2 border-black dark:border-white pl-2.5">
            <span className="text-neutral-500 dark:text-neutral-400 text-[10px] uppercase font-bold tracking-wider block">
              DEPARTURE
            </span>
            <p className="font-bold text-black dark:text-white mt-0.5 text-xs truncate">
              {params.departure_date}
            </p>
          </div>

          <div className="border-l-2 border-black dark:border-white pl-2.5">
            <span className="text-neutral-500 dark:text-neutral-400 text-[10px] uppercase font-bold tracking-wider block">
              CABIN & PAX
            </span>
            <p className="font-bold text-black dark:text-white mt-0.5 text-xs truncate">
              {params.cabin_class} • {params.travellers}p
            </p>
          </div>

          <div className="border-l-2 border-black dark:border-white pl-2.5">
            <span className="text-neutral-500 dark:text-neutral-400 text-[10px] uppercase font-bold tracking-wider block">
              DISTANCE
            </span>
            <p className="font-bold text-black dark:text-white mt-0.5 text-xs">
              {details.distanceKm.toLocaleString("en-IN")} KM
            </p>
          </div>

          <div className="border-l-2 border-black dark:border-white pl-2.5">
            <span className="text-neutral-500 dark:text-neutral-400 text-[10px] uppercase font-bold tracking-wider block">
              FLIGHT TIME
            </span>
            <p className="font-bold text-black dark:text-white mt-0.5 text-xs">
              {formattedDuration}
            </p>
          </div>

          <div className="border-l-2 border-black dark:border-white pl-2.5">
            <span className="text-neutral-500 dark:text-neutral-400 text-[10px] uppercase font-bold tracking-wider block">
              AZIMUTH BRG
            </span>
            <p className="font-bold text-black dark:text-white mt-0.5 text-xs">
              {bearing}° BEARING
            </p>
          </div>

        </div>

        {/* Right: Change Flight Link/Button */}
        <div className="flex items-center gap-3 justify-end">
          <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-neutral-100 dark:bg-neutral-900 border-2 border-black dark:border-white font-mono text-[11px]">
            <span className="w-2 h-2 bg-[#f3d400] border border-black inline-block"></span>
            <span className="text-black dark:text-white font-bold uppercase">
              {details.predictionSource === "linear_regression"
                ? `LINEAR REGRESSION · ${details.modelTrainingSamples ?? 0} SAMPLES`
                : `POSTGRESQL · ${details.sampleSize ?? 0} RECORDS`}
            </span>
          </div>

          <button
            onClick={onChangeFlight}
            className="swiss-btn-primary px-4 py-2.5 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 cursor-pointer rounded-none"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>CHANGE ROUTE</span>
          </button>
        </div>

      </div>
    </div>
  )
}
