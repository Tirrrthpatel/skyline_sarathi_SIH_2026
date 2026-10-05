import { useState, useEffect } from "react"
import type { FlightSearchParams, TelemetryPredictionResult, UserSession, Airport } from "@/types/aviation"
import { INDIAN_AIRPORTS } from "@/lib/aviationData"
import { predictFlightFare, fetchAirports, getStoredUser } from "@/lib/api"
import { Navbar } from "@/components/Navbar"
import { AuthModal } from "@/components/AuthModal"
import { Footer } from "@/components/Footer"
import { FlightSearchWidget } from "@/components/FlightSearchWidget"
import { ActiveRouteStrip } from "@/components/ActiveRouteStrip"
import { TelemetryKpiCards } from "@/components/TelemetryKpiCards"
import { FareForecastCurve } from "@/components/FareForecastCurve"
import { FlightPriceAnalysis } from "@/components/FlightPriceAnalysis"
import { RouteMap } from "@/components/RouteMap"
import { AirlineFareComparison } from "@/components/AirlineFareComparison"
import { WhatIfSimulator } from "@/components/WhatIfSimulator"

// Landing Page Sections
import { HeroSection } from "@/components/landing/HeroSection"
import { ProblemStatement } from "@/components/landing/ProblemStatement"
import { PipelineVisualizer } from "@/components/landing/PipelineVisualizer"
import { ImpactMetrics } from "@/components/landing/ImpactMetrics"
import { TeamTechStack } from "@/components/landing/TeamTechStack"
import { ArrowRight, Loader2 } from "lucide-react"

