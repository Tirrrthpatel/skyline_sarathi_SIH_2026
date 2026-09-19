import React, { useState } from 'react';
import { Plane, Calendar, Clock, Award, TrendingDown, Info, RefreshCw, CheckCircle2, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { INDIAN_AIRPORTS, AIRLINES, predictAirfare } from '../data/routesData';

export default function PredictionTerminal() {
  const [origin, setOrigin] = useState('DEL');
  const [destination, setDestination] = useState('BOM');
  const [airlineId, setAirlineId] = useState('indigo');
  const [daysInAdvance, setDaysInAdvance] = useState(14);
  const [departureTimeSlot, setDepartureTimeSlot] = useState('morning');
  const [cabinClass, setCabinClass] = useState('economy');

  const [isCalculating, setIsCalculating] = useState(false);
  const [prediction, setPrediction] = useState(() =>
    predictAirfare({
      origin: 'DEL',
      destination: 'BOM',
      airlineId: 'indigo',
      daysInAdvance: 14,
      departureTimeSlot: 'morning',
      cabinClass: 'economy'
    })
  );

  const handlePredict = (e) => {
    e.preventDefault();
    if (origin === destination) {
      alert('Origin and Destination airports must be different.');
      return;
    }

    setIsCalculating(true);
    setTimeout(() => {
      const res = predictAirfare({
        origin,
        destination,
        airlineId,
        daysInAdvance,
        departureTimeSlot,
        cabinClass
      });
      setPrediction(res);
      setIsCalculating(false);

      // Trigger celebratory micro-confetti in aviation blue colors
      confetti({
        particleCount: 40,
        spread: 55,
        origin: { y: 0.8 },
        colors: ['#074E8D', '#2D74B4', '#5691C8', '#88B3DC', '#C2C9D7']
      });
    }, 450);
  };

  const handleSwapAirports = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  return (
    <section id="prediction" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 pb-6 border-b border-aircraft-silver/60">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono-avionics text-aviation-blue-sky font-semibold mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>LIVE INTERACTIVE INFERENCE // REST API: /api/predict</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-aviation-blue tracking-tight">
            AIRFARE PRICE PREDICTOR
          </h2>
        </div>
        <p className="mt-4 md:mt-0 max-w-md text-xs sm:text-sm text-aviation-blue/80 font-mono-avionics leading-relaxed">
          Query our trained machine learning model in real-time. Test how advance booking horizons, route distances, and carrier yield curves impact fares.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-6 p-6 sm:p-8 rounded-2xl bg-white border border-aircraft-silver shadow-aviation-subtle space-y-6">
          <form onSubmit={handlePredict} className="space-y-5">
            
            {/* Origin & Destination Row with Swap Button */}
            <div className="grid grid-cols-1 sm:grid-cols-11 gap-2 items-center">
              {/* Origin */}
              <div className="sm:col-span-5">
                <label className="block text-[10px] font-mono-avionics uppercase text-aviation-blue-sky font-bold mb-1.5">
                  Origin Airport
                </label>
                <select
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-aviation-surface/70 border border-aircraft-silver text-aviation-blue text-xs font-mono-avionics font-semibold focus:ring-2 focus:ring-aviation-blue/20 outline-none"
                >
                  {INDIAN_AIRPORTS.map((apt) => (
                    <option key={apt.code} value={apt.code} disabled={apt.code === destination}>
                      {apt.code} — {apt.city}
                    </option>
                  ))}
                </select>
              </div>

              {/* Swap Button */}
              <div className="sm:col-span-1 flex justify-center pt-4">
                <button
                  type="button"
                  onClick={handleSwapAirports}
                  title="Swap Origin & Destination"
                  className="p-2 rounded-lg bg-aviation-surface hover:bg-aviation-blue-light/30 text-aviation-blue transition-colors border border-aircraft-silver"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Destination */}
              <div className="sm:col-span-5">
                <label className="block text-[10px] font-mono-avionics uppercase text-aviation-blue-sky font-bold mb-1.5">
                  Destination Airport
                </label>
                <select
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-aviation-surface/70 border border-aircraft-silver text-aviation-blue text-xs font-mono-avionics font-semibold focus:ring-2 focus:ring-aviation-blue/20 outline-none"
                >
                  {INDIAN_AIRPORTS.map((apt) => (
                    <option key={apt.code} value={apt.code} disabled={apt.code === origin}>
                      {apt.code} — {apt.city}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Airline & Cabin Class Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-mono-avionics uppercase text-aviation-blue-sky font-bold mb-1.5">
                  Airline Carrier
                </label>
                <select
                  value={airlineId}
                  onChange={(e) => setAirlineId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-aviation-surface/70 border border-aircraft-silver text-aviation-blue text-xs font-mono-avionics font-semibold focus:ring-2 focus:ring-aviation-blue/20 outline-none"
                >
                  {AIRLINES.map((air) => (
                    <option key={air.id} value={air.id}>
                      {air.name} ({air.code}) - {air.marketShare}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono-avionics uppercase text-aviation-blue-sky font-bold mb-1.5">
                  Cabin Class
                </label>
                <select
                  value={cabinClass}
                  onChange={(e) => setCabinClass(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-aviation-surface/70 border border-aircraft-silver text-aviation-blue text-xs font-mono-avionics font-semibold focus:ring-2 focus:ring-aviation-blue/20 outline-none"
                >
                  <option value="economy">Economy Standard</option>
                  <option value="premium_economy">Premium Economy</option>
                  <option value="business">Business Club</option>
                </select>
              </div>
            </div>

            {/* Advance Booking Horizon Slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[10px] font-mono-avionics uppercase text-aviation-blue-sky font-bold">
                  Days in Advance (Booking Window)
                </label>
                <span className="px-2.5 py-0.5 rounded bg-aviation-blue text-white text-xs font-mono-avionics font-bold">
                  {daysInAdvance} {daysInAdvance === 1 ? 'Day' : 'Days'} Out
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="90"
                value={daysInAdvance}
                onChange={(e) => setDaysInAdvance(Number(e.target.value))}
                className="w-full h-2 bg-aircraft-silver/60 rounded-lg appearance-none cursor-pointer accent-aviation-blue"
              />
              <div className="flex justify-between text-[10px] font-mono-avionics text-aviation-blue/70 mt-1">
                <span>1 Day (Peak Surge)</span>
                <span>14 Days (Optimal)</span>
                <span>90 Days (Base Fare)</span>
              </div>
            </div>

            {/* Departure Time Slot Segmented Buttons */}
            <div>
              <label className="block text-[10px] font-mono-avionics uppercase text-aviation-blue-sky font-bold mb-1.5">
                Departure Time Slot
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono-avionics text-xs">
                {[
                  { id: 'morning', label: 'Morning', hours: '06:00-11:00' },
                  { id: 'midday', label: 'Midday', hours: '11:00-16:00' },
                  { id: 'evening', label: 'Evening', hours: '16:00-21:00' },
                  { id: 'night', label: 'Night', hours: '21:00-05:00' }
                ].map((slot) => (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => setDepartureTimeSlot(slot.id)}
                    className={`p-2 rounded-xl text-center border transition-all ${
                      departureTimeSlot === slot.id
                        ? 'bg-aviation-blue text-white border-aviation-blue font-bold shadow-sm'
                        : 'bg-aviation-surface hover:bg-aviation-blue-light/20 text-aviation-blue border-aircraft-silver'
                    }`}
                  >
                    <div className="text-[11px]">{slot.label}</div>
                    <div className="text-[9px] opacity-75">{slot.hours}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Predict Button */}
            <button
              type="submit"
              disabled={isCalculating}
              className="aviation-btn-primary w-full py-3.5 px-6 rounded-xl text-xs font-mono-avionics font-bold tracking-wider uppercase transition-all shadow-aviation-elevated flex items-center justify-center gap-2 active:scale-95"
            >
              {isCalculating ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>COMPUTING INFERENCE MATRIX...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>CALCULATE PREDICTED FARE</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Prediction Readout & Breakdown */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Main Price Card (Deep Aviation Blue) */}
          <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-aviation-blue via-[#074E8D] to-aviation-blue-sky text-white border border-aviation-blue-accent/40 shadow-aviation-elevated relative overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-white/15 mb-6">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono-avionics font-bold uppercase tracking-wider text-aviation-blue-light">
                  ESTIMATED FARE // {origin} ➔ {destination}
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/15 border border-white/20 text-emerald-300 font-mono-avionics text-[11px] font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>R² {prediction.confidence}% ACCURACY</span>
              </div>
            </div>

            {/* Large Price Display */}
            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-4xl sm:text-5xl font-black font-mono-avionics tracking-tight text-white">
                ₹{prediction.finalPrice.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-aviation-blue-light font-mono-avionics font-semibold">
                INR / PASSENGER
              </span>
            </div>

            <p className="text-xs text-white/80 font-mono-avionics mb-6">
              Derived from {daysInAdvance}-day advance yield curves, historical ATF spot rate, and carrier capacity weighting.
            </p>

            {/* Price Component Breakdown Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/15 font-mono-avionics text-xs">
              <div className="p-2.5 rounded-xl bg-white/10 border border-white/15">
                <span className="text-[10px] text-aviation-blue-light block font-semibold">BASE FARE</span>
                <span className="font-bold text-white">₹{prediction.breakdown.baseAirlineFare.toLocaleString('en-IN')}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/10 border border-white/15">
                <span className="text-[10px] text-aviation-blue-light block font-semibold">FUEL SURCHARGE</span>
                <span className="font-bold text-white">₹{prediction.breakdown.fuelSurcharge.toLocaleString('en-IN')}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/10 border border-white/15">
                <span className="text-[10px] text-aviation-blue-light block font-semibold">UDF & TAXES</span>
                <span className="font-bold text-white">₹{prediction.breakdown.udfFee.toLocaleString('en-IN')}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/10 border border-white/15">
                <span className="text-[10px] text-aviation-blue-light block font-semibold">GST (5%)</span>
                <span className="font-bold text-white">₹{prediction.breakdown.gst.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Advance Booking Decay Curve Visualizer */}
          <div className="p-6 rounded-2xl bg-white border border-aircraft-silver shadow-aviation-subtle">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-xs font-mono-avionics font-bold uppercase text-aviation-blue tracking-wider">
                  30-Day Booking Window Trajectory
                </h4>
                <p className="text-[11px] text-aviation-blue/70">
                  Fare escalation curve as departure day (D-0) approaches
                </p>
              </div>
              <TrendingDown className="w-4 h-4 text-aviation-blue-sky" />
            </div>

            {/* Mini Bar Sparkline */}
            <div className="flex items-end gap-1.5 h-28 pt-4 pb-2 border-b border-aircraft-silver/50">
              {prediction.trendHistory.map((item, idx) => {
                const maxFare = Math.max(...prediction.trendHistory.map(t => t.fare));
                const minFare = Math.min(...prediction.trendHistory.map(t => t.fare));
                const heightPercent = Math.max(15, ((item.fare - minFare * 0.8) / (maxFare - minFare * 0.8)) * 100);
                const isCurrentSelected = Math.abs(parseInt(item.days.replace(/\D/g, '') || 0) - daysInAdvance) < 3;

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                    {/* Tooltip on hover */}
                    <div className="absolute -top-8 px-1.5 py-0.5 rounded bg-aviation-blue text-white text-[9px] font-mono-avionics opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 shadow-sm">
                      ₹{item.fare}
                    </div>
                    {/* Bar */}
                    <div
                      className={`w-full rounded-t transition-all duration-300 ${
                        isCurrentSelected
                          ? 'bg-aviation-blue'
                          : 'bg-aircraft-silver/70 group-hover:bg-aviation-blue-sky'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between text-[10px] font-mono-avionics text-aviation-blue/70 mt-2">
              <span>D-30 Days Out</span>
              <span>D-14 Days</span>
              <span className="font-bold text-aviation-blue">Departure (D-0)</span>
            </div>
          </div>

        </div>

      </div>

    </section>
  );
}
