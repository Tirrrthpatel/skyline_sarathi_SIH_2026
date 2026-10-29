import { useState } from "react"
import type { Airline, FareCalculationDetails } from "@/types/aviation"
import { CalendarDays, Clock, MapPin, ExternalLink, Globe } from "lucide-react"

export type BookingPlatform = "mmt" | "easemytrip" | "yatra" | "google"

export interface PlatformConfig {
  id: BookingPlatform
  name: string
  shortLabel: string
  color: string
  getUrl: (params: {
    origin: string
    destination: string
    departureDate?: string
    cabinClass?: string
    airlineName?: string
    flightNumber?: string
  }) => string
}

function parseFlightDate(dateStr?: string) {
  if (!dateStr) {
    const d = new Date()
    const yyyy = String(d.getFullYear())
    const mm = String(d.getMonth() + 1).padStart(2, "0")
    const dd = String(d.getDate()).padStart(2, "0")
    return { yyyy, mm, dd, ddmmyyyy: `${dd}/${mm}/${yyyy}`, yyyymmdd: `${yyyy}-${mm}-${dd}` }
  }

  const clean = dateStr.split("T")[0]
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    const [yyyy, mm, dd] = clean.split("-")
    return { yyyy, mm, dd, ddmmyyyy: `${dd}/${mm}/${yyyy}`, yyyymmdd: `${yyyy}-${mm}-${dd}` }
  }

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(clean)) {
    const [dd, mm, yyyy] = clean.split("/")
    return { yyyy, mm, dd, ddmmyyyy: `${dd}/${mm}/${yyyy}`, yyyymmdd: `${yyyy}-${mm}-${dd}` }
  }

  const parsed = new Date(dateStr)
  if (!isNaN(parsed.getTime())) {
    const yyyy = String(parsed.getFullYear())
    const mm = String(parsed.getMonth() + 1).padStart(2, "0")
    const dd = String(parsed.getDate()).padStart(2, "0")
    return { yyyy, mm, dd, ddmmyyyy: `${dd}/${mm}/${yyyy}`, yyyymmdd: `${yyyy}-${mm}-${dd}` }
  }

  const now = new Date()
  const yyyy = String(now.getFullYear())
  const mm = String(now.getMonth() + 1).padStart(2, "0")
  const dd = String(now.getDate()).padStart(2, "0")
  return { yyyy, mm, dd, ddmmyyyy: `${dd}/${mm}/${yyyy}`, yyyymmdd: `${yyyy}-${mm}-${dd}` }
}

