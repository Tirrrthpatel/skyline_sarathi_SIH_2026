import React from 'react';
import { Code, Terminal, Layers, Server, Cpu, ShieldCheck, Sparkles, Award } from 'lucide-react';

export default function TeamTechStack() {
  const techStack = [
    { category: 'Frontend & Cinematic Scrollytelling', items: ['React 18', 'Vite', 'Tailwind CSS', 'Motion / Framer', 'Lenis Inertia', 'HTML5 4K Canvas Sequence'] },
    { category: 'Data Extraction & Sanitization', items: ['Python 3.12', 'Playwright Headless', 'BeautifulSoup4', 'NumPy', 'Pandas', 'Z-Score IQR Cleaning'] },
    { category: 'Index & Machine Learning', items: ['Fisher-Ideal Formulations', 'XGBoost Regressor', 'Scikit-Learn', 'Temporal Feature Engineering'] },
    { category: 'Macro & Backend Delivery', items: ['FastAPI REST', 'PostgreSQL / Redis', 'JWT Auth', 'MoSPI CPI Data Harmonizer'] }
  ];

  return (
    <section id="team" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 pb-6 border-b border-aircraft-silver/60">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono-avionics text-aviation-blue-sky font-semibold mb-2">
            <span className="w-2 h-2 bg-aviation-blue rounded-full" />
            <span>PROJECT CREDENTIALS // TECH STACK // SIH 2026</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-aviation-blue tracking-tight">
            ENGINEERING ARCHITECTURE
          </h2>
        </div>
        <p className="mt-4 md:mt-0 max-w-md text-xs sm:text-sm text-aviation-blue/80 font-mono-avionics leading-relaxed">
          Production-ready full-stack architecture built for high-throughput automated web data mining and sub-millisecond ML model serving.
        </p>
      </div>

      {/* Tech Stack Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {techStack.map((tech, i) => (
          <div key={i} className="p-6 rounded-2xl bg-white border border-aircraft-silver shadow-aviation-subtle">
            <div className="text-[11px] font-mono-avionics font-bold uppercase text-aviation-blue-sky pb-3 border-b border-aircraft-silver/40 mb-4 flex items-center justify-between">
              <span>{tech.category}</span>
              <Sparkles className="w-3.5 h-3.5 text-aviation-blue-accent" />
            </div>
            <ul className="space-y-2 text-xs font-mono-avionics text-aviation-blue font-semibold">
              {tech.items.map((item, j) => (
                <li key={j} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-aviation-blue-sky" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* SIH Hackathon Verification Card */}
      <div className="p-8 rounded-2xl bg-white/80 border border-aircraft-silver flex flex-col md:flex-row items-center justify-between gap-6 font-mono-avionics shadow-aviation-subtle">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-aviation-blue text-white flex items-center justify-center font-bold text-base shadow-aviation-subtle">
            SIH
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-aviation-blue">SMART INDIA HACKATHON 2026</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">VERIFIED</span>
            </div>
            <p className="text-xs text-aviation-blue/70 mt-0.5">
              Problem Statement: Development of a Real-time Airfare Price Index for Augmentation of CPI
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-aviation-surface border border-aircraft-silver text-xs text-aviation-blue font-semibold">
            Organization: <strong>MoSPI / Civil Aviation</strong>
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-aviation-surface border border-aircraft-silver text-xs text-aviation-blue font-semibold">
            Category: <strong>Software / Smart Automation</strong>
          </div>
        </div>
      </div>

    </section>
  );
}
