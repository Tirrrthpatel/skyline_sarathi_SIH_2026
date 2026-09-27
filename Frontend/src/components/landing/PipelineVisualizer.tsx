import { useState } from "react"
import { Database, Server, Layers, Cpu, Radio, LayoutDashboard, ArrowRight } from "lucide-react"

export function PipelineVisualizer() {
  const [activeStage, setActiveStage] = useState(0)

  const stages = [
    {
      index: "01",
      name: "Data Sources",
      category: "Airlines • OTAs • DGCA",
      icon: Database,
      summary: "Collecting multi-carrier fare data and official DGCA civil aviation traffic statistics across India.",
      bullets: [
        "Airlines: IndiGo (6E), Air India (AI), SpiceJet (SG), Akasa Air (QP)",
        "OTAs: MakeMyTrip, Cleartrip, Yatra, Goibibo, EaseMyTrip",
        "DGCA Portal: Monthly passenger volume route-level weighting statistics"
      ],
      terminalCmd: "$ sarathi-source --fetch-routes --platforms=all",
      terminalOutput: [
        "[08:00:01] Ingesting IndiGo direct tariffs: 42 metro corridors active",
        "[08:00:02] Querying MakeMyTrip aggregator stream: 11 platforms scanned",
        "[08:00:03] Pulling DGCA city-pair monthly passenger density weights",
        "[08:00:04] Status: 10,480 raw tariff observations staged for pipeline"
      ]
    },
    {
      index: "02",
      name: "Data Collection",
      category: "Ethical Scraping Layer",
      icon: Server,
      summary: "Responsible, robots.txt-compliant automated collection orchestrated by Apache Airflow with IP proxies.",
      bullets: [
        "Apache Airflow: Automated DAG scheduling & scraping orchestration",
        "Ethical compliance: Strict robots.txt adherence and domain pacing",
        "Proxy Management: Bright Data & Oxylabs residential IP-rotation",
        "Session governance: Rate limiting (req/hour) & human-like session management"
      ],
      terminalCmd: "$ airflow dags trigger airline_scrape_orchestrator",
      terminalOutput: [
        "[08:01:10] Airflow DAG 'airline_scrape_orchestrator' triggered",
        "[08:01:12] IP proxy rotation active via Bright Data (Pool: 120 IPs)",
        "[08:01:14] Pacing enforced: 60 req/min/domain (0 HTTP 429 errors)",
        "[08:01:16] Collection success rate: 98.4% (robots.txt compliant)"
      ]
    },
    {
      index: "03",
      name: "Data Preprocessing",
      category: "Kafka & PostgreSQL Storage",
      icon: Layers,
      summary: "Ingestion of JSON/HTML snapshots, outlier cleansing, and real-time streaming to Kafka and PostgreSQL.",
      bullets: [
        "Raw Ingestion: Standardized flight snapshots in JSON / structured HTML",
        "Cleansing & Validation: Outlier removal (Tukey's IQR), taxes/fees isolation",
        "Apache Kafka: High-throughput real-time message streaming platform",
        "PostgreSQL: Relational historical storage for raw observation audit trails"
      ],
      terminalCmd: "$ kafka-console-producer --topic aero-tariffs-raw",
      terminalOutput: [
        "[08:02:00] Kafka topic 'aero-tariffs-raw' streaming at 850 msg/sec",
        "[08:02:02] Outlier filter: Removed 14 surge artifacts (IQR bounds ±3.0)",
        "[08:02:04] Base fare decomposed from convenience fees (₹350 isolated)",
        "[08:02:06] PostgreSQL committed: 10,240 validated records inserted"
      ]
    },
    {
      index: "04",
      name: "ML & Index Engine",
      category: "Ensemble Regressors & DGCA Index",
      icon: Cpu,
      summary: "Feature engineering, LightGBM/XGBoost/CatBoost price predictions, and DGCA passenger weighting.",
      bullets: [
        "Feature Engineering: Booking horizons (T+1 to T+45), distance, ATF fuel",
        "Ensemble Regressors: LightGBM, XGBoost, and CatBoost predictive models",
        "Traceability Layer: Immutable audit log for complete policy transparency",
        "DGCA Index Aggregation: Passenger-volume weighted CPI transport index"
      ],
      terminalCmd: "$ sarathi-ml-engine --train-ensemble --calc-dgca-index",
      terminalOutput: [
        "[08:03:01] Engineered 32 spatial/temporal features for T+1..T+45 horizons",
        "[08:03:03] LightGBM model score: MAPE 4.2% | XGBoost MAPE: 4.6%",
        "[08:03:05] CatBoost consensus fair fare inferred in 14ms",
        "[08:03:07] Computed DGCA weighted index: 142.8 pts (Base: Jan 2024 = 100)"
      ]
    },
    {
      index: "05",
      name: "Real-Time Services",
      category: "FastAPI • Redis • WebSockets",
      icon: Radio,
      summary: "High-concurrency microservices delivering sub-18ms REST API endpoints and live WebSocket push feeds.",
      bullets: [
        "FastAPI REST API: Ultra-fast asynchronous flight telemetry query engine",
        "Redis In-Memory Cache: Sub-millisecond retrieval of hot corridor queries",
        "WebSockets: Instant live price index push updates without page refresh",
        "Security & Audit: JWT token verification, IP rate limiting & access logging"
      ],
      terminalCmd: "$ uvicorn backend.fastapi.main:app --host 0.0.0.0 --port 8000",
      terminalOutput: [
        "[08:04:00] Uvicorn running on http://0.0.0.0:8000 (FastAPI v0.115)",
        "[08:04:01] Redis cache cluster connected: 450 corridor keys warm",
        "[08:04:02] WebSocket broadcaster active: 18 institutional clients linked",
        "[08:04:03] Query latency benchmark: P95 = 14ms (Optimal SLA)"
      ]
    },
    {
      index: "06",
      name: "User Interface",
      category: "React • PowerBI Dashboard",
      icon: LayoutDashboard,
      summary: "Dual-persona portal for MoSPI/RBI macroeconomic inflation analytics and consumer fare intelligence.",
      bullets: [
        "Dual-Persona Portal: MoSPI/RBI institutional feeds + traveler forecasts",
        "Interactive Corridors: 120+ metro and regional UDAN routes visualizer",
        "PowerBI Integration: Prototype analytical drilldowns for policymakers",
        "Sensitivity Simulator: Real-time dynamic yield & booking horizon testing"
      ],
      terminalCmd: "$ vite build --mode production && echo 'UI READY'",
      terminalOutput: [
        "[08:05:00] Swiss International typography engine rendered",
        "[08:05:01] Dynamic corridor selector synced with FastAPI endpoints",
        "[08:05:02] MoSPI CPI export module validated (JSON / CSV schema)",
        "[08:05:03] UI status: ONLINE & TELEMETRY SYNCHRONIZED"
      ]
    }
  ]

  const active = stages[activeStage]

  return (
    <section className="relative z-10 bg-white dark:bg-black border-b-2 border-black dark:border-white py-16 sm:py-24 transition-colors duration-150">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12 sm:mb-16 text-left">
          <div className="flex items-center gap-2 mb-2 font-mono text-xs font-bold uppercase text-black dark:text-white">
            <span>02. PIPELINE</span>
            <span>//</span>
            <span>TECHNICAL APPROACH & WORKFLOW</span>
          </div>
          <h2 className="font-sans font-black text-3xl sm:text-5xl lg:text-6xl tracking-tighter uppercase text-black dark:text-white leading-tight">
            6-Stage End-To-End<br />
            <span className="text-black dark:text-white">Architecture Pipeline.</span>
          </h2>
          <p className="mt-4 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 font-mono leading-relaxed">
            From ethical scraping across 11+ airline/OTA portals to Kafka streaming, LightGBM inference, DGCA route weighting, and sub-18ms FastAPI delivery.
          </p>
        </div>

        {/* 6-Stage Horizontal Navigation Tabs - Pure Swiss 0px Radius */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 border-2 border-black dark:border-white divide-x-2 divide-y-2 md:divide-y-0 divide-black dark:divide-white bg-white dark:bg-black mb-8">
          {stages.map((stage, idx) => {
            const isSelected = activeStage === idx
            return (
              <button
                key={stage.index}
                onClick={() => setActiveStage(idx)}
                className={`p-4 text-left transition-colors cursor-pointer select-none ${
                  isSelected
                    ? "bg-[#f3d400] text-black font-black"
                    : "bg-white dark:bg-black text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900"
                }`}
              >
                <div className="flex items-center justify-between font-mono text-xs mb-1">
                  <span className={`font-black ${isSelected ? "text-black" : "text-neutral-500"}`}>
                    {stage.index}.
                  </span>
                  <stage.icon className="w-3.5 h-3.5" />
                </div>
                <div className="font-sans font-black text-xs uppercase tracking-tight truncate">
                  {stage.name}
                </div>
              </button>
            )
          })}
        </div>

        {/* Main Stage Detail Deck (2 Cols: Specification + Live Terminal Execution) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 border-2 border-black dark:border-white divide-y-2 lg:divide-y-0 lg:divide-x-2 divide-black dark:divide-white bg-white dark:bg-black">
          
          {/* Left: Stage Specification & Bullets (Cols 1-7) */}
          <div className="lg:col-span-7 p-6 sm:p-8 text-left space-y-6">
            <div className="flex items-center justify-between pb-4 border-b-2 border-black dark:border-white">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 bg-[#f3d400] text-black border border-black flex items-center justify-center font-mono font-black text-xs">
                  {active.index}
                </span>
                <div>
                  <h3 className="font-sans font-black text-xl uppercase tracking-tight text-black dark:text-white">
                    {active.name}
                  </h3>
                  <span className="font-mono text-xs text-black dark:text-white font-bold uppercase">
                    {active.category}
                  </span>
                </div>
              </div>
              <span className="font-mono text-xs uppercase px-2 py-0.5 bg-neutral-100 dark:bg-neutral-900 border border-black dark:border-white text-black dark:text-white hidden sm:inline">
                STAGE SPECIFICATION
              </span>
            </div>

            <p className="text-xs sm:text-sm text-neutral-800 dark:text-neutral-200 font-mono leading-relaxed">
              {active.summary}
            </p>

            <div className="space-y-2 pt-2">
              <span className="text-[11px] font-mono font-black uppercase tracking-wider text-neutral-500 block mb-2">
                Core Architectural Deliverables:
              </span>
              {active.bullets.map((bullet, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs font-mono text-black dark:text-white">
                  <span className="w-1.5 h-1.5 bg-black dark:bg-white mt-1.5 shrink-0"></span>
                  <span className="leading-snug">{bullet}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Live Command Execution Terminal (Cols 8-12) */}
          <div className="lg:col-span-5 p-6 sm:p-8 bg-neutral-100 dark:bg-neutral-950 font-mono text-left flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b-2 border-black dark:border-white mb-4 text-xs">
                <span className="font-black text-black dark:text-white uppercase">EXECUTION CONSOLE</span>
                <span className="text-black dark:text-white font-black text-[10px] uppercase">SARATHI-CORE v2.6</span>
              </div>

              <div className="p-3 bg-white dark:bg-black border-2 border-black dark:border-white text-[11px] text-black dark:text-white font-bold mb-4">
                {active.terminalCmd}
              </div>

              <div className="space-y-2 text-[11px] text-neutral-800 dark:text-neutral-300">
                {active.terminalOutput.map((line, i) => (
                  <p key={i} className="leading-relaxed border-b border-black/5 dark:border-white/5 pb-1">
                    {line}
                  </p>
                ))}
              </div>
            </div>

            <div className="pt-6 mt-6 border-t-2 border-black dark:border-white flex items-center justify-between text-[11px] text-neutral-600 dark:text-neutral-400">
              <span>STATUS: HEALTHY</span>
              <span className="text-black dark:text-white font-bold">LATENCY: &lt;18MS</span>
            </div>
          </div>

        </div>

        {/* Visual Flowchart Summary Strip from Slide 3 */}
        <div className="mt-8 border-2 border-black dark:border-white bg-neutral-100 dark:bg-neutral-900 p-5 sm:p-6 text-left">
          <div className="text-[11px] font-mono font-black uppercase text-black dark:text-white mb-3">
            [ ARCHITECTURAL FLOWCHART ]
          </div>
          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-black dark:text-white">
            <span className="px-2.5 py-1 bg-white dark:bg-black border border-black dark:border-white font-bold">
              1. OTAs & Airlines
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-black dark:text-white shrink-0" />
            <span className="px-2.5 py-1 bg-white dark:bg-black border border-black dark:border-white font-bold">
              2. Ethical Scraping (Airflow)
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-black dark:text-white shrink-0" />
            <span className="px-2.5 py-1 bg-white dark:bg-black border border-black dark:border-white font-bold">
              3. Kafka & Postgres
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-black dark:text-white shrink-0" />
            <span className="px-2.5 py-1 bg-white dark:bg-black border border-black dark:border-white font-bold">
              4. ML Regressors (LightGBM)
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-black dark:text-white shrink-0" />
            <span className="px-2.5 py-1 bg-white dark:bg-black border border-black dark:border-white font-bold">
              5. FastAPI & Redis Cache
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-black dark:text-white shrink-0" />
            <span className="px-2.5 py-1 bg-[#f3d400] text-black border-2 border-black font-black">
              6. React / MoSPI Portal
            </span>
          </div>
        </div>

      </div>
    </section>
  )
}
