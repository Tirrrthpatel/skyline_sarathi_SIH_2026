import { useState, useId } from "react"
import type { Airport, FlightSearchParams } from "@/types/aviation"
import { INDIAN_AIRPORTS } from "@/lib/aviationData"
import { ArrowLeftRight, Calendar, Users, AlertCircle, PlaneTakeoff, PlaneLanding, ChevronDown, Sparkles } from "lucide-react"

interface FlightSearchWidgetProps {
  initialParams: FlightSearchParams
  onSearch: (params: FlightSearchParams) => void
  airports?: Airport[]
  className?: string
}

export function FlightSearchWidget({
  initialParams,
  onSearch,
  airports = INDIAN_AIRPORTS,
  className = ""
}: FlightSearchWidgetProps) {
  const originSelectId = useId()
  const destSelectId = useId()
  const departureDateId = useId()
  const returnDateId = useId()

  const [origin, setOrigin] = useState(initialParams.origin || "DEL")
  const [destination, setDestination] = useState(initialParams.destination || "BLR")
  const [departureDate, setDepartureDate] = useState(
    initialParams.departure_date || new Date().toISOString().split("T")[0]
  )
  const [returnDate, setReturnDate] = useState(initialParams.return_date || "")
  const [tripType, setTripType] = useState<"one_way" | "round_trip">(
    initialParams.trip_type || "one_way"
  )
  const [travellers, setTravellers] = useState(initialParams.travellers || 1)
  const [cabinClass, setCabinClass] = useState<'Economy' | 'Premium Economy' | 'Business'>(
    initialParams.cabin_class || "Economy"
  )

  const [validationError, setValidationError] = useState<string | null>(null)

  const todayStr = new Date().toISOString().split("T")[0]

  const handleSwapAirports = () => {
    const temp = origin
    setOrigin(destination)
    setDestination(temp)
    setValidationError(null)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (origin === destination) {
      setValidationError("Origin airport and destination corridor cannot be identical.")
      return
    }

    if (tripType === "round_trip" && returnDate && returnDate < departureDate) {
      setValidationError("Return date cannot precede departure date.")
      return
    }

    setValidationError(null)

    onSearch({
      origin,
      destination,
      departure_date: departureDate,
      return_date: tripType === "round_trip" ? returnDate : undefined,
      trip_type: tripType,
      travellers,
      cabin_class: cabinClass
    })
  }

  const handleQuickPick = (orig: string, dest: string) => {
    setOrigin(orig)
    setDestination(dest)
    setValidationError(null)
  }

  return (
    <div
      className={`p-6 sm:p-8 rounded-none bg-white dark:bg-black border-2 border-black dark:border-white text-black dark:text-white transition-colors duration-150 ${className}`}
    >
      
      {/* Top Bar: Trip Type & Cabin Class */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b-2 border-black dark:border-white">
        
        {/* One Way / Round Trip Toggle */}
        <div className="inline-flex border-2 border-black dark:border-white divide-x-2 divide-black dark:divide-white">
          <button
            type="button"
            onClick={() => setTripType("one_way")}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
              tripType === "one_way"
                ? "bg-[#f3d400] text-black font-black"
                : "bg-white dark:bg-black text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900"
            }`}
          >
            One-Way Corridor
          </button>
          <button
            type="button"
            onClick={() => {
              setTripType("round_trip")
              if (!returnDate) {
                const nextWeek = new Date()
                nextWeek.setDate(nextWeek.getDate() + 7)
                setReturnDate(nextWeek.toISOString().split("T")[0])
              }
            }}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
              tripType === "round_trip"
                ? "bg-[#f3d400] text-black font-black"
                : "bg-white dark:bg-black text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900"
            }`}
          >
            Round-Trip Telemetry
          </button>
        </div>

        {/* Cabin Class Buttons */}
        <div className="inline-flex border-2 border-black dark:border-white divide-x-2 divide-black dark:divide-white text-xs font-bold uppercase">
          {(["Economy", "Premium Economy", "Business"] as const).map((cls) => (
            <button
              key={cls}
              type="button"
              onClick={() => setCabinClass(cls)}
              className={`px-4 py-2 transition-colors cursor-pointer ${
                cabinClass === cls
                  ? "bg-[#f3d400] text-black font-black"
                  : "bg-white dark:bg-black text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900"
              }`}
            >
              {cls}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSearchSubmit} className="space-y-6">
        
        {/* Airport Selection with Swap Button */}
        <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
          
          {/* Origin Airport */}
          <div className="md:col-span-5 relative text-left">
            <label htmlFor={originSelectId} className="block text-xs font-bold uppercase tracking-wider text-black dark:text-white mb-2 font-mono flex items-center gap-1.5">
              <PlaneTakeoff className="w-3.5 h-3.5 text-black dark:text-white" />
              Origin Hub [Departure]
            </label>
            <div className="relative">
              <select
                id={originSelectId}
                value={origin}
                onChange={(e) => {
                  setOrigin(e.target.value)
                  setValidationError(null)
                }}
                className="w-full appearance-none bg-white dark:bg-black border-2 border-black dark:border-white rounded-none px-4 py-3 text-sm font-bold text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors pr-10 cursor-pointer font-mono"
              >
                {airports.map((a) => (
                  <option key={a.code} value={a.code} className="bg-white dark:bg-black text-black dark:text-white font-mono">
                    {a.city} ({a.code}) — {a.airport}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-black dark:text-white">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400 font-mono uppercase">
              <span>Terminal {airports.find((a) => a.code === origin)?.terminal || "T1"}</span>
              <span>{airports.find((a) => a.code === origin)?.state}</span>
            </div>
          </div>

          {/* Swap Button */}
          <div className="md:col-span-1 flex justify-center py-1">
            <button
              type="button"
              onClick={handleSwapAirports}
              title="Swap Origin and Destination"
              className="w-11 h-11 border-2 border-black dark:border-white bg-white dark:bg-black hover:bg-[#f3d400] hover:text-black dark:hover:bg-[#f3d400] dark:hover:text-black flex items-center justify-center text-black dark:text-white transition-colors cursor-pointer rounded-none"
            >
              <ArrowLeftRight className="w-4 h-4 text-inherit" />
            </button>
          </div>

          {/* Destination Airport */}
          <div className="md:col-span-5 relative text-left">
            <label htmlFor={destSelectId} className="block text-xs font-bold uppercase tracking-wider text-black dark:text-white mb-2 font-mono flex items-center gap-1.5">
              <PlaneLanding className="w-3.5 h-3.5 text-black dark:text-white" />
              Destination Corridor [Arrival]
            </label>
            <div className="relative">
              <select
                id={destSelectId}
                value={destination}
                onChange={(e) => {
                  setDestination(e.target.value)
                  setValidationError(null)
                }}
                className="w-full appearance-none bg-white dark:bg-black border-2 border-black dark:border-white rounded-none px-4 py-3 text-sm font-bold text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors pr-10 cursor-pointer font-mono"
              >
                {airports.map((a) => (
                  <option key={a.code} value={a.code} className="bg-white dark:bg-black text-black dark:text-white font-mono">
                    {a.city} ({a.code}) — {a.airport}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-black dark:text-white">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400 font-mono uppercase">
              <span>Terminal {airports.find((a) => a.code === destination)?.terminal || "T1"}</span>
              <span>{airports.find((a) => a.code === destination)?.state}</span>
            </div>
          </div>

        </div>

        {/* Date, Passengers & Search Action */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-4 items-end pt-2 text-left">
          
          {/* Departure Date */}
          <div className={`${tripType === "round_trip" ? "md:col-span-3" : "md:col-span-4"}`}>
            <label htmlFor={departureDateId} className="block text-xs font-bold uppercase tracking-wider text-black dark:text-white mb-2 font-mono flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-black dark:text-white" />
              Departure Date
            </label>
            <input
              id={departureDateId}
              type="date"
              min={todayStr}
              value={departureDate}
              onChange={(e) => setDepartureDate(e.target.value)}
              className="w-full bg-white dark:bg-black border-2 border-black dark:border-white rounded-none px-3.5 py-3 text-sm font-bold text-black dark:text-white font-mono focus:outline-none focus:border-black dark:focus:border-white"
            />
          </div>

          {/* Return Date (if Round Trip) */}
          {tripType === "round_trip" && (
            <div className="md:col-span-3">
              <label htmlFor={returnDateId} className="block text-xs font-bold uppercase tracking-wider text-black dark:text-white mb-2 font-mono flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-black dark:text-white" />
                Return Date
              </label>
              <input
                id={returnDateId}
                type="date"
                min={departureDate}
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full bg-white dark:bg-black border-2 border-black dark:border-white rounded-none px-3.5 py-3 text-sm font-bold text-black dark:text-white font-mono focus:outline-none focus:border-black dark:focus:border-white"
              />
            </div>
          )}

          {/* Travellers Counter */}
          <div className={`${tripType === "round_trip" ? "md:col-span-3" : "md:col-span-4"}`}>
            <label className="block text-xs font-bold uppercase tracking-wider text-black dark:text-white mb-2 font-mono flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-black dark:text-white" />
              Passengers
            </label>
            <div className="flex items-center justify-between bg-white dark:bg-black border-2 border-black dark:border-white rounded-none px-4 py-2.5">
              <span className="text-sm font-bold text-black dark:text-white font-mono">
                {travellers} {travellers === 1 ? "Adult" : "Adults"}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setTravellers(Math.max(1, travellers - 1))}
                  className="w-8 h-8 border border-black dark:border-white bg-white dark:bg-black hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-black dark:text-white font-bold text-sm flex items-center justify-center transition-colors cursor-pointer rounded-none"
                  disabled={travellers <= 1}
                >
                  -
                </button>
                <button
                  type="button"
                  onClick={() => setTravellers(Math.min(9, travellers + 1))}
                  className="w-8 h-8 border border-black dark:border-white bg-white dark:bg-black hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-black dark:text-white font-bold text-sm flex items-center justify-center transition-colors cursor-pointer rounded-none"
                  disabled={travellers >= 9}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Submit Telemetry Action Button */}
          <div className={`${tripType === "round_trip" ? "md:col-span-3" : "md:col-span-4"}`}>
            <button
              type="submit"
              className="w-full bg-black dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-black hover:text-white dark:hover:text-black text-xs sm:text-sm font-black uppercase tracking-wider h-[50px] border-2 border-black dark:border-white rounded-none flex items-center justify-center gap-2 cursor-pointer transition-colors duration-150"
            >
              <Sparkles className="w-4 h-4 text-inherit" />
              <span>ANALYZE TELEMETRY</span>
            </button>
          </div>

        </div>

        {/* Validation Warning Alert */}
        {validationError && (
          <div className="flex items-center gap-2 p-3 bg-neutral-100 dark:bg-neutral-900 border-2 border-black dark:border-white text-black dark:text-white text-xs font-mono font-bold uppercase">
            <AlertCircle className="w-4 h-4 shrink-0 text-black dark:text-white" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Quick Corridor Selection Chips */}
        <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-black dark:text-white font-mono text-xs font-bold uppercase tracking-wider">
            HIGH DENSITY CORRIDORS:
          </span>
          {[
            { o: "DEL", d: "BLR", label: "DEL ⇄ BLR" },
            { o: "BOM", d: "DEL", label: "BOM ⇄ DEL" },
            { o: "BLR", d: "CCU", label: "BLR ⇄ CCU" },
            { o: "DEL", d: "GOI", label: "DEL ⇄ GOI" },
            { o: "HYD", d: "BOM", label: "HYD ⇄ BOM" },
          ].map((pair) => {
            const isMatch = (origin === pair.o && destination === pair.d) || (origin === pair.d && destination === pair.o)
            return (
              <button
                key={pair.label}
                type="button"
                onClick={() => handleQuickPick(pair.o, pair.d)}
                className={`px-3 py-1 font-mono text-[11px] uppercase transition-colors cursor-pointer rounded-none border ${
                  isMatch
                    ? "bg-[#f3d400] text-black border-2 border-black font-black"
                    : "bg-white dark:bg-black hover:bg-[#f3d400] hover:text-black dark:hover:bg-[#f3d400] dark:hover:text-black text-black dark:text-white border-black dark:border-white font-bold"
                }`}
              >
                {pair.label}
              </button>
            )
          })}
        </div>

      </form>
    </div>
  )
}
