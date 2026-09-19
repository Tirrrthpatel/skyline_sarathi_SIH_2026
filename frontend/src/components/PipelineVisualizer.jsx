import React, { useState } from 'react';
import { Database, Filter, Calculator, Cpu, TrendingUp, CheckCircle, ArrowRight, Code2 } from 'lucide-react';

const PIPELINE_STAGES = [
  {
    id: 1,
    icon: Database,
    title: 'Automated Scraping',
    subtitle: 'Airline & OTA Ingestion',
    tech: 'Playwright // Scrapy // Direct REST',
    description: 'Autonomous headless workers poll scheduled flight fares every 15 minutes across major Indian portals (IndiGo, Air India, Vistara, MakeMyTrip, EaseMyTrip).',
    specs: [
      { label: 'Ingestion Cadence', value: '15-min intervals' },
      { label: 'Domestic Pairs', value: '450+ Active Routes' },
      { label: 'Booking Horizons', value: '1, 3, 7, 14, 30, 60, 90 Days' }
    ],
    codeSnippet: `# Extraction Daemon Worker
def fetch_route_snapshot(origin, dest, date):
    session = create_stealth_session()
    raw_html = session.get(f"https://api.ota.in/flights?from={origin}&to={dest}&dt={date}")
    return parse_fare_classes(raw_html.json())`
  },
  {
    id: 2,
    icon: Filter,
    title: 'Data Cleaning',
    subtitle: 'Outlier & Anomaly Filtering',
    tech: 'Pandas // NumPy // IQR Filtering',
    description: 'Raw web records undergo deduplication, currency standardization, and statistical sanitization to remove cached phantom fares and emergency charter spikes.',
    specs: [
      { label: 'Outlier Detection', value: 'Modified Z-Score > 3.2' },
      { label: 'Deduplication', value: 'Carrier + Flight# + Cabin' },
      { label: 'Clean Yield Rate', value: '99.4% Valid Rows' }
    ],
    codeSnippet: `# Statistical Sanitization Pipeline
def sanitize_fares(df):
    df = df.dropna(subset=['base_fare', 'taxes'])
    z_scores = np.abs((df['fare'] - df['fare'].mean()) / df['fare'].std())
    return df[z_scores < 3.2] # Exclude phantom cache errors`
  },
  {
    id: 3,
    icon: Calculator,
    title: 'Price Index Engine',
    subtitle: 'Fisher-Ideal Formulation',
    tech: 'Laspeyres // Paasche // Fisher Geometric Mean',
    description: 'Computes index numbers measuring aggregate airfare price inflation across Indian airspace, weighted by monthly passenger volumes from DGCA reports.',
    specs: [
      { label: 'Formulation', value: 'P_F = √(P_L × P_P)' },
      { label: 'Base Period', value: 'Jan 2024 = 100.0' },
      { label: 'Weighting Source', value: 'DGCA Monthly Passenger Enplanements' }
    ],
    codeSnippet: `# Fisher Ideal Index Formulation
def compute_fisher_index(p_current, p_base, q_current, q_base):
    laspeyres = np.sum(p_current * q_base) / np.sum(p_base * q_base)
    paasche   = np.sum(p_current * q_current) / np.sum(p_base * q_current)
    return np.sqrt(laspeyres * paasche) * 100.0`
  },
  {
    id: 4,
    icon: Cpu,
    title: 'ML Prediction Core',
    subtitle: 'XGBoost & LightGBM Regressors',
    tech: 'Python // Scikit-Learn // XGBoost',
    description: 'Predicts fare trajectories based on historical seasonality, holiday clusters, ATF fuel spot prices, and advance booking window decay.',
    specs: [
      { label: 'Model R² Score', value: '0.948 (Test Set)' },
      { label: 'Features Extracted', value: '18 Engineered Covariates' },
      { label: 'Inference Latency', value: '< 12ms per query' }
    ],
    codeSnippet: `# Gradient Boosted Regression Inference
def predict_fare(route_features):
    dmatrix = xgb.DMatrix(route_features)
    predicted_fare = bst_model.predict(dmatrix)
    confidence_interval = calculate_quantile_bounds(predicted_fare)
    return predicted_fare, confidence_interval`
  },
  {
    id: 5,
    icon: TrendingUp,
    title: 'CPI Augmentation',
    subtitle: 'Macroeconomic MoSPI Dashboard',
    tech: 'FastAPI // PostgreSQL // MoSPI Feeds',
    description: 'Pushes high-frequency, daily airfare indices directly into statistical agency dashboards, eliminating the 45-day survey reporting lag.',
    specs: [
      { label: 'CPI Sub-Index Weight', value: '0.14% of National CPI' },
      { label: 'Frequency Delivery', value: 'Daily 06:00 IST Release' },
      { label: 'Policy Beneficiaries', value: 'MoSPI, RBI Monetary Policy, DGCA' }
    ],
    codeSnippet: `# Macroeconomic Feed Dispatch
@app.get("/api/v1/cpi/augmentation-feed")
def get_cpi_airfare_index(start_date: str, end_date: str):
    index_series = db.query_aggregated_daily_index(start_date, end_date)
    return {"status": "SUCCESS", "sub_index": "CIVIL_AVIATION", "data": index_series}`
  }
];

