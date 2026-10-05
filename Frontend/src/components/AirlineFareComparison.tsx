import type { Airline, FareCalculationDetails } from "@/types/aviation"
import { CalendarDays, Clock, MapPin, ArrowRight } from "lucide-react"

interface AirlineFareComparisonProps {
  airlines: (Airline & { calculatedFare: number })[]
  durationMinutes: number | null
  departureDate: string
  originCode: string
  destinationCode: string
  predictionDetails: FareCalculationDetails
  onSelectAirline?: (airline: Airline) => void
}

export function AirlineFareComparison({
  airlines,
  durationMinutes,
  departureDate,
  originCode,
  destinationCode,
  predictionDetails,
  onSelectAirline
}: AirlineFareComparisonProps) {
  const summaryDuration = durationMinutes === null
    ? "Not available"
    : `${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}m`

  const formatFare = (amount: number, currency = "INR") =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount)
  const matchingFlights = airlines.filter(
    (airline) =>
      airline.departureDate === departureDate &&
      airline.departureAirportCode?.toUpperCase() === originCode.toUpperCase() &&
      airline.arrivalAirportCode?.toUpperCase() === destinationCode.toUpperCase()
  )
  const sortedAirlines = [...matchingFlights].sort(
    (first, second) =>
      (first.currentPrice ?? first.calculatedFare) -
      (second.currentPrice ?? second.calculatedFare)
  )

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
            {predictionDetails.predictionSource === "linear_regression"
              ? "Experimental estimate from historical route fares; no live listing is available for this date."
              : "Flight schedules and fares from available listings"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-bold uppercase px-2.5 py-1 bg-neutral-100 dark:bg-neutral-900 border border-black dark:border-white text-black dark:text-white">
            {matchingFlights.length} Flights
          </span>
          <span className="text-[11px] font-mono uppercase text-neutral-500 dark:text-neutral-400 hidden sm:inline">
            Lowest fare first
          </span>
        </div>
      </div>

      {sortedAirlines.length === 0 ? (
        predictionDetails.predictionSource === "linear_regression" ? (
          <div className="border-2 border-black dark:border-white p-5 sm:p-6 font-mono">
            <span className="inline-block bg-[#f3d400] text-black border border-black px-2 py-1 text-[10px] font-bold uppercase">
              Regression estimate · not a live fare
            </span>
            <p className="mt-4 text-xs uppercase text-neutral-600 dark:text-neutral-400">
              Estimated fare for {originCode} → {destinationCode} on {departureDate}
            </p>
            <p className="mt-1 text-3xl font-black">
              {formatFare(predictionDetails.predictedFare, predictionDetails.currency)}
            </p>
            <p className="mt-3 text-xs text-neutral-600 dark:text-neutral-400">
              No exact-date flight listings were found. Model trained on{" "}
              {predictionDetails.modelTrainingSamples ?? 0} grouped historical fare observations;
              held-out test MAE:{" "}
              {formatFare(predictionDetails.modelTestMae ?? 0, predictionDetails.currency)}.
              Held-out R²: {predictionDetails.modelTestR2?.toFixed(2) ?? "N/A"}.
              This experimental estimate is not a bookable offer.
            </p>
          </div>
        ) : (
          <p className="border-2 border-black p-5 font-mono text-sm dark:border-white">
            No flights found for {originCode} to {destinationCode} on {departureDate}.
          </p>
        )
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedAirlines.map((airline) => (
            <div
              key={`${airline.flightNumberPrefix}-${airline.departureDate}-${airline.departureTime}`}
              className="p-5 border-2 border-black dark:border-white rounded-none bg-white dark:bg-black text-black dark:text-white flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-black dark:border-white">
                  <div className="flex items-center gap-2.5">
                    <span className="w-9 h-9 flex items-center justify-center font-black text-xs tracking-wider border bg-black dark:bg-white text-white dark:text-black border-black dark:border-white">
                      {airline.code}
                    </span>
                    <div>
                      <h4 className="font-black text-sm uppercase tracking-tight text-black dark:text-white leading-tight">
                        {airline.name}
                      </h4>
                      <p className="text-[10px] text-neutral-600 dark:text-neutral-400 font-mono">
                        {airline.flightNumberPrefix}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mb-4 pb-4 border-b border-black dark:border-white">
                  <span className="text-[10px] uppercase font-mono font-bold text-neutral-600 dark:text-neutral-400 block tracking-wider">
                    Listed Fare
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-3xl font-black text-black dark:text-white tracking-tight">
                      {formatFare(airline.currentPrice ?? airline.calculatedFare, airline.currency)}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 text-xs text-neutral-800 dark:text-neutral-200 mb-4 font-mono">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-black dark:text-white" />
                    <div className="min-w-0">
                      <p className="font-bold text-black dark:text-white truncate">
                        {airline.departureAirportCode} → {airline.arrivalAirportCode}
                      </p>
                      <p className="text-[10px] text-neutral-600 dark:text-neutral-400 truncate">
                        {airline.departureAirport} → {airline.arrivalAirport}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-neutral-600 dark:text-neutral-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-black dark:text-white" /> Schedule
                    </span>
                    <span className="font-bold text-black dark:text-white text-right">
                      {airline.departureTime} – {airline.arrivalTime || "N/A"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-neutral-600 dark:text-neutral-400">Duration / stops</span>
                    <span className="font-bold text-black dark:text-white text-right">
                      {airline.flightDuration || summaryDuration} · {airline.stops}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-neutral-600 dark:text-neutral-400 flex items-center gap-1">
                      <CalendarDays className="w-3 h-3 text-black dark:text-white" /> Date / class
                    </span>
                    <span className="font-bold text-black dark:text-white text-right">
                      {airline.departureDate || "N/A"} · {airline.category || "N/A"}
                    </span>
                  </div>
                  {airline.scrapeTimestamp && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-neutral-600 dark:text-neutral-400">Fare collected</span>
                      <span className="font-bold text-black dark:text-white text-right">
                        {new Date(airline.scrapeTimestamp).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                {airline.website && (
                  <div className="p-2.5 bg-neutral-100 dark:bg-neutral-900 border border-black dark:border-white text-[11px] font-mono text-neutral-800 dark:text-neutral-200 mb-5 leading-snug">
                    Source: {airline.website}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => onSelectAirline?.(airline)}
                className="w-full py-3 px-3 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer border-2 border-black dark:border-white rounded-none bg-black dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-black hover:text-white dark:hover:text-black"
              >
                <span>View Flight</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
      </div>
      )}
    </div>
  )
}
