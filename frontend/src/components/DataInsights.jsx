import React, { useState } from 'react';
import { BarChart3, TrendingUp, Compass, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';
import { CPI_COMPARISON_DATA } from '../data/routesData';

export default function DataInsights() {
  const [selectedMonth, setSelectedMonth] = useState(CPI_COMPARISON_DATA[11]); // Dec by default

  const routeMetrics = [
    { pair: 'DEL ➔ BOM', avgFare: '₹5,420', volatility: 'High (±34%)', trafficRank: '#1 Trunk Route' },
    { pair: 'BLR ➔ DEL', avgFare: '₹6,890', volatility: 'Moderate (±22%)', trafficRank: '#2 Tech Corridor' },
    { pair: 'BOM ➔ CCU', avgFare: '₹7,150', volatility: 'High (±29%)', trafficRank: '#3 Eastern Trunk' },
    { pair: 'DEL ➔ HYD', avgFare: '₹4,980', volatility: 'Low (±14%)', trafficRank: '#4 Business Shorthaul' }
  ];

  return (
    <section id="insights" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 pb-6 border-b border-aircraft-silver/60">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono-avionics text-aviation-blue-sky font-semibold mb-2">
            <span className="w-2 h-2 bg-aviation-blue rounded-full" />
            <span>EMPIRICAL EVIDENCE // DATA ANALYTICS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-aviation-blue tracking-tight">
            MACROECONOMIC DATA INSIGHTS
          </h2>
        </div>
        <p className="mt-4 md:mt-0 max-w-md text-xs sm:text-sm text-aviation-blue/80 font-mono-avionics leading-relaxed">
          Comparing the official monthly MoSPI civil aviation sub-index against our scraped real-time Fisher-Ideal index series.
        </p>
      </div>

      {/* Main Chart Card: Real-Time vs Official CPI */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-aircraft-silver shadow-aviation-subtle mb-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h3 className="text-lg font-bold text-aviation-blue flex items-center gap-2">
              <span>Official Monthly CPI vs Real-Time AERO-CPI Index</span>
              <span className="text-[10px] font-mono-avionics px-2 py-0.5 rounded bg-aviation-surface border border-aircraft-silver text-aviation-blue font-bold">
                Base: Jan 2024 = 100
              </span>
            </h3>
            <p className="text-xs text-aviation-blue/70 font-mono-avionics mt-0.5">
              Notice how official CPI stays nearly flat while real-time scraping captures festive travel shocks
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono-avionics font-semibold">
            <div className="flex items-center gap-1.5 text-aviation-blue">
              <span className="w-3 h-3 rounded bg-aviation-blue shadow-sm" />
              <span>AERO-CPI Real-Time</span>
            </div>
            <div className="flex items-center gap-1.5 text-aviation-blue-sky">
              <span className="w-3 h-3 rounded bg-aircraft-silver border border-aircraft-shadow" />
              <span>Official MoSPI CPI</span>
            </div>
          </div>
        </div>

        {/* Bar & Volatility Visualizer */}
        <div className="space-y-4">
          <div className="grid grid-cols-6 sm:grid-cols-12 gap-2 items-end h-56 pb-2 border-b border-aircraft-silver/50">
            {CPI_COMPARISON_DATA.map((item, idx) => {
              const maxVal = 210;
              const minVal = 135;
              const realHeight = ((item.realTimeIndex - minVal) / (maxVal - minVal)) * 100;
              const officialHeight = ((item.officialCpiAir - minVal) / (maxVal - minVal)) * 100;
              const isSelected = selectedMonth.month === item.month;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedMonth(item)}
                  className="flex-1 flex flex-col items-center gap-1 group h-full justify-end cursor-pointer"
                >
                  {/* Two comparative bars */}
                  <div className="w-full flex items-end justify-center gap-1 h-full">
                    {/* Real-time Bar (Deep Aviation Blue) */}
                    <div
                      className={`w-1/2 rounded-t transition-all duration-300 ${
                        isSelected
                          ? 'bg-aviation-blue shadow-sm'
                          : 'bg-aviation-blue-sky/90 group-hover:bg-aviation-blue'
                      }`}
                      style={{ height: `${realHeight}%` }}
                    />
                    {/* Official Bar (Aircraft Silver) */}
                    <div
                      className="w-1/2 bg-aircraft-silver group-hover:bg-aircraft-shadow rounded-t transition-all duration-300"
                      style={{ height: `${officialHeight}%` }}
                    />
                  </div>

                  <span className="text-[9px] font-mono-avionics text-aviation-blue font-semibold truncate w-full text-center">
                    {item.month.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Month Inspector Detail Box */}
          <div className="p-4 rounded-xl bg-aviation-surface/60 border border-aircraft-silver flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono-avionics text-xs">
            <div>
              <span className="text-[10px] text-aviation-blue-sky font-semibold block">INSPECTED TIMEFRAME</span>
              <span className="font-bold text-sm text-aviation-blue">{selectedMonth.month}</span>
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <div>
                <span className="text-[10px] text-aviation-blue-sky font-semibold block">OFFICIAL MOSPI CPI</span>
                <span className="font-bold text-aviation-blue">{selectedMonth.officialCpiAir}</span>
              </div>
              <div>
                <span className="text-[10px] text-aviation-blue-sky font-semibold block">AERO-CPI REAL-TIME</span>
                <span className="font-bold text-aviation-blue">{selectedMonth.realTimeIndex}</span>
              </div>
              <div>
                <span className="text-[10px] text-aviation-blue-sky font-semibold block">INFORMATION GAP (DELTA)</span>
                <span className={`font-bold flex items-center ${selectedMonth.variance.startsWith('+') ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {selectedMonth.variance.startsWith('+') ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                  {selectedMonth.variance}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Indian Route Variance Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {routeMetrics.map((r, i) => (
          <div key={i} className="p-5 rounded-xl bg-white border border-aircraft-silver shadow-aviation-subtle">
            <div className="flex items-center justify-between text-xs font-mono-avionics text-aviation-blue-sky font-semibold mb-2">
              <span>{r.trafficRank}</span>
              <Compass className="w-4 h-4 text-aviation-blue-accent" />
            </div>
            <h4 className="text-base font-bold text-aviation-blue mb-1">{r.pair}</h4>
            <div className="mt-3 pt-3 border-t border-aircraft-silver/40 font-mono-avionics text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-aviation-blue/70">Mean Yield:</span>
                <span className="font-bold text-aviation-blue">{r.avgFare}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-aviation-blue/70">Volatility Index:</span>
                <span className="font-bold text-aviation-blue">{r.volatility}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

    </section>
  );
}
