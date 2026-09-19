import React from 'react';
import { AlertCircle, Clock, Zap, BarChart3, ArrowRight, CheckCircle2, XCircle } from 'lucide-react';

export default function ProblemStatement() {
  return (
    <section id="overview" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 pb-6 border-b border-aircraft-silver/60">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono-avionics text-aviation-blue-sky font-semibold mb-2">
            <span className="w-2 h-2 bg-aviation-blue rounded-full" />
            <span>SIH PROBLEM STATEMENT // PS-AIR-01 // MoSPI</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-aviation-blue">
            THE CPI AIRFARE LAG DILEMMA
          </h2>
        </div>
        <p className="mt-4 md:mt-0 max-w-md text-xs sm:text-sm text-aviation-blue/80 font-mono-avionics leading-relaxed">
          Why traditional monthly statistical surveys fail to capture modern algorithmic airline yield management, and how real-time scraping fills the policy void.
        </p>
      </div>

      {/* Main Comparison: Legacy vs Proposed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
        
        {/* Legacy Approach Card (Cabin muted warm tone accent) */}
        <div className="p-8 rounded-2xl bg-white/70 backdrop-blur-sm border border-aircraft-silver shadow-aviation-subtle relative overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <span className="px-3 py-1 rounded text-[11px] font-mono-avionics font-semibold uppercase bg-aircraft-silver/40 text-cabin-accent border border-aircraft-silver">
              Legacy Approach (Manual Collection)
            </span>
            <Clock className="w-5 h-5 text-cabin-muted" />
          </div>

          <h3 className="text-xl font-bold text-cabin-accent mb-3">
            Monthly Manual Sampling & Paper Inquiries
          </h3>
          <p className="text-xs sm:text-sm text-cabin-accent/80 leading-relaxed mb-6 font-mono-avionics">
            Official government statistical bodies gather airfare samples via periodic surveys or static schedule filings once a month. This captures only a fraction of transactions and remains oblivious to real-world pricing shocks.
          </p>

          <ul className="space-y-3 text-xs text-cabin-accent/85 font-mono-avionics">
            <li className="flex items-start gap-2.5">
              <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span><strong>30–45 Day Information Lag:</strong> Inflation spikes during Diwali or peak summer vacation are reported weeks after consumers already absorbed the cost.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span><strong>Static Base Fares:</strong> Ignores auxiliary luggage fees, dynamic fuel surcharges, and algorithmic peak-hour multipliers.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span><strong>Negligible Route Density:</strong> Often restricted to top metro pairs (DEL-BOM), ignoring fast-growing Tier-2/Tier-3 UDAN corridors.</span>
            </li>
          </ul>
        </div>

        {/* Real-time AERO-CPI Platform Card (Aviation Blue & Sky Accent) */}
        <div className="p-8 rounded-2xl bg-gradient-to-br from-aviation-blue to-aviation-blue-sky text-white border border-aviation-blue-accent/30 shadow-aviation-elevated relative overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <span className="px-3 py-1 rounded text-[11px] font-mono-avionics font-semibold uppercase bg-white/15 text-white border border-white/20">
              Our Solution: AERO-CPI
            </span>
            <Zap className="w-5 h-5 text-aviation-blue-light" />
          </div>

          <h3 className="text-xl font-bold text-white mb-3">
            Autonomous Scraping & Machine Learning Index
          </h3>
          <p className="text-xs sm:text-sm text-white/85 leading-relaxed mb-6 font-mono-avionics">
            A real-time data ingestion infrastructure that scrapes direct airline portals (IndiGo, Air India, Akasa) and Online Travel Aggregators (MakeMyTrip, Yatra), computing high-frequency Fisher-Ideal indices.
          </p>

          <ul className="space-y-3 text-xs text-white/95 font-mono-avionics">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-300 flex-shrink-0 mt-0.5" />
              <span><strong>15-Minute Polling Frequency:</strong> Continuous price curves across 1 to 90 days of advance booking windows.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-300 flex-shrink-0 mt-0.5" />
              <span><strong>Comprehensive Fare Dissection:</strong> Isolates base fare, airport development taxes, and dynamic fuel fluctuations.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-300 flex-shrink-0 mt-0.5" />
              <span><strong>Predictive Macroeconomic Augmentation:</strong> Empowers RBI & MoSPI to anticipate transportation sub-index CPI inflation before official monthly releases.</span>
            </li>
          </ul>
        </div>

      </div>

      {/* Three Pillar Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white/80 border border-aircraft-silver hover:border-aviation-blue-sky transition-colors shadow-aviation-subtle">
          <div className="w-10 h-10 rounded-xl bg-aviation-blue text-white flex items-center justify-center font-mono-avionics text-sm font-bold mb-4 shadow-sm">
            01
          </div>
          <h4 className="text-base font-bold text-aviation-blue mb-2">Automated High-Frequency Scraping</h4>
          <p className="text-xs text-aviation-blue/80 leading-relaxed font-mono-avionics">
            Headless browser orchestration and direct API polling across major OTAs and carrier systems, bypassing bot protection while honoring ethical rate limits.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white/80 border border-aircraft-silver hover:border-aviation-blue-sky transition-colors shadow-aviation-subtle">
          <div className="w-10 h-10 rounded-xl bg-aviation-blue text-white flex items-center justify-center font-mono-avionics text-sm font-bold mb-4 shadow-sm">
            02
          </div>
          <h4 className="text-base font-bold text-aviation-blue mb-2">Fisher & Laspeyres Index Engine</h4>
          <p className="text-xs text-aviation-blue/80 leading-relaxed font-mono-avionics">
            Statistically rigorous price index aggregation accounting for seat capacity weights, route passenger traffic, and substitution bias.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white/80 border border-aircraft-silver hover:border-aviation-blue-sky transition-colors shadow-aviation-subtle">
          <div className="w-10 h-10 rounded-xl bg-aviation-blue text-white flex items-center justify-center font-mono-avionics text-sm font-bold mb-4 shadow-sm">
            03
          </div>
          <h4 className="text-base font-bold text-aviation-blue mb-2">Real-Time ML Fare Forecasting</h4>
          <p className="text-xs text-aviation-blue/80 leading-relaxed font-mono-avionics">
            Supervised machine learning algorithms trained on multi-year Indian domestic price volatility to predict fare trajectories and consumer cost shocks.
          </p>
        </div>
      </div>
    </section>
  );
}
