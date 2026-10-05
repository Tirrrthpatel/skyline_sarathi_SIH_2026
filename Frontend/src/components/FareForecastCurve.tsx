import { useState, useRef } from "react"
import type { ForecastPoint } from "@/types/aviation"

interface FareForecastCurveProps {
  data: ForecastPoint[]
}

export function FareForecastCurve({ data }: FareForecastCurveProps) {
  const [activePoint, setActivePoint] = useState<ForecastPoint | null>(null)
  const [hoverX, setHoverX] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  if (data.length === 0) {
    return (
      <div className="p-6 sm:p-8 rounded-none bg-white dark:bg-black border-2 border-black dark:border-white text-black dark:text-white">
        <h3 className="font-black text-xl uppercase">Fare history unavailable</h3>
        <p className="mt-2 text-sm font-mono text-neutral-500 dark:text-neutral-400">
          No historical fare series is available for this route.
        </p>
      </div>
    )
  }

  // Chart dimensions in SVG coordinates
  const width = 800
  const height = 280
  const padding = { top: 30, right: 35, bottom: 45, left: 65 }

  // Y-axis fixed domain
  const maxFareInData = Math.max(...data.map((d) => d.fare))
  const yMax = maxFareInData > 9500 ? Math.ceil(maxFareInData / 2000) * 2000 : 10000
  const yMin = 3000
  const yMid = 7000

  // Coordinate mapping
  const getX = (index: number) => {
    const usableWidth = width - padding.left - padding.right
    return padding.left + (index / (data.length - 1)) * usableWidth
  }

  const getY = (fare: number) => {
    const usableHeight = height - padding.top - padding.bottom
    const normalized = (fare - yMin) / (yMax - yMin)
    return height - padding.bottom - normalized * usableHeight
  }

  // Construct SVG path points
  const points = data.map((d, i) => ({
    x: getX(i),
    y: getY(d.fare),
    data: d
  }))

  const pathD = points.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`
    const prev = points[i - 1]
    const cx1 = prev.x + (p.x - prev.x) / 2
    const cy1 = prev.y
    const cx2 = prev.x + (p.x - prev.x) / 2
    const cy2 = p.y
    return `${acc} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${p.x} ${p.y}`
  }, "")

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding.bottom} L ${points[0].x} ${height - padding.bottom} Z`

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const mouseSvgX = ((e.clientX - rect.left) / rect.width) * width
    setHoverX(mouseSvgX)

    let closest = points[0]
    let minDist = Math.abs(mouseSvgX - points[0].x)
    for (const p of points) {
      const dist = Math.abs(mouseSvgX - p.x)
      if (dist < minDist) {
        minDist = dist
        closest = p
      }
    }
    setActivePoint(closest.data)
  }

  const handleMouseLeave = () => {
    setActivePoint(null)
    setHoverX(null)
  }

  const tooltipLeftPct = hoverX !== null
    ? Math.min(82, Math.max(18, (hoverX / width) * 100))
    : 50

  return (
    <div className="p-6 sm:p-8 rounded-none bg-white dark:bg-black border-2 border-black dark:border-white text-black dark:text-white text-left transition-colors duration-150">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b-2 border-black dark:border-white">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-[#f3d400] text-black border-2 border-black px-2 py-0.5 text-xs font-mono font-black uppercase tracking-widest">
              03. FORECAST
            </span>
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
              30-DAY DYNAMIC PROJECTION
            </span>
          </div>

          <h3 className="font-sans font-black text-xl sm:text-2xl text-black dark:text-white tracking-tight uppercase">
            Fare Volatility Curve
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono uppercase mt-0.5">
            Historical Actuals vs. Advance Algorithmic Pricing Vector
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono font-bold uppercase">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-black dark:bg-white inline-block"></span>
            <span>PROJECTION</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-[#f3d400] border border-black inline-block"></span>
            <span>CURRENT DAY</span>
          </div>
        </div>
      </div>

      {/* SVG Chart Container */}
      <div ref={containerRef} className="relative w-full aspect-[21/9] sm:aspect-[24/9] min-h-[220px]">
        
        {/* Clamped Hover Tooltip */}
        {activePoint && (
          <div
            style={{ left: `${tooltipLeftPct}%` }}
            className="absolute top-2 -translate-x-1/2 pointer-events-none z-20 bg-black dark:bg-white text-white dark:text-black px-4 py-2.5 text-xs border-2 border-black dark:border-white rounded-none min-w-[170px]"
          >
            <div className="flex items-center justify-between text-[11px] font-mono border-b border-white/20 dark:border-black/20 pb-1 mb-1">
              <span>{activePoint.dateStr}</span>
              <span className={`px-1.5 py-0.5 font-bold uppercase ${
                activePoint.isToday ? "bg-[#f3d400] text-black border border-black font-black" : "text-neutral-400 dark:text-neutral-600"
              }`}>
                {activePoint.status}
              </span>
            </div>
            <div className="flex items-baseline justify-between font-mono">
              <span className="text-[11px] text-neutral-400 dark:text-neutral-600 uppercase">Projected:</span>
              <span className="font-bold text-sm text-white dark:text-black">
                ₹{activePoint.fare.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        )}

        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible select-none cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Grid lines & Y-Axis Labels: ₹10K, ₹7K, ₹4K */}
          {[yMax, yMid, yMin].map((val) => {
            const y = getY(val)
            return (
              <g key={val}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  className="stroke-neutral-300 dark:stroke-neutral-800"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={padding.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-black dark:fill-white"
                  fontSize="11"
                  fontFamily="var(--font-mono)"
                  fontWeight="700"
                >
                  ₹{val >= 1000 ? `${val / 1000}K` : val}
                </text>
              </g>
            )
          })}

          {/* Area Fill */}
          <path d={areaD} className="fill-black/5 dark:fill-white/10" />

          {/* Main Forecast Line */}
          <path
            d={pathD}
            fill="none"
            className="stroke-black dark:stroke-white"
            strokeWidth="3"
            strokeLinecap="square"
            strokeLinejoin="miter"
          />

          {/* Active Hover Guide Line */}
          {hoverX !== null && (
            <line
              x1={hoverX}
              y1={padding.top}
              x2={hoverX}
              y2={height - padding.bottom}
              className="stroke-black dark:stroke-white"
              strokeWidth="1.5"
              strokeDasharray="2 2"
            />
          )}

          {/* Data Points */}
          {points.map((p, i) => (
            <g key={i}>
              <rect
                x={p.x - (p.data.isToday ? 5 : 3.5)}
                y={p.y - (p.data.isToday ? 5 : 3.5)}
                width={p.data.isToday ? 10 : 7}
                height={p.data.isToday ? 10 : 7}
                fill={p.data.isToday ? "#f3d400" : "currentColor"}
                stroke={p.data.isToday ? "#000000" : "none"}
                strokeWidth={p.data.isToday ? 1.5 : 0}
                className={p.data.isToday ? "" : "text-neutral-400 dark:text-neutral-600"}
              />
              <text
                x={p.x}
                y={height - padding.bottom + 22}
                textAnchor="middle"
                className="fill-neutral-500 dark:fill-neutral-400 font-mono text-[10px] font-bold"
              >
                {p.data.dateStr.split(" ")[0]}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  )
}