export default function PipelineVisualizer() {
  const [activeStage, setActiveStage] = useState(PIPELINE_STAGES[0]);

  return (
    <section id="pipeline" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-white/70 backdrop-blur-md rounded-3xl my-12 border border-aircraft-silver shadow-aviation-subtle">
      
      {/* Header */}
      <div className="mb-12 text-center max-w-3xl mx-auto">
        <span className="text-xs font-mono-avionics text-aviation-blue-sky font-semibold uppercase tracking-wider block mb-2">
          End-To-End Architecture // MoSPI Augmentation
        </span>
        <h2 className="text-3xl sm:text-4xl font-black text-aviation-blue tracking-tight mb-4">
          THE 5-STAGE DATA PIPELINE
        </h2>
        <p className="text-xs sm:text-sm text-aviation-blue/80 font-mono-avionics">
          From distributed headless web scrapers to official macroeconomic policy integration. Click any stage to inspect technical specifications and code routines.
        </p>
      </div>

      {/* Pipeline Navigation / Step Indicator */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-10">
        {PIPELINE_STAGES.map((stage) => {
          const Icon = stage.icon;
          const isActive = activeStage.id === stage.id;

          return (
            <button
              key={stage.id}
              onClick={() => setActiveStage(stage)}
              className={`p-4 rounded-xl text-left transition-all duration-200 border ${
                isActive
                  ? 'bg-aviation-blue text-white border-aviation-blue shadow-aviation-elevated scale-[1.02]'
                  : 'bg-white/90 hover:bg-aviation-surface text-aviation-blue border-aircraft-silver/60'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`text-[10px] font-mono-avionics font-bold px-2 py-0.5 rounded ${
                  isActive ? 'bg-aviation-blue-sky text-white' : 'bg-aviation-surface text-aviation-blue/70'
                }`}>
                  STAGE 0{stage.id}
                </span>
                <Icon className={`w-4 h-4 ${isActive ? 'text-aviation-blue-light' : 'text-aviation-blue-sky'}`} />
              </div>
              <h4 className="text-xs sm:text-sm font-bold truncate">{stage.title}</h4>
              <p className={`text-[10px] font-mono-avionics truncate mt-0.5 ${isActive ? 'text-aviation-blue-light' : 'text-aviation-blue/60'}`}>
                {stage.subtitle}
              </p>
            </button>
          );
        })}
      </div>

      {/* Detailed Active Stage Inspector */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-aircraft-silver shadow-aviation-subtle grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Description and Specs */}
        <div className="lg:col-span-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-aviation-blue text-white flex items-center justify-center font-mono-avionics text-sm font-bold shadow-sm">
              0{activeStage.id}
            </div>
            <div>
              <span className="text-[10px] font-mono-avionics uppercase text-aviation-blue-sky font-semibold tracking-wider">
                {activeStage.tech}
              </span>
              <h3 className="text-xl font-bold text-aviation-blue">
                {activeStage.title} : {activeStage.subtitle}
              </h3>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-aviation-blue/80 leading-relaxed font-mono-avionics">
            {activeStage.description}
          </p>

          {/* Technical Specifications */}
          <div className="space-y-2 pt-2 border-t border-aircraft-silver/50">
            <span className="text-[10px] font-mono-avionics uppercase text-aviation-blue font-bold tracking-wider block">
              Architectural Specifications:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {activeStage.specs.map((spec, i) => (
                <div key={i} className="p-3 rounded-xl bg-aviation-surface/60 border border-aircraft-silver font-mono-avionics">
                  <div className="text-[10px] text-aviation-blue-sky font-medium">{spec.label}</div>
                  <div className="text-xs font-bold text-aviation-blue mt-0.5">{spec.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Code Snippet & Terminal Output */}
        <div className="lg:col-span-6">
          <div className="rounded-xl bg-[#042A4D] text-white border border-aviation-blue-sky/30 shadow-aviation-elevated overflow-hidden font-mono-avionics text-xs">
            {/* Terminal Header */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-[#031E38] border-b border-aviation-blue-accent/20 text-[11px] text-aviation-blue-light">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="ml-2 text-white font-medium">stage_0{activeStage.id}_execution.py</span>
              </div>
              <span className="text-[10px] text-aviation-blue-light">PYTHON 3.12 // FAST-EXEC</span>
            </div>

            {/* Code Body */}
            <pre className="p-5 text-[11px] leading-relaxed text-blue-100 overflow-x-auto selection:bg-aviation-blue selection:text-white">
              <code>{activeStage.codeSnippet}</code>
            </pre>
          </div>
        </div>

      </div>

    </section>
  );
}