export function App() {
  // Navigation View State ('landing' | 'search' | 'dashboard')
  const [view, setView] = useState<"landing" | "search" | "dashboard">(() => {
    const path = window.location.pathname
    if (path === "/search") return "search"
    if (path === "/dashboard") return "dashboard"
    return "landing"
  })

  // User Authentication State
  const [user, setUser] = useState<UserSession | null>(null)
  const [isAuthOpen, setIsAuthOpen] = useState(false)

  // Airport Registry
  const [airports, setAirports] = useState<Airport[]>(INDIAN_AIRPORTS)

  // Active Flight Search Parameters
  const [searchParams, setSearchParams] = useState<FlightSearchParams>(() => {
    const nextTwoWeeks = new Date()
    nextTwoWeeks.setDate(nextTwoWeeks.getDate() + 14)
    return {
      origin: "DEL",
      destination: "BLR",
      departure_date: nextTwoWeeks.toISOString().split("T")[0],
      trip_type: "one_way",
      travellers: 1,
      cabin_class: "Economy"
    }
  })

  // Telemetry Prediction Result
  const [telemetry, setTelemetry] = useState<TelemetryPredictionResult | null>(null)

  const [isLoadingTelemetry, setIsLoadingTelemetry] = useState(false)
  const [fareQueryError, setFareQueryError] = useState<string | null>(null)

  // Handle URL history pushState/popstate for static routing
  const navigateTo = (newView: "landing" | "search" | "dashboard") => {
    setView(newView)
    const newPath = newView === "landing" ? "/" : `/${newView}`
    if (window.location.pathname !== newPath) {
      window.history.pushState({ view: newView }, "", newPath)
    }
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  useEffect(() => {
    // Check localStorage for stored aero_user
    const stored = getStoredUser()
    if (stored) setUser(stored)

    // Load airports from API
    fetchAirports().then((list) => {
      if (list && list.length > 0) setAirports(list)
    })

    // Listen to browser popstate (back/forward buttons)
    const handlePopState = () => {
      const path = window.location.pathname
      if (path === "/search") setView("search")
      else if (path === "/dashboard") setView("dashboard")
      else setView("landing")
    }

    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [])

  // Execute Flight Search & Telemetry Update
  const handleSearch = async (params: FlightSearchParams) => {
    setSearchParams(params)
    setFareQueryError(null)
    setIsLoadingTelemetry(true)
    try {
      const result = await predictFlightFare(params)
      setTelemetry(result)
      navigateTo("dashboard")
    } catch (error) {
      setFareQueryError(
        error instanceof Error ? error.message : "Unable to load fares from the database."
      )
    } finally {
      setIsLoadingTelemetry(false)
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white flex flex-col font-sans selection:bg-[#f3d400] selection:text-black transition-colors duration-150">
      
      {/* Navigation Header */}
      <Navbar
        currentView={view}
        onNavigate={navigateTo}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Main View Router */}
      <main className="flex-1 relative">
        
        {/* Loading Overlay if inferring */}
        {isLoadingTelemetry && (
          <div className="absolute inset-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center">
            <div className="p-5 bg-white dark:bg-black text-black dark:text-white border-2 border-black dark:border-white flex items-center gap-3 shadow-none">
              <Loader2 className="w-5 h-5 text-swiss-accent animate-spin" />
              <span className="font-mono uppercase font-black text-xs tracking-wider">Computing Ensemble Telemetry...</span>
            </div>
          </div>
        )}

        {/* ======================= VIEW: LANDING ======================= */}
        {view === "landing" && (
          <div className="animate-in fade-in duration-150">
            {/* 1. Hero Section with Cursor-Parallax Flat Illustration */}
            <HeroSection
              onLaunchSearch={() => navigateTo("search")}
              onOpenDashboard={() => navigateTo("dashboard")}
            />

            {/* 2. SIH CPI Problem Statement Section */}
            <ProblemStatement />

            {/* 3. Pipeline Visualizer with 6-Stage PPT Architecture */}
            <PipelineVisualizer />

            {/* 4. Impact Metrics */}
            <ImpactMetrics />

            {/* 5. Team Tech Stack */}
            <TeamTechStack />

            {/* Bottom Call to Action */}
            <section className="relative z-10 py-16 sm:py-24 border-b-4 border-black dark:border-white bg-white dark:bg-black text-black dark:text-white swiss-grid-pattern">
              <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-100 dark:bg-neutral-900 border border-black dark:border-white text-[11px] font-mono font-bold uppercase text-black dark:text-white">
                  <span className="w-2 h-2 bg-swiss-accent"></span>
                  <span>05. LIVE TELEMETRY READY</span>
                </div>
                <h3 className="font-black text-3xl sm:text-6xl text-black dark:text-white tracking-tight uppercase">
                  Inspect Live Airfare Telemetry
                </h3>
                <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 max-w-xl mx-auto font-mono leading-relaxed">
                  Evaluate price sensitivity, compare airline tariff multipliers, and view 30-day forecast trajectories for any domestic corridor.
                </p>
                <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
                  <button
                    onClick={() => navigateTo("dashboard")}
                    className="bg-black dark:bg-white hover:bg-swiss-accent dark:hover:bg-swiss-accent text-white dark:text-black hover:text-white dark:hover:text-white font-black uppercase text-xs tracking-wider px-8 py-4 border-2 border-black dark:border-white rounded-none flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <span>Launch Live Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => navigateTo("search")}
                    className="bg-white dark:bg-black hover:bg-neutral-100 dark:hover:bg-neutral-900 text-black dark:text-white font-black uppercase text-xs tracking-wider px-8 py-4 border-2 border-black dark:border-white rounded-none flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <span>Corridor Search Engine</span>
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ======================= VIEW: SEARCH ======================= */}
        {view === "search" && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 animate-in fade-in duration-150">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-100 dark:bg-neutral-900 border border-black dark:border-white text-[11px] font-mono font-bold uppercase text-black dark:text-white mb-3">
                <span className="w-2 h-2 bg-swiss-accent"></span>
                <span>01. CORRIDOR SELECTION HUB</span>
              </div>
              <h1 className="font-black text-3xl sm:text-5xl text-black dark:text-white tracking-tight uppercase">
                Search & Calibrate Flight Telemetry
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 font-mono">
                Query matching airline fares from PostgreSQL for your route and departure date
              </p>
            </div>

            {/* Flight Search Widget */}
            <FlightSearchWidget
              initialParams={searchParams}
              onSearch={handleSearch}
              airports={airports}
            />

            {fareQueryError && (
              <div role="alert" className="mt-4 border-2 border-red-700 bg-red-50 p-4 font-mono text-sm text-red-900 dark:bg-red-950 dark:text-red-100">
                <p className="font-black uppercase">Could not load PostgreSQL fare data</p>
                <p className="mt-1">{fareQueryError}</p>
                <p className="mt-1">Check that FastAPI is running and the Neon database has matching fares.</p>
              </div>
            )}

            {/* Ingestion Notes Card - Zero Hover Shift */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-6 border-2 border-black dark:border-white bg-white dark:bg-black text-black dark:text-white">
                <span className="font-mono font-black uppercase text-swiss-accent block mb-1 text-[11px]">
                  [ 01 // CORRIDORS ]
                </span>
                <span className="font-black text-black dark:text-white uppercase block mb-1 text-sm">
                  120+ Corridors Active
                </span>
                <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed font-mono">
                  Real-time tariff telemetry scraped across metro pairs and regional UDAN routes.
                </p>
              </div>

              <div className="p-6 border-2 border-black dark:border-white bg-white dark:bg-black text-black dark:text-white">
                <span className="font-mono font-black uppercase text-swiss-accent block mb-1 text-[11px]">
                  [ 02 // ENSEMBLE ML ]
                </span>
                <span className="font-black text-black dark:text-white uppercase block mb-1 text-sm">
                  LightGBM & XGBoost
                </span>
                <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed font-mono">
                  FastAPI service infers LightGBM & XGBoost fair value models in under 18ms.
                </p>
              </div>

              <div className="p-6 border-2 border-black dark:border-white bg-white dark:bg-black text-black dark:text-white">
                <span className="font-mono font-black uppercase text-swiss-accent block mb-1 text-[11px]">
                  [ 03 // STATISTICS ]
                </span>
                <span className="font-black text-black dark:text-white uppercase block mb-1 text-sm">
                  Conformal Confidence
                </span>
                <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed font-mono">
                  Calculated with 95% statistical coverage for robust Consumer Price Index augmentation.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ======================= VIEW: DASHBOARD ======================= */}
        {view === "dashboard" && (
          telemetry ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6 animate-in fade-in duration-200">
            
            {/* 1. Active Route Strip */}
            <ActiveRouteStrip
              telemetry={telemetry}
              onChangeFlight={() => navigateTo("search")}
            />

            {/* 2. 4 Telemetry KPI Cards */}
            <TelemetryKpiCards details={telemetry.details} />

            {/* 3. Row 1: 30-Day Fare Forecast Curve & 5-Stage Funnel */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7">
                <FareForecastCurve data={telemetry.forecastCurve} />
              </div>
              <div className="lg:col-span-5">
                <FlightPriceAnalysis
                  stages={telemetry.funnelStages}
                  predictedFare={telemetry.details.predictedFare}
                />
              </div>
            </div>

            {/* 4. Row 2: Route Map & What-If Simulator */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-6">
                <RouteMap
                  originAirport={telemetry.originAirport}
                  destinationAirport={telemetry.destinationAirport}
                  distanceKm={telemetry.details.distanceKm}
                  bearing={telemetry.bearing}
                />
              </div>
              <div className="lg:col-span-6">
                <WhatIfSimulator
                  baseFare={telemetry.details.predictedFare}
                  initialDaysAhead={telemetry.details.bookingWindowDays}
                  initialCabinClass={telemetry.params.cabin_class}
                />
              </div>
            </div>

            {/* 5. Airline Carrier Comparison */}
            <AirlineFareComparison
              airlines={telemetry.airlines}
              durationMinutes={telemetry.details.flightDurationMinutes}
              departureDate={telemetry.params.departure_date}
              originCode={telemetry.params.origin}
              destinationCode={telemetry.params.destination}
              predictionDetails={telemetry.details}
            />

          </div>
          ) : (
            <div className="max-w-3xl mx-auto px-4 py-16 text-center">
              <h1 className="font-black text-2xl uppercase">No database results loaded</h1>
              <p className="mt-3 font-mono text-sm text-neutral-600 dark:text-neutral-400">
                Search a route to query matching fare records from PostgreSQL.
              </p>
              <button
                type="button"
                onClick={() => navigateTo("search")}
                className="mt-6 border-2 border-black bg-black px-6 py-3 font-mono text-xs font-black uppercase text-white dark:border-white dark:bg-white dark:text-black"
              >
                Search database fares
              </button>
            </div>
          )
        )}

      </main>

      {/* Global Footer */}
      <Footer onNavigate={navigateTo} />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={user}
        onUserChange={setUser}
      />

    </div>
  )
}

export default App
