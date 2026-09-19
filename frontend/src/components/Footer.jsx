import React from 'react';
import { Plane, Github, ExternalLink, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-carbon-primary text-aircraft-white border-t border-metallic-gray/20 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-metallic-gray/15">
          {/* Brand Info */}
          <div className="md:col-span-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-aircraft-white text-carbon-primary flex items-center justify-center font-bold shadow-sm">
                <Plane className="w-4 h-4 transform -rotate-45" />
              </div>
              <span className="font-bold text-lg tracking-tight font-mono-avionics text-aircraft-white">
                AERO-CPI // PLATFORM
              </span>
            </div>
            <p className="text-xs text-aircraft-white/70 max-w-md leading-relaxed">
              Development of a Real-time Airfare Price Index for India through Automated Web Scraping of Airline and OTA Portals for Augmentation of the Consumer Price Index (CPI).
            </p>
            <div className="flex items-center gap-4 text-xs font-mono-avionics text-metallic-gray">
              <span>● SMART INDIA HACKATHON 2026</span>
              <span>● NATIONAL GRAND FINALE</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-3 font-mono-avionics text-xs">
            <span className="font-bold text-aircraft-white uppercase tracking-wider block mb-2">
              System Modules
            </span>
            <ul className="space-y-2 text-aircraft-white/70">
              <li><a href="#overview" className="hover:text-aircraft-white transition-colors">Problem Statement</a></li>
              <li><a href="#pipeline" className="hover:text-aircraft-white transition-colors">5-Stage Data Pipeline</a></li>
              <li><a href="#prediction-demo" className="hover:text-aircraft-white transition-colors">Live Airfare Predictor</a></li>
              <li><a href="#data-insights" className="hover:text-aircraft-white transition-colors">CPI Comparison Analytics</a></li>
              <li><a href="#impact" className="hover:text-aircraft-white transition-colors">MoSPI & RBI Policy Impact</a></li>
            </ul>
          </div>

          {/* Telemetry & Compliance */}
          <div className="md:col-span-3 space-y-3 font-mono-avionics text-xs">
            <span className="font-bold text-aircraft-white uppercase tracking-wider block mb-2">
              Governance & Security
            </span>
            <div className="p-3 rounded-lg bg-carbon-secondary/70 border border-metallic-gray/15 text-[11px] text-aircraft-white/75 space-y-1.5">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>ETHICAL SCRAPING PROTOCOL</span>
              </div>
              <p className="text-[10px] text-aircraft-white/60 leading-relaxed">
                Respects robots.txt directives, implements randomized backoffs, and queries public rate schedules without denial-of-service vectors.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Coordinates Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono-avionics text-[10px] text-metallic-gray">
          <div>
            COORDINATE FIX: DEL [28.556° N, 77.100° E] // BOM [19.089° N, 72.868° E]
          </div>
          <div>
            BUILD 2026.09.14 // LICENSED UNDER MIT // DESIGNED FOR SIH
          </div>
        </div>

      </div>
    </footer>
  );
}