export const BOOKING_PLATFORMS: Record<BookingPlatform, PlatformConfig> = {
  mmt: {
    id: "mmt",
    name: "MakeMyTrip",
    shortLabel: "MMT",
    color: "#e53e3e",
    getUrl: ({ origin, destination, departureDate, cabinClass }) => {
      const { ddmmyyyy } = parseFlightDate(departureDate)
      const cabin = cabinClass?.toLowerCase().includes("business")
        ? "B"
        : cabinClass?.toLowerCase().includes("premium")
        ? "PE"
        : "E"
      return `https://www.makemytrip.com/flight/search?itinerary=${origin.toUpperCase()}-${destination.toUpperCase()}-${ddmmyyyy}&tripType=O&paxType=A-1_C-0_I-0&intl=false&cabinClass=${cabin}`
    },
  },
  easemytrip: {
    id: "easemytrip",
    name: "EaseMyTrip",
    shortLabel: "EaseMyTrip",
    color: "#0284c7",
    getUrl: ({ origin, destination, departureDate, cabinClass }) => {
      const { ddmmyyyy } = parseFlightDate(departureDate)
      const cabinCode = cabinClass?.toLowerCase().includes("business")
        ? "2"
        : cabinClass?.toLowerCase().includes("premium")
        ? "1"
        : "0"
      return `https://flight.easemytrip.com/FlightList/Index?srch=${origin.toUpperCase()}-${destination.toUpperCase()}-${ddmmyyyy}&px=1-0-0&cbn=${cabinCode}`
    },
  },
  yatra: {
    id: "yatra",
    name: "Yatra",
    shortLabel: "Yatra",
    color: "#ea580c",
    getUrl: ({ origin, destination, departureDate, cabinClass }) => {
      const { ddmmyyyy } = parseFlightDate(departureDate)
      const yatraClass = cabinClass?.toLowerCase().includes("business")
        ? "Business"
        : cabinClass?.toLowerCase().includes("premium")
        ? "PremiumEconomy"
        : "Economy"
      return `https://flight.yatra.com/air-search-ui/dom2/trigger?type=O&viewName=normal&flexi=0&noOfSegments=1&origin=${origin.toUpperCase()}&originCountry=IN&destination=${destination.toUpperCase()}&destinationCountry=IN&flight_depart_date=${encodeURIComponent(ddmmyyyy)}&ADT=1&CHD=0&INF=0&class=${yatraClass}`
    },
  },
  google: {
    id: "google",
    name: "Google Flights",
    shortLabel: "Google",
    color: "#4285f4",
    getUrl: ({ origin, destination, departureDate }) => {
      const { yyyymmdd } = parseFlightDate(departureDate)
      const query = encodeURIComponent(`flights from ${origin.toUpperCase()} to ${destination.toUpperCase()} on ${yyyymmdd}`)
      return `https://www.google.com/travel/flights?q=${query}`
    },
  },
}

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
  onSelectAirline,
}: AirlineFareComparisonProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<BookingPlatform>("mmt")

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
              : "Flight schedules and fares with direct booking integration"}
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

      {/* Global Booking Channel Selector Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 mb-6 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 font-mono text-xs">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-black dark:text-white shrink-0" />
          <span className="font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
            Default Booking Channel:
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {(["mmt", "easemytrip", "yatra", "google"] as const).map((platKey) => {
            const plat = BOOKING_PLATFORMS[platKey]
            const isActive = selectedPlatform === platKey
            return (
              <button
                key={platKey}
                type="button"
                onClick={() => setSelectedPlatform(platKey)}
                className={`px-3 py-1 text-[11px] font-mono uppercase transition-colors cursor-pointer border ${
                  isActive
                    ? "bg-[#f3d400] text-black border-black font-black"
                    : "bg-white dark:bg-black text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-700 hover:border-black dark:hover:border-white"
                }`}
              >
                {plat.name} {isActive && "✓"}
              </button>
            )
          })}
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
              No exact-date flight listings were found in local history. Model trained on{" "}
              {predictionDetails.modelTrainingSamples ?? 0} grouped historical fare observations;
              held-out test MAE:{" "}
              {formatFare(predictionDetails.modelTestMae ?? 0, predictionDetails.currency)}.
              Held-out R²: {predictionDetails.modelTestR2?.toFixed(2) ?? "N/A"}.
            </p>

            <div className="mt-5 pt-4 border-t border-neutral-300 dark:border-neutral-700">
              <p className="text-xs font-bold uppercase mb-2">Check live flight availability on:</p>
              <div className="flex flex-wrap gap-2">
                {(["mmt", "easemytrip", "yatra", "google"] as const).map((platKey) => {
                  const plat = BOOKING_PLATFORMS[platKey]
                  const url = plat.getUrl({
                    origin: originCode,
                    destination: destinationCode,
                    departureDate,
                  })
                  return (
                    <a
                      key={platKey}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 text-xs font-mono font-bold uppercase border-2 border-black dark:border-white bg-white dark:bg-black hover:bg-[#f3d400] hover:text-black dark:hover:bg-[#f3d400] dark:hover:text-black flex items-center gap-1.5"
                    >
                      <span>Search on {plat.name}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="border-2 border-black p-5 font-mono text-sm dark:border-white">
            <p>No flights found for {originCode} to {destinationCode} on {departureDate}.</p>
            <div className="mt-4 pt-3 border-t border-neutral-300 dark:border-neutral-700">
              <p className="text-xs font-bold uppercase mb-2">Search live booking availability on:</p>
              <div className="flex flex-wrap gap-2">
                {(["mmt", "easemytrip", "yatra", "google"] as const).map((platKey) => {
                  const plat = BOOKING_PLATFORMS[platKey]
                  const url = plat.getUrl({
                    origin: originCode,
                    destination: destinationCode,
                    departureDate,
                  })
                  return (
                    <a
                      key={platKey}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 text-xs font-mono font-bold uppercase border-2 border-black dark:border-white bg-white dark:bg-black hover:bg-[#f3d400] hover:text-black dark:hover:bg-[#f3d400] dark:hover:text-black flex items-center gap-1.5"
                    >
                      <span>{plat.name}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )
                })}
              </div>
            </div>
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedAirlines.map((airline) => {
            const flightOrigin = airline.departureAirportCode || originCode
            const flightDest = airline.arrivalAirportCode || destinationCode
            const flightDate = airline.departureDate || departureDate
            const cabin = airline.category || "Economy"

            const defaultBookingUrl = BOOKING_PLATFORMS[selectedPlatform].getUrl({
              origin: flightOrigin,
              destination: flightDest,
              departureDate: flightDate,
              cabinClass: cabin,
              airlineName: airline.name,
              flightNumber: airline.flightNumberPrefix,
            })

            return (
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
                    <div className="p-2.5 bg-neutral-100 dark:bg-neutral-900 border border-black dark:border-white text-[11px] font-mono text-neutral-800 dark:text-neutral-200 mb-4 leading-snug flex items-center justify-between">
                      <span>Source: <strong>{airline.website}</strong></span>
                      <span className="text-[9px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border border-emerald-400 dark:border-emerald-700 px-1.5 py-0.5 uppercase font-bold">
                        Verified
                      </span>
                    </div>
                  )}
                </div>

                {/* Direct Booking Links Section */}
                <div className="mt-2 pt-3 border-t border-black dark:border-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                      Direct OTA Redirects:
                    </span>
                    <span className="text-[9px] font-mono uppercase bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300">
                      Opens New Tab ↗
                    </span>
                  </div>

                  {/* Fast Platform Badges */}
                  <div className="grid grid-cols-4 gap-1 mb-3">
                    {(["mmt", "easemytrip", "yatra", "google"] as const).map((platKey) => {
                      const plat = BOOKING_PLATFORMS[platKey]
                      const url = plat.getUrl({
                        origin: flightOrigin,
                        destination: flightDest,
                        departureDate: flightDate,
                        cabinClass: cabin,
                        airlineName: airline.name,
                        flightNumber: airline.flightNumberPrefix,
                      })
                      const isHighlighted = selectedPlatform === platKey
                      const isSource = airline.website?.toLowerCase().includes(platKey.toLowerCase())

                      return (
                        <a
                          key={platKey}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={`Direct search on ${plat.name}`}
                          className={`relative text-center py-1.5 text-[10px] font-mono font-bold uppercase border transition-colors cursor-pointer ${
                            isHighlighted
                              ? "bg-[#f3d400] text-black border-black font-black"
                              : "bg-neutral-50 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-700 hover:border-black dark:hover:border-white hover:bg-neutral-200 dark:hover:bg-neutral-800"
                          }`}
                        >
                          <span>{plat.shortLabel}</span>
                          {isSource && (
                            <span
                              className="absolute -top-1 -right-0.5 w-2 h-2 bg-emerald-500 border border-white dark:border-black rounded-full"
                              title="Original Source Provider"
                            />
                          )}
                        </a>
                      )
                    })}
                  </div>

                  {/* Primary "VIEW FLIGHT" Call to Action */}
                  <a
                    href={defaultBookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => onSelectAirline?.(airline)}
                    className="w-full py-3 px-3 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer border-2 border-black dark:border-white rounded-none bg-black dark:bg-white hover:bg-[#f3d400] hover:text-black dark:hover:bg-[#f3d400] dark:hover:text-black text-white dark:text-black group"
                  >
                    <span>View Flight on {BOOKING_PLATFORMS[selectedPlatform].name}</span>
                    <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </a>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
