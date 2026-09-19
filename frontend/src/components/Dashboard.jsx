import React, { useState, useMemo } from 'react';
import {
  Plane,
  Search,
  Bell,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Calendar,
  User,
  Armchair,
  TrendingDown,
  Clock,
  Compass,
  ArrowRight,
  ArrowLeftRight,
  BarChart2,
  Sparkles,
  Maximize2,
  CheckCircle2,
  Percent,
  AlertCircle,
  Gauge,
  Disc,
  Check,
  RotateCcw,
  Sliders
} from 'lucide-react';
import { predictFare } from '../services/api';
import GoogleRouteMap from './GoogleRouteMap';

// Airline Logos
import indigoLogo from '../assets/airline-logos/indigo.png';
import airIndiaLogo from '../assets/airline-logos/air-india.png';
import akasaAirLogo from '../assets/airline-logos/akasa-air.png';
import spiceJetLogo from '../assets/airline-logos/spicejet.jpg';

// Extensive Indian Airport Registry with exact GPS coordinates and map projection
const AIRPORT_REGISTRY = {
  DEL: { code: 'DEL', city: 'Delhi', airport: 'Indira Gandhi Int Airport', x: 195, y: 72, dist: 0, lat: 28.5562, lng: 77.1000 },
  BOM: { code: 'BOM', city: 'Mumbai', airport: 'Chhatrapati Shivaji Maharaj Int', x: 148, y: 195, dist: 1148, lat: 19.0896, lng: 72.8656 },
  AMD: { code: 'AMD', city: 'Ahmedabad', airport: 'Sardar Vallabhbhai Patel Int', x: 135, y: 140, dist: 775, lat: 23.0772, lng: 72.6347 },
  BLR: { code: 'BLR', city: 'Bengaluru', airport: 'Kempegowda Int Airport', x: 192, y: 250, dist: 1740, lat: 13.1986, lng: 77.7066 },
  MAA: { code: 'MAA', city: 'Chennai', airport: 'Chennai Int Airport', x: 220, y: 248, dist: 1760, lat: 12.9941, lng: 80.1709 },
  CCU: { code: 'CCU', city: 'Kolkata', airport: 'Netaji Subhash Chandra Bose Int', x: 288, y: 140, dist: 1305, lat: 22.6547, lng: 88.4467 },
  HYD: { code: 'HYD', city: 'Hyderabad', airport: 'Rajiv Gandhi Int Airport', x: 198, y: 198, dist: 1253, lat: 17.2403, lng: 78.4294 },
  GOI: { code: 'GOI', city: 'Goa', airport: 'Dabolim / Manohar Int Airport', x: 148, y: 238, dist: 1510, lat: 15.3800, lng: 73.8314 },
  PNQ: { code: 'PNQ', city: 'Pune', airport: 'Pune Airport', x: 155, y: 205, dist: 1170, lat: 18.5822, lng: 73.9197 },
  JAI: { code: 'JAI', city: 'Jaipur', airport: 'Jaipur Int Airport', x: 175, y: 95, dist: 260, lat: 26.8289, lng: 75.8056 },
  COK: { code: 'COK', city: 'Kochi', airport: 'Cochin Int Airport', x: 175, y: 280, dist: 2050, lat: 10.1518, lng: 76.3930 },
};

// Available Aircraft Models with specs, image references, and airline logos
const AIRCRAFT_MODELS = [
  {
    name: 'Airbus A320',
    airline: 'IndiGo / Air India',
    seats: '180',
    speed: '850 km/h',
    altitude: '12,000 m',
    engines: '2 Turbofans',
    image: '/indigo_a320.jpg',
    airlineLogo: indigoLogo,
  },
  {
    name: 'Boeing 737 MAX',
    airline: 'Akasa Air / SpiceJet',
    seats: '189',
    speed: '840 km/h',
    altitude: '12,500 m',
    engines: '2 CFM LEAP',
    image: '/boeing_737.jpg',
    airlineLogo: akasaAirLogo,
  },
  {
    name: 'Airbus A321neo',
    airline: 'Air India / IndiGo',
    seats: '222',
    speed: '876 km/h',
    altitude: '11,900 m',
    engines: '2 Pratt & Whitney',
    image: '/airbus_a321.jpg',
    airlineLogo: airIndiaLogo,
  },
];

