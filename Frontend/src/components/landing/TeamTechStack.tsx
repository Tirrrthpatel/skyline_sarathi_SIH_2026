export function TeamTechStack() {
  const feasibilities = [
    {
      code: "01",
      title: "Technical Feasibility",
      rating: "★★★★★",
      points: [
        "Proven open-source stack: Python, Selenium, Kafka, PostgreSQL, LightGBM",
        "Reliability Target: ≥95% collection success across all target portals",
        "Sub-18ms inference latency via asynchronous FastAPI services"
      ]
    },
    {
      code: "02",
      title: "Data Feasibility",
      rating: "★★★★☆",
      points: [
        "Daily Observations: 10K+ time-stamped airfare records across 7+ platforms",
        "Validation Target: 30-day backtesting with MAPE ≤ 8% accuracy",
        "T+1, T+7, T+15, T+30, T+45 lead time matrices populated continuously"
      ]
    },
    {
      code: "03",
      title: "Operational Feasibility",
      rating: "★★★★☆",
      points: [
        "Pipeline: Apache Airflow DAGs, Redis hot caching, automated failure recovery",
        "Traceability: End-to-end data lineage and cryptographic audit logging",
        "Scheduled updates synchronized with airline midnight yield recalculations"
      ]
    },
    {
      code: "04",
      title: "Resources Feasibility",
      rating: "★★★★★",
      points: [
        "Zero core software licensing fees: Built 100% on open-source standards",
        "Cost & Scale: ~₹2,500/month estimated infrastructure cost (cloud, proxy pacing)",
        "Horizontally scalable microservices architecture via Docker containerization"
      ]
    }
  ]

  const references = [
    {
      org: "MoSPI",
      title: "Consumer Price Index (CPI) - Methodology Expert Group on CPI (2025)",
      note: "Guidelines for augmenting traditional transport survey baskets with high-frequency digital telemetry."
    },
    {
      org: "DGCA",
      title: "Directorate General of Civil Aviation - Monthly Air Traffic Statistics",
      note: "Official passenger density weights used for constructing representative route-level indices."
    },
    {
      org: "ISSN: 2583-9055",
      title: "Flight Fare Prediction Using Machine Learning",
      note: "Mathematical methodologies for feature engineering, travel cost analysis, and forward booking curve estimation."
    },
    {
      org: "E-ISSN: 3050-9726",
      title: "The Ethics of Web Scraping in Research",
      note: "Legal frameworks, robots.txt compliance, and societal acceptance criteria for responsible automated data collection."
    }
  ]

  return (
    <section className="relative z-10 bg-white dark:bg-black border-b-2 border-black dark:border-white py-16 sm:py-24 transition-colors duration-150">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12 sm:mb-16 text-left">
          <div className="flex items-center gap-2 mb-2 font-mono text-xs font-bold uppercase text-black dark:text-white">
            <span>04. SPECIFICATION</span>
            <span>//</span>
            <span>FEASIBILITY, ROADMAP & RESEARCH</span>
          </div>
          <h2 className="font-sans font-black text-3xl sm:text-5xl lg:text-6xl tracking-tighter uppercase text-black dark:text-white leading-tight">
            Team 21 Jolly Roger<br />
            <span className="text-black dark:text-white">Feasibility & Research.</span>
          </h2>
          <p className="mt-4 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 font-mono leading-relaxed">
            Smart India Hackathon 2026 • Problem Statement ID: SIH26056 • Team ID: 171809 • Theme: Smart Automation.
          </p>
        </div>

        {/* 4 Feasibility Blocks (Slide 4) - Flat Swiss Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {feasibilities.map((f) => (
            <div
              key={f.code}
              className="p-6 border-2 border-black dark:border-white bg-white dark:bg-black text-left flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b-2 border-black dark:border-white mb-3">
                  <span className="font-mono font-black text-xs text-black dark:text-white">
                    [{f.code}]
                  </span>
                  <span className="font-mono text-xs font-black text-black bg-[#f3d400] px-2 py-0.5 border border-black">
                    {f.rating}
                  </span>
                </div>
                <h3 className="font-sans font-black text-base uppercase tracking-tight text-black dark:text-white mb-3">
                  {f.title}
                </h3>
                <div className="space-y-2 font-mono text-xs text-neutral-700 dark:text-neutral-300">
                  {f.points.map((p, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-black dark:bg-white mt-1 shrink-0"></span>
                      <span className="leading-snug">{p}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Research & References Citation Deck */}
        <div className="border-2 border-black dark:border-white bg-white dark:bg-black p-6 sm:p-8 text-left">
          <div className="flex items-center justify-between pb-4 border-b-2 border-black dark:border-white mb-6 font-mono text-xs">
            <span className="font-black text-black dark:text-white uppercase">[RESEARCH FOUNDATION & CITATIONS]</span>
            <span className="text-neutral-600 dark:text-neutral-400 uppercase hidden sm:inline">Rigorous Academic Grounding</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {references.map((ref, idx) => (
              <div key={idx} className="p-5 bg-neutral-100 dark:bg-neutral-900 border-2 border-black dark:border-white">
                <span className="inline-block px-2 py-0.5 bg-[#f3d400] text-black font-mono text-[10px] font-black uppercase mb-2 border border-black">
                  {ref.org}
                </span>
                <h4 className="font-sans font-black text-sm uppercase text-black dark:text-white mb-1.5 leading-snug">
                  {ref.title}
                </h4>
                <p className="font-mono text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
                  {ref.note}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
