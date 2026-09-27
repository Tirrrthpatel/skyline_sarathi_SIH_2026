import { useState } from "react"
import { PerformanceGauges, UplinkLoader, PredictiveArcCanvas } from "@designcodeio/threeui"
import { CardSpotlight } from "@/components/ui/card-spotlight"
import { Gauge, Activity, ShieldCheck, Zap } from "lucide-react"

type GaugeVariant = "tachometer" | "speedometer" | "boost" | "power"

interface AvionicsCockpitProps {
  corridorCode?: string
  confidence?: number
  predictedFare?: number
  latencyMs?: number
}

export function AvionicsCockpit({
  corridorCode = "DEL-BLR",
  confidence = 94.2,
  predictedFare = 6450,
  latencyMs = 18
}: AvionicsCockpitProps) {
  const [activeGauge, setActiveGauge] = useState<GaugeVariant>("tachometer")
  const [showArcVisualizer, setShowArcVisualizer] = useState(false)

  const gaugeConfigs: Record<GaugeVariant, {
    label: string
    metric: string
    sublabel: string
    icon: typeof Gauge
    status: string
  }> = {
    tachometer: {
      label: "ML Inference Velocity",
      metric: `${latencyMs}ms`,
      sublabel: "XGBoost + LightGBM Regressors",
      icon: Gauge,
      status: "OPTIMAL (SUB-20MS)"
    },
    speedometer: {
      label: "Scrape Cadence Rate",
      metric: "120 ops/s",
      sublabel: "OTA & Direct Carrier Ingestion",
      icon: Activity,
      status: "SYNCHRONIZED"
    },
    boost: {
      label: "Conformal Coverage",
      metric: `${confidence.toFixed(1)}%`,
      sublabel: "95% Statistical Grounding",
      icon: ShieldCheck,
      status: "CALIBRATED"
    },
    power: {
      label: "Tariff Basket Power",
      metric: `₹${predictedFare.toLocaleString("en-IN")}`,
      sublabel: "MoSPI CPI Weight Multiplier",
      icon: Zap,
      status: "ACTIVE WEIGHT"
    }
  }

  const currentConfig = gaugeConfigs[activeGauge]

  return (
    <CardSpotlight
      className="p-6 sm:p-8 rounded-none bg-white border-2 border-black text-black text-left"
      dotColors={[[0, 0, 0], [100, 100, 100]]}
    >
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-8 pb-4 border-b-2 border-black">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-[#f3d400] text-black px-2 py-0.5 text-xs font-mono font-black uppercase tracking-widest border-2 border-black">
              02. AVIONICS
            </span>
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#666666]">
              THREEUI WEBGL DIAGNOSTICS
            </span>
          </div>

          <h3 className="font-sans font-black text-2xl sm:text-3xl text-black tracking-tight uppercase">
            Aviation Telemetry Cockpit
          </h3>
          <p className="text-xs text-[#666666] font-mono uppercase mt-1">
            Real-time WebGL diagnostic instrumentation monitoring inference latency, corridor throughput, and conformal bounds
          </p>
        </div>

        {/* Live Uplink Status Badge */}
        <div className="flex items-center gap-3 bg-neutral-100 border-2 border-black px-4 py-2 font-mono">
          <div className="w-5 h-5 flex items-center justify-center">
            <UplinkLoader className="w-4 h-4" />
          </div>
          <div className="text-left font-mono">
            <span className="text-[10px] text-[#666666] block uppercase tracking-wider">TELEMETRY UPLINK</span>
            <span className="text-xs text-black font-bold uppercase">
              CORRIDOR {corridorCode} ONLINE
            </span>
          </div>
        </div>
      </div>

      {/* Main Cockpit Display Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left: 3D Gauge Render Box */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center bg-[#F2F2F2] border-2 border-black p-6 relative">
          <div className="w-full flex items-center justify-between text-xs font-mono mb-3 pb-2 border-b border-black/20">
            <span className="font-bold text-black uppercase">INSTRUMENT DECK</span>
            <span className="text-black font-black uppercase">{currentConfig.status}</span>
          </div>

          {/* ThreeUI 3D Gauge Frame */}
          <div className="relative w-full aspect-square max-w-[280px] sm:max-w-[320px] overflow-hidden border-2 border-black bg-black">
            {!showArcVisualizer ? (
              <PerformanceGauges
                key={activeGauge}
                variant={activeGauge}
                mode="dark"
                className="w-full h-full"
              />
            ) : (
              <PredictiveArcCanvas
                mode="dark"
                className="w-full h-full"
              />
            )}
            
            {/* Overlay readout */}
            <div className="absolute bottom-0 inset-x-0 bg-black/90 text-white border-t border-white/20 p-2.5 flex items-center justify-between text-xs font-mono">
              <span className="text-[#999999] uppercase">{currentConfig.label}:</span>
              <span className="font-bold text-white">{currentConfig.metric}</span>
            </div>
          </div>

          {/* Toggle between Gauge and Arc visualizer */}
          <div className="mt-5 flex items-center border-2 border-black divide-x-2 divide-black w-full text-center">
            <button
              onClick={() => setShowArcVisualizer(false)}
              className={`flex-1 py-2 text-xs font-bold uppercase font-mono transition-colors cursor-pointer ${
                !showArcVisualizer
                  ? "bg-[#f3d400] text-black font-black"
                  : "bg-white text-black hover:bg-[#F2F2F2]"
              }`}
            >
              3D Instrument Gauge
            </button>
            <button
              onClick={() => setShowArcVisualizer(true)}
              className={`flex-1 py-2 text-xs font-bold uppercase font-mono transition-colors cursor-pointer ${
                showArcVisualizer
                  ? "bg-[#f3d400] text-black font-black"
                  : "bg-white text-black hover:bg-[#F2F2F2]"
              }`}
            >
              Predictive Trajectory Arc
            </button>
          </div>
        </div>

        {/* Right: Gauge Variant Selector & Avionics Telemetry Specs */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
          <div className="text-xs font-mono font-bold text-black uppercase tracking-widest pb-1 border-b-2 border-black">
            SELECT TELEMETRY CHANNEL:
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(Object.keys(gaugeConfigs) as GaugeVariant[]).map((key) => {
              const cfg = gaugeConfigs[key]
              const isSelected = activeGauge === key

              return (
                <button
                  key={key}
                  onClick={() => {
                    setActiveGauge(key)
                    setShowArcVisualizer(false)
                  }}
                  className={`text-left p-4 border-2 transition-colors cursor-pointer rounded-none ${
                    isSelected
                      ? "bg-[#f3d400] text-black border-2 border-black font-black"
                      : "bg-[#F2F2F2] text-black border-black hover:bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono uppercase font-bold tracking-wider opacity-70">
                      CHANNEL [{key.toUpperCase()}]
                    </span>
                    {isSelected && (
                      <span className="w-2 h-2 bg-black inline-block"></span>
                    )}
                  </div>
                  <span className="font-sans font-black text-2xl block tracking-tight">
                    {cfg.metric}
                  </span>
                  <span className="text-xs font-bold uppercase block mt-1">
                    {cfg.label}
                  </span>
                  <span className="text-[10px] opacity-70 font-mono block mt-0.5">
                    {cfg.sublabel}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Telemetry Architecture Readout Box */}
          <div className="bg-[#F2F2F2] border-2 border-black p-4 text-xs font-mono space-y-3 mt-2">
            <div className="flex items-center justify-between text-black font-bold pb-2 border-b border-black/20">
              <span className="uppercase">AVIONICS SHADER SPECIFICATION</span>
              <span className="text-black">@DESIGNCODEIO/THREEUI</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
              <div>
                <span className="text-[#666666] block uppercase">ENGINE:</span>
                <span className="font-bold text-black">WebGL 60FPS</span>
              </div>
              <div>
                <span className="text-[#666666] block uppercase">COVERAGE:</span>
                <span className="font-bold text-black">95% Conformal</span>
              </div>
              <div>
                <span className="text-[#666666] block uppercase">CORRIDOR:</span>
                <span className="font-bold text-black">IN-{corridorCode.replace("-", "")}</span>
              </div>
              <div>
                <span className="text-[#666666] block uppercase">AUTHORITY:</span>
                <span className="font-bold text-black">MoSPI India</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </CardSpotlight>
  )
}