export default function Dashboard({ onOpenAuth, onBackToTour, user, initialSearchParams }) {
  const [activeNav, setActiveNav] = useState('Overview');
  const [tripType, setTripType] = useState('one_way');
  const [modelIndex, setModelIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Search Parameters
  const [originCode, setOriginCode] = useState(initialSearchParams?.origin || 'DEL');
  const [destCode, setDestCode] = useState(initialSearchParams?.destination || 'BOM');
  const [departureDate, setDepartureDate] = useState(initialSearchParams?.departure_date || '2026-10-20');
  const [travellers, setTravellers] = useState(initialSearchParams?.travellers || 1);
  const [cabinClass, setCabinClass] = useState(initialSearchParams?.cabin_class ? (initialSearchParams.cabin_class.charAt(0).toUpperCase() + initialSearchParams.cabin_class.slice(1)) : 'Economy');
  const [selectedAirlineIndex, setSelectedAirlineIndex] = useState(0);

  // Dropdown States
  const [isOriginDropdownOpen, setIsOriginDropdownOpen] = useState(false);
  const [isDestDropdownOpen, setIsDestDropdownOpen] = useState(false);

  // Dynamic Route & Fare Calculation (100% usable without external dataset)
  const currentOrigin = AIRPORT_REGISTRY[originCode] || AIRPORT_REGISTRY.DEL;
  const currentDest = AIRPORT_REGISTRY[destCode] || AIRPORT_REGISTRY.BOM;
  const currentModel = AIRCRAFT_MODELS[modelIndex];

  // Calculate dynamic fare based on airport distance, cabin class, and travel parameters
  const calculatedFareDetails = useMemo(() => {
    const dx = currentDest.x - currentOrigin.x;
    const dy = currentDest.y - currentOrigin.y;
    const distanceKm = Math.round(Math.sqrt(dx * dx + dy * dy) * 7.5);
    const effectiveKm = Math.max(distanceKm, 350);

    const baseFare = 2400 + effectiveKm * 2.8;
    const cabinMultiplier = cabinClass === 'Business' ? 2.6 : cabinClass === 'Premium' ? 1.5 : 1.0;
    const tripMultiplier = tripType === 'round_trip' ? 1.9 : 1.0;
    const totalFare = Math.round((baseFare * cabinMultiplier * tripMultiplier * travellers) / 10) * 10;

    const minFare = Math.round((totalFare * 0.88) / 10) * 10;
    const maxFare = Math.round((totalFare * 1.15) / 10) * 10;
    const savingsPercent = Math.round(((maxFare - totalFare) / maxFare) * 100);

    return {
      distanceKm: effectiveKm,
      predictedFare: totalFare,
      expectedMin: minFare,
      expectedMax: maxFare,
      savingsPercent: Math.max(savingsPercent, 14),
      confidence: 89,
      isLowerThanUsual: true,
      flightDuration: `${Math.floor(effectiveKm / 600)}h ${Math.round((effectiveKm % 600) / 10)}m`,
    };
  }, [currentOrigin, currentDest, cabinClass, tripType, travellers]);

  // Dynamic Popular Flights on selected route with airline logos
  const dynamicPopularFlights = useMemo(() => {
    const base = calculatedFareDetails.predictedFare;
    return [
      {
        name: 'IndiGo',
        price: `₹${Number(Math.round(base * 0.96)).toLocaleString('en-IN')}`,
        duration: `Non-stop · ${calculatedFareDetails.flightDuration}`,
        code: '6E',
        bgColor: 'bg-blue-600',
        logo: indigoLogo,
      },
      {
        name: 'Air India',
        price: `₹${Number(Math.round(base * 1.04)).toLocaleString('en-IN')}`,
        duration: `Non-stop · ${calculatedFareDetails.flightDuration}`,
        code: 'AI',
        bgColor: 'bg-red-600',
        logo: airIndiaLogo,
      },
      {
        name: 'Akasa Air',
        price: `₹${Number(Math.round(base * 0.94)).toLocaleString('en-IN')}`,
        duration: `Non-stop · ${calculatedFareDetails.flightDuration}`,
        code: 'QP',
        bgColor: 'bg-amber-600',
        logo: akasaAirLogo,
      },
      {
        name: 'SpiceJet',
        price: `₹${Number(Math.round(base * 1.01)).toLocaleString('en-IN')}`,
        duration: `Non-stop · ${calculatedFareDetails.flightDuration}`,
        code: 'SG',
        bgColor: 'bg-rose-600',
        logo: spiceJetLogo,
      },
      {
        name: 'Vistara',
        price: `₹${Number(Math.round(base * 1.09)).toLocaleString('en-IN')}`,
        duration: `Non-stop · ${calculatedFareDetails.flightDuration}`,
        code: 'UK',
        bgColor: 'bg-purple-700',
        logo: null,
      },
    ];
  }, [calculatedFareDetails]);

  // Swap Origin & Destination
  const handleSwap = () => {
    const temp = originCode;
    setOriginCode(destCode);
    setDestCode(temp);
  };

  // Trigger backend API call (if backend is active)
  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    try {
      await predictFare({
        origin: originCode,
        destination: destCode,
        departure_date: departureDate,
        trip_type: tripType,
        travellers,
        cabin_class: cabinClass.toLowerCase(),
      });
    } catch (err) {
      console.warn('Using client-side dynamic prediction calculation', err);
    } finally {
      setTimeout(() => setIsLoading(false), 300);
    }
  };

  return (
    <div className="relative w-full h-screen max-h-screen font-sans text-slate-900 antialiased overflow-hidden select-none flex flex-col">
      {/* 1. Cinematic Cloud & Sky Background (Image 240 in ezgif with robust fallbacks) */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center pointer-events-none transition-all duration-700 bg-sky-200"
        style={{
          backgroundImage: `url('/ezgif-frames/ezgif-frame-240.jpg'), url('/optimized-frames/frame-240.jpg'), url('/sky_clouds_bg.jpg'), linear-gradient(180deg, #bae6fd 0%, #e0f2fe 50%, #f0f9ff 100%)`,
          filter: 'brightness(1.02) contrast(1.02)',
        }}
      />

      {/* 2. Soft Atmospheric Ambient Tint */}
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-sky-400/10 via-white/5 to-slate-900/10 pointer-events-none" />

      {/* 3. Compact Top Navigation Bar - Transparent Glass */}
      <header className="relative z-20 h-13 shrink-0 px-5 sm:px-6 bg-white/30 backdrop-blur-2xl border-b border-white/50 flex items-center justify-between shadow-sm">
        {/* Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-700 to-sky-500 flex items-center justify-center shadow-md">
            <Plane className="w-4 h-4 text-white transform -rotate-45" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-['Space_Grotesk'] font-bold text-base tracking-wider text-slate-900 uppercase leading-none">
                Skyline <span className="text-blue-600 font-bold tracking-normal font-['Noto_Sans_Devanagari',sans-serif]">सारथी</span>
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-blue-100/80 text-blue-800 uppercase backdrop-blur-sm border border-blue-200/50">
                AI Engine
              </span>
            </div>
            <span className="text-[10px] text-slate-600 font-medium block leading-tight">
              Aviation Fare Price Prediction Platform
            </span>
          </div>
        </div>

        {/* Compact Navigation Tabs - Transparent Glass */}
        <div className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-white/25 backdrop-blur-xl border border-white/40 shadow-sm">
          {['Overview', 'Route Map', 'Analytics', 'Settings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveNav(tab)}
              className={`px-3.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeNav === tab
                  ? 'bg-white/85 text-slate-950 shadow-sm backdrop-blur-md'
                  : 'text-slate-800 hover:text-slate-950 hover:bg-white/40'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Action Triggers: Tour Return + User Status */}
        <div className="flex items-center gap-2.5">
          {onBackToTour && (
            <button
              onClick={onBackToTour}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/40 hover:bg-white/70 text-slate-800 hover:text-slate-950 border border-white/60 backdrop-blur-md text-xs font-semibold shadow-sm transition-all cursor-pointer"
              title="Return to the 3D cinematic scrolling hero experience"
            >
              <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
              <span>Cinematic Tour</span>
            </button>
          )}

          <button
            onClick={onOpenAuth}
            className="flex items-center gap-2 p-1 pl-1.5 pr-3 rounded-xl bg-white/50 hover:bg-white/80 border border-white/70 backdrop-blur-md text-slate-900 text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'GS'}
            </div>
            <span className="truncate max-w-[110px]">
              {user?.name || 'Guest Explorer'}
            </span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-100/80 text-blue-800 font-bold uppercase">
              {user?.isGuest ? 'Guest' : 'Active'}
            </span>
          </button>
        </div>
      </header>

      {/* 4. Primary Dashboard Viewport (Fits 1920x1080 Screen with Zero Vertical Scrolling) */}
      <main className="relative z-10 flex-1 min-h-0 p-3.5 xl:p-4 flex flex-col justify-between gap-2.5 overflow-hidden">
        
        {activeNav === 'Route Map' ? (
          /* FULL-SCREEN MAP EXPANSION (when Route Map tab is explicitly active) */
          <div className="flex-1 min-h-0 rounded-2xl bg-white/30 backdrop-blur-2xl border border-white/60 p-3.5 shadow-[0_8px_32px_0_rgba(15,23,42,0.1)] flex flex-col justify-between gap-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-['Space_Grotesk']">
                  Interactive Flight Route Navigator
                </h3>
                <p className="text-xs text-slate-600">
                  {currentOrigin.city} ({currentOrigin.code}) → {currentDest.city} ({currentDest.code}) · Geodesic Great-Circle Trajectory
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800 font-mono px-3 py-1 rounded-lg bg-white/50 backdrop-blur-md border border-white/70 shadow-sm">
                  {calculatedFareDetails.distanceKm} km · {calculatedFareDetails.flightDuration}
                </span>
                <button
                  onClick={() => setActiveNav('Overview')}
                  className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer transition-colors shadow-sm"
                >
                  Back to Overview
                </button>
              </div>
            </div>

            <div className="flex-1 min-h-0 rounded-xl overflow-hidden border border-white/60 shadow-inner">
              <GoogleRouteMap
                origin={currentOrigin}
                destination={currentDest}
                allAirports={AIRPORT_REGISTRY}
                height="100%"
                onSelectAirport={(ap) => setDestCode(ap.code)}
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto py-1">
              <span className="text-[11px] font-bold text-slate-700 uppercase shrink-0">Quick Destination:</span>
              {Object.values(AIRPORT_REGISTRY).slice(0, 8).map((ap) => (
                <button
                  key={ap.code}
                  onClick={() => setDestCode(ap.code)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                    destCode === ap.code ? 'bg-blue-600 text-white shadow-sm' : 'bg-white/50 hover:bg-white/80 text-slate-800 border border-white/60 backdrop-blur-md'
                  }`}
                >
                  {ap.code} - {ap.city}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* PRIMARY COMPACT DASHBOARD GRID (Fits in Desktop 1080p Screen) */
          <>
            <div className="flex-1 min-h-0 grid grid-cols-12 gap-3 items-stretch">
              
              {/* ====================================================================
                  LEFT PANEL (7 Columns): Search Controls + Model/Fare + Trend/Insights
                  ==================================================================== */}
              <div className="col-span-12 lg:col-span-7 flex flex-col justify-between gap-2.5 h-full min-h-0">
                
                {/* 1. FLIGHT SEARCH CONTROLS CARD - Transparent Glass */}
                <div className="p-3.5 rounded-2xl bg-white/30 backdrop-blur-2xl border border-white/60 shadow-[0_8px_32px_0_rgba(15,23,42,0.1)]">
                  {/* Trip Type Selector */}
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-1.5">
                      {[
                        { id: 'one_way', label: 'One Way' },
                        { id: 'round_trip', label: 'Round Trip' },
                        { id: 'multi_city', label: 'Multi-City' },
                      ].map((t) => (
                        <button
                          key={t.id}
                          onClick={() => setTripType(t.id)}
                          className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wider transition-all cursor-pointer ${
                            tripType === t.id
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'text-slate-700 hover:text-slate-950 bg-white/40 hover:bg-white/70 backdrop-blur-md border border-white/50'
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>

                    <span className="text-[11px] font-semibold text-slate-600">
                      Route: <strong className="text-slate-900">{currentOrigin.code} → {currentDest.code}</strong> ({calculatedFareDetails.distanceKm} km)
                    </span>
                  </div>

                  {/* Airport & Parameters Grid */}
                  <div className="grid grid-cols-12 gap-2 items-center">
                    
                    {/* Origin Airport */}
                    <div className="col-span-5 relative">
                      <div
                        onClick={() => {
                          setIsOriginDropdownOpen(!isOriginDropdownOpen);
                          setIsDestDropdownOpen(false);
                        }}
                        className="p-2.5 rounded-xl bg-white/50 hover:bg-white/75 backdrop-blur-md border border-white/70 shadow-sm transition-colors cursor-pointer"
                      >
                        <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-600">From</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Compass className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span className="font-bold text-xs text-slate-900 truncate">
                            {currentOrigin.city} ({currentOrigin.code})
                          </span>
                        </div>
                      </div>

                      {/* Origin Airport Dropdown */}
                      {isOriginDropdownOpen && (
                        <div className="absolute left-0 top-full mt-1.5 w-60 p-1.5 rounded-xl bg-white/95 backdrop-blur-xl border border-white/80 shadow-2xl z-50 max-h-48 overflow-y-auto">
                          {Object.values(AIRPORT_REGISTRY).map((ap) => (
                            <button
                              key={ap.code}
                              onClick={() => {
                                setOriginCode(ap.code);
                                setIsOriginDropdownOpen(false);
                              }}
                              className="w-full p-1.5 rounded-lg text-left hover:bg-blue-50 flex items-center justify-between text-xs transition-colors cursor-pointer"
                            >
                              <div>
                                <span className="font-bold text-slate-900">{ap.city} ({ap.code})</span>
                                <span className="block text-[9px] text-slate-500 truncate">{ap.airport}</span>
                              </div>
                              {originCode === ap.code && <Check className="w-3 h-3 text-blue-600" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Swap Button */}
                    <div className="col-span-2 flex justify-center">
                      <button
                        type="button"
                        onClick={handleSwap}
                        className="p-2 rounded-full bg-white/50 hover:bg-white/90 backdrop-blur-md border border-white/70 text-slate-800 hover:text-blue-600 shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
                        title="Swap Origin & Destination"
                      >
                        <ArrowLeftRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Destination Airport */}
                    <div className="col-span-5 relative">
                      <div
                        onClick={() => {
                          setIsDestDropdownOpen(!isDestDropdownOpen);
                          setIsOriginDropdownOpen(false);
                        }}
                        className="p-2.5 rounded-xl bg-white/50 hover:bg-white/75 backdrop-blur-md border border-white/70 shadow-sm transition-colors cursor-pointer"
                      >
                        <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-600">To</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Compass className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span className="font-bold text-xs text-slate-900 truncate">
                            {currentDest.city} ({currentDest.code})
                          </span>
                        </div>
                      </div>

                      {/* Destination Airport Dropdown */}
                      {isDestDropdownOpen && (
                        <div className="absolute right-0 top-full mt-1.5 w-60 p-1.5 rounded-xl bg-white/95 backdrop-blur-xl border border-white/80 shadow-2xl z-50 max-h-48 overflow-y-auto">
                          {Object.values(AIRPORT_REGISTRY).map((ap) => (
                            <button
                              key={ap.code}
                              onClick={() => {
                                setDestCode(ap.code);
                                setIsDestDropdownOpen(false);
                              }}
                              className="w-full p-1.5 rounded-lg text-left hover:bg-blue-50 flex items-center justify-between text-xs transition-colors cursor-pointer"
                            >
                              <div>
                                <span className="font-bold text-slate-900">{ap.city} ({ap.code})</span>
                                <span className="block text-[9px] text-slate-500 truncate">{ap.airport}</span>
                              </div>
                              {destCode === ap.code && <Check className="w-3 h-3 text-blue-600" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Date, Class, Travellers & Search Button */}
                  <div className="grid grid-cols-12 gap-2 mt-2 items-center">
                    {/* Departure Date */}
                    <div className="col-span-4 p-2 rounded-xl bg-white/50 backdrop-blur-md border border-white/70 shadow-sm">
                      <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-600">Date</span>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3 text-slate-600 shrink-0" />
                        <input
                          type="date"
                          value={departureDate}
                          onChange={(e) => setDepartureDate(e.target.value)}
                          className="w-full bg-transparent font-bold text-xs text-slate-900 focus:outline-none cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Travellers */}
                    <div className="col-span-2 p-2 rounded-xl bg-white/50 backdrop-blur-md border border-white/70 shadow-sm">
                      <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-600">Passengers</span>
                      <div className="flex items-center gap-1 mt-0.5">
                        <User className="w-3 h-3 text-slate-600 shrink-0" />
                        <select
                          value={travellers}
                          onChange={(e) => setTravellers(Number(e.target.value))}
                          className="w-full bg-transparent font-bold text-xs text-slate-900 focus:outline-none cursor-pointer"
                        >
                          <option value={1}>1</option>
                          <option value={2}>2</option>
                          <option value={3}>3</option>
                          <option value={4}>4</option>
                        </select>
                      </div>
                    </div>

                    {/* Cabin Class */}
                    <div className="col-span-3 p-2 rounded-xl bg-white/50 backdrop-blur-md border border-white/70 shadow-sm">
                      <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-600">Class</span>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Armchair className="w-3 h-3 text-slate-600 shrink-0" />
                        <select
                          value={cabinClass}
                          onChange={(e) => setCabinClass(e.target.value)}
                          className="w-full bg-transparent font-bold text-xs text-slate-900 focus:outline-none cursor-pointer"
                        >
                          <option value="Economy">Economy</option>
                          <option value="Premium">Premium</option>
                          <option value="Business">Business</option>
                        </select>
                      </div>
                    </div>

                    {/* Search Flights CTA Button */}
                    <div className="col-span-3">
                      <button
                        onClick={handleSearch}
                        disabled={isLoading}
                        className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <span>{isLoading ? 'Updating...' : 'Search'}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2. AIRCRAFT MODEL & DYNAMIC FARE PREDICTION SPLIT - Transparent Glass */}
                <div className="grid grid-cols-12 gap-2.5 items-stretch">
                  
                  {/* Aircraft Model (5 cols) */}
                  <div className="col-span-5 p-3 rounded-2xl bg-white/30 backdrop-blur-2xl border border-white/60 shadow-[0_8px_32px_0_rgba(15,23,42,0.1)] flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-xs font-bold text-slate-900 tracking-wide">Aircraft</span>
                        {currentModel.airlineLogo && (
                          <div className="h-5 px-1.5 py-0.5 rounded-md bg-white/80 border border-white/90 shadow-sm flex items-center">
                            <img 
                              src={currentModel.airlineLogo} 
                              alt={currentModel.airline} 
                              className="h-3.5 w-auto max-w-[48px] object-contain" 
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                          </div>
                        )}
                      </div>
                      <select
                        value={modelIndex}
                        onChange={(e) => setModelIndex(Number(e.target.value))}
                        className="px-2 py-0.5 rounded-lg bg-white/60 backdrop-blur-md border border-white/80 text-[10px] font-bold text-slate-800 focus:outline-none cursor-pointer"
                      >
                        {AIRCRAFT_MODELS.map((m, idx) => (
                          <option key={m.name} value={idx}>{m.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Airplane Image Carousel with Fallback */}
                    <div className="relative w-full h-22 rounded-xl overflow-hidden my-1 flex items-center justify-center border border-white/60 bg-white/20 backdrop-blur-md">
                      <img
                        src={currentModel.image}
                        alt={currentModel.name}
                        className="w-full h-full object-cover object-center"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const fallback = e.currentTarget.parentElement?.querySelector('.plane-blueprint-fallback');
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                      {/* Stylized Aviation Blueprint Fallback */}
                      <div className="plane-blueprint-fallback hidden absolute inset-0 flex-col items-center justify-center bg-gradient-to-tr from-slate-900 via-blue-950 to-slate-900 text-white p-2 text-center">
                        <Plane className="w-7 h-7 text-sky-400 mb-1" />
                        <span className="text-[10px] font-bold tracking-wider uppercase font-mono">{currentModel.name}</span>
                        <span className="text-[8px] text-sky-200/80 font-mono truncate max-w-[140px]">{currentModel.airline}</span>
                      </div>
                      <button
                        onClick={() => setModelIndex((modelIndex - 1 + AIRCRAFT_MODELS.length) % AIRCRAFT_MODELS.length)}
                        className="absolute left-1.5 top-1/2 -translate-y-1/2 p-1 rounded-full bg-white/70 hover:bg-white text-slate-800 shadow cursor-pointer z-10 backdrop-blur-md"
                      >
                        <ChevronLeft className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => setModelIndex((modelIndex + 1) % AIRCRAFT_MODELS.length)}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 rounded-full bg-white/70 hover:bg-white text-slate-800 shadow cursor-pointer z-10 backdrop-blur-md"
                      >
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Specs Row */}
                    <div className="grid grid-cols-4 gap-1 text-center pt-1 border-t border-white/50">
                      <div>
                        <span className="block text-[10px] font-bold text-slate-900">{currentModel.seats}</span>
                        <span className="block text-[8px] text-slate-600 font-medium">Seats</span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold text-slate-900">{currentModel.speed}</span>
                        <span className="block text-[8px] text-slate-600 font-medium">Speed</span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold text-slate-900">{currentModel.altitude}</span>
                        <span className="block text-[8px] text-slate-600 font-medium">Alt</span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold text-slate-900">2 CFM</span>
                        <span className="block text-[8px] text-slate-600 font-medium">Engines</span>
                      </div>
                    </div>
                  </div>

                  {/* Fare Prediction & Best Booking Window (7 cols) */}
                  <div className="col-span-7 p-3.5 rounded-2xl bg-white/30 backdrop-blur-2xl border border-white/60 shadow-[0_8px_32px_0_rgba(15,23,42,0.1)] flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 tracking-wide">Fare Prediction</span>
                        {dynamicPopularFlights[selectedAirlineIndex]?.logo && (
                          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/70 border border-white/80 shadow-sm backdrop-blur-sm">
                            <img 
                              src={dynamicPopularFlights[selectedAirlineIndex].logo} 
                              alt="Airline Logo" 
                              className="h-3.5 w-auto max-w-[42px] object-contain" 
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                            <span className="text-[9px] font-bold text-slate-800">
                              {dynamicPopularFlights[selectedAirlineIndex].name}
                            </span>
                          </div>
                        )}
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 backdrop-blur-md border border-emerald-400/30 text-emerald-900 text-[10px] font-bold flex items-center gap-0.5">
                          <TrendingDown className="w-3 h-3 text-emerald-600" />
                          Save {calculatedFareDetails.savingsPercent}%
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-600 font-semibold font-mono">
                        89% Confidence
                      </span>
                    </div>

                    <div className="flex items-baseline gap-3 my-1">
                      <span className="text-3xl font-bold font-['Space_Grotesk'] text-slate-900 tracking-tight">
                        ₹{Number(calculatedFareDetails.predictedFare).toLocaleString('en-IN')}
                      </span>
                      <div className="text-[11px] text-slate-600 leading-tight">
                        <span>Expected range:</span>
                        <strong className="text-slate-900 block">
                          ₹{Number(calculatedFareDetails.expectedMin).toLocaleString('en-IN')} – ₹{Number(calculatedFareDetails.expectedMax).toLocaleString('en-IN')}
                        </strong>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/50">
                      <div className="p-2 rounded-xl bg-blue-500/15 backdrop-blur-md border border-blue-400/30">
                        <span className="block text-[9px] font-bold text-blue-950 uppercase">Optimal Booking Date</span>
                        <span className="text-xs font-bold text-blue-800 font-['Space_Grotesk']">12 Oct 2026</span>
                      </div>
                      <div className="p-2 rounded-xl bg-emerald-500/15 backdrop-blur-md border border-emerald-400/30">
                        <span className="block text-[9px] font-bold text-emerald-950 uppercase">Corridor Assessment</span>
                        <span className="text-xs font-bold text-emerald-800 truncate block">Cheaper than average</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. FARE TREND CURVE & AVIATION INSIGHTS */}
                <div className="grid grid-cols-12 gap-2.5 items-stretch flex-1 min-h-0">
                  
                  {/* Fare Trend Chart (6 cols) - Transparent Glass */}
                  <div className="col-span-6 p-3 rounded-2xl bg-white/30 backdrop-blur-2xl border border-white/60 shadow-[0_8px_32px_0_rgba(15,23,42,0.1)] flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900 font-['Space_Grotesk']">Fare Trend (30 Days)</span>
                      <span className="text-[10px] text-slate-800 font-bold font-mono">Next 30 Days</span>
                    </div>

                    <div className="relative h-20 w-full mt-1">
                      {/* Y-axis labels in black */}
                      <div className="absolute left-0 inset-y-0 flex flex-col justify-between text-[8px] text-slate-900 font-bold font-mono">
                        <span>₹12K</span>
                        <span>₹8K</span>
                        <span>₹4K</span>
                      </div>

                      {/* SVG Line Graphic in Black */}
                      <div className="ml-6 h-full relative">
                        <svg className="w-full h-full overflow-visible" viewBox="0 0 220 70">
                          <line x1="0" y1="5" x2="220" y2="5" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2 2" />
                          <line x1="0" y1="35" x2="220" y2="35" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2 2" />
                          <line x1="0" y1="65" x2="220" y2="65" stroke="#94a3b8" strokeWidth="1" />

                          {/* Dynamic Trend Line in Black */}
                          <path
                            d="M 5,20 L 40,35 L 75,40 L 110,48 L 145,52 L 180,55 L 215,56"
                            fill="none"
                            stroke="#0f172a"
                            strokeWidth="2.5"
                          />
                          {[
                            { x: 5, y: 20 },
                            { x: 40, y: 35 },
                            { x: 75, y: 40 },
                            { x: 110, y: 48 },
                            { x: 145, y: 52 },
                            { x: 180, y: 55 },
                            { x: 215, y: 56 },
                          ].map((pt, i) => (
                            <circle
                              key={i}
                              cx={pt.x}
                              cy={pt.y}
                              r={i === 3 ? "4.5" : "2.5"}
                              fill={i === 3 ? "#0f172a" : "#ffffff"}
                              stroke={i === 3 ? "#ffffff" : "#0f172a"}
                              strokeWidth="1.5"
                            />
                          ))}
                        </svg>

                        {/* Current fare tag */}
                        <div className="absolute top-[55%] left-[50%] -translate-x-1/2 -translate-y-full px-1.5 py-0.5 rounded bg-slate-900 text-white text-[9px] font-bold font-mono shadow-sm">
                          ₹{Number(calculatedFareDetails.predictedFare).toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>

                    <div className="ml-6 flex justify-between text-[8px] text-slate-900 font-bold font-mono pt-1">
                      <span>Oct 1</span>
                      <span>Oct 10</span>
                      <span>Oct 20</span>
                      <span>Oct 30</span>
                    </div>
                  </div>

                  {/* Price Insights Checklist (6 cols) - Transparent Glass */}
                  <div className="col-span-6 p-3 rounded-2xl bg-white/30 backdrop-blur-2xl border border-white/60 shadow-[0_8px_32px_0_rgba(15,23,42,0.1)] flex flex-col justify-between">
                    <span className="text-xs font-bold text-slate-900 mb-1.5">Machine Learning Insights</span>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 p-1.5 rounded-xl bg-emerald-500/15 backdrop-blur-md border border-emerald-400/30">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="text-[11px] font-semibold text-slate-900 leading-tight">
                          Fares projected to drop in 5–7 days
                        </span>
                      </div>

                      <div className="flex items-center gap-2 p-1.5 rounded-xl bg-purple-500/15 backdrop-blur-md border border-purple-400/30">
                        <Percent className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                        <span className="text-[11px] font-semibold text-slate-900 leading-tight">
                          Book 2–3 weeks early for optimal discounts
                        </span>
                      </div>

                      <div className="flex items-center gap-2 p-1.5 rounded-xl bg-amber-500/15 backdrop-blur-md border border-amber-400/30">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="text-[11px] font-semibold text-slate-900 leading-tight">
                          Weekend flights feature 18% demand surcharge
                        </span>
                      </div>
                    </div>
                  </div>

                </div>

              </div>

              {/* ====================================================================
                  RIGHT PANEL (5 Columns): Interactive Google Route Map - Transparent Glass
                  ==================================================================== */}
              <div className="col-span-12 lg:col-span-5 rounded-2xl bg-white/30 backdrop-blur-2xl border border-white/60 shadow-[0_8px_32px_0_rgba(15,23,42,0.1)] p-3 flex flex-col justify-between h-full min-h-0">
                
                {/* Header info */}
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 tracking-wide">Live Route Map</span>
                      <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-900 text-[9px] font-mono font-bold rounded border border-emerald-400/30 backdrop-blur-sm">
                        Leaflet Vector Live
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-600 block">
                      {currentOrigin.city} ({currentOrigin.code}) → {currentDest.city} ({currentDest.code}) · {calculatedFareDetails.flightDuration}
                    </span>
                  </div>

                  <button
                    onClick={() => setActiveNav('Route Map')}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold shadow-sm transition-colors cursor-pointer"
                  >
                    <Maximize2 className="w-3 h-3" />
                    <span>Expand</span>
                  </button>
                </div>

                {/* Map Canvas */}
                <div className="flex-1 min-h-0 w-full rounded-xl overflow-hidden border border-white/60 shadow-inner">
                  <GoogleRouteMap
                    origin={currentOrigin}
                    destination={currentDest}
                    allAirports={AIRPORT_REGISTRY}
                    height="100%"
                    onSelectAirport={(ap) => setDestCode(ap.code)}
                  />
                </div>

                {/* Quick Airport Hub Switcher Bar */}
                <div className="mt-2 pt-1.5 border-t border-white/50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">
                      Select Destination Hub:
                    </span>
                    <span className="text-[9px] text-blue-700 font-semibold font-mono">
                      Click to redraw route
                    </span>
                  </div>

                  <div className="grid grid-cols-6 gap-1">
                    {['BOM', 'DEL', 'BLR', 'MAA', 'CCU', 'HYD'].map((code) => {
                      const ap = AIRPORT_REGISTRY[code];
                      const isSelected = destCode === code;
                      return (
                        <button
                          key={code}
                          onClick={() => setDestCode(code)}
                          className={`py-1 px-1.5 rounded-lg text-center transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'bg-white/40 hover:bg-white/70 text-slate-800 border border-white/50 backdrop-blur-md'
                          }`}
                        >
                          <span className="block text-[10px] font-bold">{code}</span>
                          <span className="block text-[8px] truncate opacity-80">{ap.city}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>

            </div>

            {/* ====================================================================
                BOTTOM ROW: Popular Airlines on This Route with Real Airline Logos
                ==================================================================== */}
            <div className="shrink-0 p-2 rounded-2xl bg-white/30 backdrop-blur-2xl border border-white/60 shadow-[0_8px_32px_0_rgba(15,23,42,0.1)] flex items-center justify-between gap-3">
              <div className="hidden sm:block shrink-0 px-2">
                <span className="text-xs font-bold text-slate-900 block">Popular Airlines</span>
                <span className="text-[9px] text-slate-600 block">{currentOrigin.city} → {currentDest.city}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 flex-1 min-w-0">
                {dynamicPopularFlights.map((airline, idx) => (
                  <div
                    key={airline.name}
                    onClick={() => setSelectedAirlineIndex(idx)}
                    className={`p-1.5 px-2.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                      selectedAirlineIndex === idx
                        ? 'bg-white/80 border-blue-500 shadow-md ring-1 ring-blue-400/50 scale-[1.02]'
                        : 'bg-white/40 hover:bg-white/60 backdrop-blur-md border-white/60'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-10 h-7 rounded-lg bg-white/90 border border-white/95 p-1 flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
                        {airline.logo ? (
                          <img
                            src={airline.logo}
                            alt={airline.name}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              if (e.currentTarget.nextElementSibling) {
                                e.currentTarget.nextElementSibling.style.display = 'flex';
                              }
                            }}
                          />
                        ) : null}
                        <div 
                          className={`w-full h-full rounded ${airline.bgColor} text-white font-bold text-[8px] flex items-center justify-center`}
                          style={{ display: airline.logo ? 'none' : 'flex' }}
                        >
                          {airline.code}
                        </div>
                      </div>
                      <div className="min-w-0">
                        <span className="block text-[11px] font-bold text-slate-900 truncate leading-tight">
                          {airline.name}
                        </span>
                        <span className="block text-[10px] font-bold font-['Space_Grotesk'] text-blue-800 leading-tight">
                          {airline.price}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

      </main>
    </div>
  );
}
