import React from 'react';
import { Landmark, ShieldAlert, Users, TrendingUp, CheckCircle, Award } from 'lucide-react';

export default function ImpactMetrics() {
  const impactCards = [
    {
      icon: Landmark,
      target: 'MoSPI National Statistics',
      headline: 'Real-Time Inflation Nowcasting',
      metric: '45 Days ➔ 0 Days',
      metricSub: 'Lag Reduction in Transport CPI',
      description: 'Replaces retrospective paper questionnaires with programmatic daily price indices, enhancing the credibility and timeliness of India’s Headline CPI releases.'
    },
    {
      icon: TrendingUp,
      target: 'Reserve Bank of India (RBI)',
      headline: 'Monetary Policy Committee (MPC)',
      metric: 'Daily Feed',
      metricSub: 'High-Frequency Core Inflation Signal',
      description: 'Provides RBI economists with high-frequency indicators to detect fuel cost pass-through and household discretionary spending shifts ahead of bi-monthly policy reviews.'
    },
    {
      icon: ShieldAlert,
      target: 'DGCA & Ministry of Civil Aviation',
      headline: 'Predatory Surge Detection',
      metric: '100% Monitored',
      metricSub: 'Trunk & Regional UDAN Routes',
      description: 'Automated statistical outlier flags detect unnatural route price gouging during natural disasters, railway disruptions, or festival peaks.'
    },
    {
      icon: Users,
      target: 'Indian Traveling Public',
      headline: 'Consumer Welfare & Transparency',
      metric: '₹1,200 Cr+',
      metricSub: 'Estimated Potential Consumer Savings',
      description: 'Democratizes airline algorithmic revenue pricing, empowering businesses and travelers to book at statistical yield nadirs rather than surge crests.'
    }
  ];

  return (
    <section id="impact" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-gradient-to-br from-aviation-blue via-[#074E8D] to-[#042A4D] text-white rounded-3xl my-12 border border-aviation-blue-accent/30 shadow-aviation-elevated">
      
      {/* Header */}
      <div className="mb-16 text-center max-w-3xl mx-auto">
        <span className="text-xs font-mono-avionics text-aviation-blue-light uppercase tracking-wider block mb-2 font-bold">
          Transformational Value Proposition // Macroeconomic Impact
        </span>
        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">
          NATIONAL & MACROECONOMIC IMPACT
        </h2>
        <p className="text-xs sm:text-sm text-aviation-blue-light font-mono-avionics leading-relaxed">
          How automated high-frequency airfare price indexing augments national statistical governance, regulatory surveillance, and economic planning.
        </p>
      </div>

      {/* Grid of 4 Impact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {impactCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className="p-6 rounded-2xl bg-white/10 border border-white/15 hover:border-aviation-blue-light/50 transition-all flex flex-col justify-between backdrop-blur-sm group"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-white/15 text-aviation-blue-light border border-white/20 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <Icon className="w-5 h-5 text-white" />
                </div>

                <span className="text-[10px] font-mono-avionics uppercase text-aviation-blue-light block mb-1 font-bold">
                  {card.target}
                </span>

                <h3 className="text-base font-bold text-white mb-3">
                  {card.headline}
                </h3>

                <p className="text-xs text-white/80 leading-relaxed mb-6 font-mono-avionics">
                  {card.description}
                </p>
              </div>

              <div className="pt-4 border-t border-white/15 font-mono-avionics">
                <div className="text-2xl font-black text-white tracking-tight">
                  {card.metric}
                </div>
                <div className="text-[10px] text-aviation-blue-light font-medium">
                  {card.metricSub}
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </section>
  );
}
