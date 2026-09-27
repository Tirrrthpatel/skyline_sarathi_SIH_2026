import { useEffect, useRef, useState } from "react"
import type { Airport } from "@/types/aviation"
import { useTheme } from "@/components/theme-provider"
import { Layers, Maximize2, Minimize2, Navigation, Compass, Globe, Plane, Radio } from "lucide-react"

interface RouteMapProps {
  originAirport: Airport
  destinationAirport: Airport
  distanceKm: number
  bearing: number
}

type MapStyle = "default" | "satellite" | "osm"

// Spherical Great Circle Geodesic point interpolation
function getGreatCirclePoints(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  numPoints = 50
): [number, number][] {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const toDeg = (rad: number) => (rad * 180) / Math.PI
  const rLat1 = toRad(lat1)
  const rLon1 = toRad(lon1)
  const rLat2 = toRad(lat2)
  const rLon2 = toRad(lon2)

  const d =
    2 *
    Math.asin(
      Math.sqrt(
        Math.pow(Math.sin((rLat1 - rLat2) / 2), 2) +
          Math.cos(rLat1) * Math.cos(rLat2) * Math.pow(Math.sin((rLon1 - rLon2) / 2), 2)
      )
    )

  if (d === 0 || isNaN(d)) return [[lat1, lon1]]

  const points: [number, number][] = []
  for (let i = 0; i <= numPoints; i++) {
    const f = i / numPoints
    const A = Math.sin((1 - f) * d) / Math.sin(d)
    const B = Math.sin(f * d) / Math.sin(d)
    const x = A * Math.cos(rLat1) * Math.cos(rLon1) + B * Math.cos(rLat2) * Math.cos(rLon2)
    const y = A * Math.cos(rLat1) * Math.sin(rLon1) + B * Math.cos(rLat2) * Math.sin(rLon2)
    const z = A * Math.sin(rLat1) + B * Math.sin(rLat2)
    const lat = toDeg(Math.atan2(z, Math.sqrt(x * x + y * y)))
    const lon = toDeg(Math.atan2(y, x))
    points.push([lat, lon])
  }
  return points
}

export function RouteMap({
  originAirport,
  destinationAirport,
  distanceKm,
  bearing,
}: RouteMapProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const [mapStyle, setMapStyle] = useState<MapStyle>("default")
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [leafletLoaded, setLeafletLoaded] = useState(false)

  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const tileLayerRef = useRef<any>(null)
  const routeLayerRef = useRef<any>(null)
  const markersLayerRef = useRef<any>(null)

  const distanceNM = Math.round(distanceKm * 0.539957)
  const estFlightMinutes = Math.round((distanceKm / 780) * 60 + 25)
  const hours = Math.floor(estFlightMinutes / 60)
  const mins = estFlightMinutes % 60
  const eteFormatted = `${hours}h ${mins}m`

  // Base Tile URLs provided by user specifications
  const getTileUrl = (style: MapStyle, dark: boolean) => {
    switch (style) {
      case "satellite":
        return "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
      case "osm":
        return "https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      case "default":
      default:
        // Aviation Vector CartoDB: light in light mode, dark in dark mode
        return dark
          ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
    }
  }

  const getAttribution = (style: MapStyle) => {
    switch (style) {
      case "satellite":
        return "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS"
      case "osm":
        return "&copy; OpenStreetMap contributors"
      case "default":
      default:
        return '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap'
    }
  }

  // Check if Leaflet is available on window
  useEffect(() => {
    const checkLeaflet = () => {
      const L = (window as any).L
      if (L && typeof L.map === "function") {
        setLeafletLoaded(true)
      } else {
        setTimeout(checkLeaflet, 200)
      }
    }
    checkLeaflet()
  }, [])

  // Initialize or reconfigure Leaflet Map
  useEffect(() => {
    const L = (window as any).L
    if (!leafletLoaded || !L || !mapContainerRef.current) return

    // Clean up previous instance if container was reused
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
        minZoom: 3,
        maxZoom: 18,
      })

      // Add Zoom Control at bottom right
      L.control.zoom({ position: "bottomright" }).addTo(map)

      mapInstanceRef.current = map
    }

    const map = mapInstanceRef.current

    // Update Tile Layer
    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current)
    }

    const tileUrl = getTileUrl(mapStyle, isDark)
    const attribution = getAttribution(mapStyle)

    tileLayerRef.current = L.tileLayer(tileUrl, {
      attribution,
      maxZoom: 18,
      subdomains: "abcd",
    }).addTo(map)

    // Clear previous vector & marker layers
    if (routeLayerRef.current) {
      map.removeLayer(routeLayerRef.current)
    }
    if (markersLayerRef.current) {
      map.removeLayer(markersLayerRef.current)
    }

    const routeGroup = L.featureGroup()
    const markersGroup = L.featureGroup()

    // 1. Calculate Geodesic Flight Route Points
    const arcPoints = getGreatCirclePoints(
      originAirport.lat,
      originAirport.lng,
      destinationAirport.lat,
      destinationAirport.lng,
      60
    )

    // Shadow / glow path for high visibility on both satellite and vector
    L.polyline(arcPoints, {
      color: isDark ? "#000000" : "#ffffff",
      weight: 6,
      opacity: 0.8,
      lineCap: "round",
    }).addTo(routeGroup)

    // Main Geodesic Flight Arc in Pure Black / White
    L.polyline(arcPoints, {
      color: isDark ? "#FFFFFF" : "#000000",
      weight: 3.5,
      dashArray: "8, 6",
      opacity: 1,
      lineCap: "round",
    }).addTo(routeGroup)

    // 2. Custom Swiss HTML DivIcon Markers
    const createSwissIcon = (iata: string, _city: string, isOrigin: boolean) => {
      const bg = "#000000"
      const label = isOrigin ? "ORIGIN" : "DESTINATION"
      const html = `
        <div style="position: relative; transform: translate(-50%, -100%); pointer-events: auto;">
          <div style="
            background: ${bg};
            color: #FFFFFF;
            border: 2px solid #FFFFFF;
            padding: 2px 6px;
            font-family: monospace;
            font-size: 10px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.35);
            display: flex;
            align-items: center;
            gap: 4px;
            white-space: nowrap;
          ">
            <span style="color: #FFFFFF; font-size: 9px;">${isOrigin ? "▲" : "●"}</span>
            <span>${iata}</span>
            <span style="opacity: 0.8; font-size: 8px;">${label}</span>
          </div>
          <div style="
            width: 2px;
            height: 8px;
            background: #000000;
            border-left: 1px solid #FFFFFF;
            margin: 0 auto;
          "></div>
        </div>
      `
      return L.divIcon({
        html,
        className: "swiss-custom-marker",
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      })
    }

    // Origin Marker & Popup
    const originMarker = L.marker([originAirport.lat, originAirport.lng], {
      icon: createSwissIcon(originAirport.code, originAirport.city, true),
    }).addTo(markersGroup)

    originMarker.bindPopup(`
      <div style="font-family: monospace; padding: 6px; font-size: 11px; text-transform: uppercase;">
        <div style="font-weight: 900; color: #000; border-bottom: 2px solid #000; padding-bottom: 3px; margin-bottom: 4px;">
          ${originAirport.code} • ${originAirport.city}
        </div>
        <div><strong>Airport:</strong> ${originAirport.airport}</div>
        <div><strong>Coordinates:</strong> ${originAirport.lat.toFixed(4)}°N, ${originAirport.lng.toFixed(4)}°E</div>
        <div><strong>Runway Hub:</strong> Active Departure Terminal</div>
      </div>
    `)

    // Destination Marker & Popup
    const destMarker = L.marker([destinationAirport.lat, destinationAirport.lng], {
      icon: createSwissIcon(destinationAirport.code, destinationAirport.city, false),
    }).addTo(markersGroup)

    destMarker.bindPopup(`
      <div style="font-family: monospace; padding: 6px; font-size: 11px; text-transform: uppercase;">
        <div style="font-weight: 900; color: #000; border-bottom: 2px solid #000; padding-bottom: 3px; margin-bottom: 4px;">
          ${destinationAirport.code} • ${destinationAirport.city}
        </div>
        <div><strong>Airport:</strong> ${destinationAirport.airport}</div>
        <div><strong>Coordinates:</strong> ${destinationAirport.lat.toFixed(4)}°N, ${destinationAirport.lng.toFixed(4)}°E</div>
        <div><strong>Arrival Hub:</strong> Scheduled Telemetry Gate</div>
      </div>
    `)

    // 3. In-Flight Aircraft Marker at midpoint with bearing rotation
    const midIndex = Math.floor(arcPoints.length / 2)
    const midPoint = arcPoints[midIndex]
    if (midPoint) {
      const planeHtml = `
        <div style="position: relative; transform: translate(-50%, -50%);">
          <div style="
            width: 32px;
            height: 32px;
            background: #000000;
            border: 2px solid #FFFFFF;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.4);
            transform: rotate(${bearing - 45}deg);
          ">
            <svg width="18" height="18" viewBox="0 0 32 32" fill="#FFFFFF">
              <path d="M26 18v-2.5l-10-6V3c0-.8-.7-1.5-1.5-1.5S13 2.2 13 3v6.5L3 15.5V18l10-3v6.5l-2.5 1.5V26l4-1.2 4 1.2v-3L16 21.5v-6.5L26 18z"/>
            </svg>
          </div>
          <div style="
            position: absolute;
            top: -18px;
            left: 50%;
            transform: translateX(-50%);
            background: #000000;
            color: #FFFFFF;
            font-family: monospace;
            font-size: 8px;
            font-weight: 900;
            padding: 1px 4px;
            white-space: nowrap;
            border: 1px solid #FFFFFF;
          ">
            FL360 • 460KT
          </div>
        </div>
      `
      const planeIcon = L.divIcon({
        html: planeHtml,
        className: "aircraft-midpoint-marker",
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      })

      const planeMarker = L.marker(midPoint, { icon: planeIcon }).addTo(markersGroup)
      planeMarker.bindPopup(`
        <div style="font-family: monospace; padding: 6px; font-size: 11px; text-transform: uppercase;">
          <div style="font-weight: 900; color: #000; border-bottom: 2px solid #000; padding-bottom: 3px; margin-bottom: 4px;">
            CRUISE TELEMETRY // EN ROUTE
          </div>
          <div><strong>Altitude:</strong> FL360 (36,000 FT)</div>
          <div><strong>Ground Speed:</strong> ~850 KM/H (460 KTS)</div>
          <div><strong>Track Heading:</strong> ${bearing}° TRUE</div>
          <div><strong>ETE:</strong> ${eteFormatted}</div>
        </div>
      `)
    }

    routeGroup.addTo(map)
    markersGroup.addTo(map)
    routeLayerRef.current = routeGroup
    markersLayerRef.current = markersGroup

    // Fit bounds snugly around both airports with padding
    const bounds = L.latLngBounds(
      [originAirport.lat, originAirport.lng],
      [destinationAirport.lat, destinationAirport.lng]
    )
    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 8 })

    // Invalidate size after layout stabilization
    const timer = setTimeout(() => {
      map.invalidateSize()
    }, 150)

    return () => clearTimeout(timer)
  }, [
    leafletLoaded,
    originAirport,
    destinationAirport,
    distanceKm,
    bearing,
    mapStyle,
    isDark,
    eteFormatted,
  ])

  // Recenter Map
  const handleRecenter = () => {
    if (!mapInstanceRef.current) return
    const L = (window as any).L
    if (!L) return
    const bounds = L.latLngBounds(
      [originAirport.lat, originAirport.lng],
      [destinationAirport.lat, destinationAirport.lng]
    )
    mapInstanceRef.current.fitBounds(bounds, { padding: [60, 60] })
  }

  return (
    <div
      className={`p-6 sm:p-8 rounded-none bg-white dark:bg-black border-2 border-black dark:border-white text-black dark:text-white text-left transition-colors duration-150 ${
        isFullscreen ? "fixed inset-4 z-50 overflow-auto flex flex-col" : ""
      }`}
    >
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b-2 border-black dark:border-white">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-black dark:bg-black text-white border border-black dark:border-white px-2 py-0.5 text-xs font-mono font-bold uppercase tracking-widest">
              05. AIRSPACE MAP
            </span>
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-black dark:text-white animate-pulse" />
              <span>LEAFLET AVIATION TILES</span>
            </span>
          </div>

          <h3 className="font-sans font-black text-xl sm:text-2xl text-black dark:text-white tracking-tight uppercase">
            Corridor Trajectory & Airspace Map
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono uppercase mt-0.5">
            Orthodromic Geodesic Arc • Dynamic Aviation Vector & Esri Satellite Layers
          </p>
        </div>

        {/* Action Controls & Metric Badges */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs font-bold uppercase">
          <span className="px-2.5 py-1 bg-neutral-100 dark:bg-neutral-900 border border-black dark:border-white text-black dark:text-white">
            {distanceKm.toLocaleString("en-IN")} KM ({distanceNM} NM)
          </span>
          <span className="px-2.5 py-1 bg-black dark:bg-white text-white dark:text-black">
            {bearing}° BRG
          </span>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 border border-black dark:border-white bg-white dark:bg-black hover:bg-neutral-100 dark:hover:bg-neutral-900 cursor-pointer"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Map"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Map Style Selector Bar (Default Vector, Esri Satellite, OpenStreetMap) */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 font-mono text-xs">
        <div className="flex items-center border-2 border-black dark:border-white divide-x-2 divide-black dark:divide-white">
          <button
            onClick={() => setMapStyle("default")}
            className={`px-3 py-1.5 font-bold uppercase transition-colors cursor-pointer flex items-center gap-1.5 ${
              mapStyle === "default"
                ? "bg-[#f3d400] text-black font-black"
                : "bg-white dark:bg-black text-black dark:text-white hover:bg-[#f3d400] hover:text-black"
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>DEFAULT (AVIATION)</span>
          </button>

          <button
            onClick={() => setMapStyle("satellite")}
            className={`px-3 py-1.5 font-bold uppercase transition-colors cursor-pointer flex items-center gap-1.5 ${
              mapStyle === "satellite"
                ? "bg-[#f3d400] text-black font-black"
                : "bg-white dark:bg-black text-black dark:text-white hover:bg-[#f3d400] hover:text-black"
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-black dark:text-white" />
            <span>SATELLITE (ESRI)</span>
          </button>

          <button
            onClick={() => setMapStyle("osm")}
            className={`px-3 py-1.5 font-bold uppercase transition-colors cursor-pointer flex items-center gap-1.5 ${
              mapStyle === "osm"
                ? "bg-[#f3d400] text-black font-black"
                : "bg-white dark:bg-black text-black dark:text-white hover:bg-[#f3d400] hover:text-black"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>OPENSTREETMAP</span>
          </button>
        </div>

        <button
          onClick={handleRecenter}
          className="px-3 py-1.5 bg-neutral-100 dark:bg-neutral-900 border-2 border-black dark:border-white text-black dark:text-white font-bold uppercase tracking-wider hover:bg-[#f3d400] hover:text-black dark:hover:bg-[#f3d400] dark:hover:text-black transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <Compass className="w-3.5 h-3.5" />
          <span>RECENTER CORRIDOR</span>
        </button>
      </div>

      {/* Interactive Leaflet Map Container */}
      <div
        className={`relative w-full border-2 border-black dark:border-white bg-neutral-100 dark:bg-neutral-950 overflow-hidden ${
          isFullscreen ? "flex-1 min-h-[400px]" : "aspect-[5/4] sm:aspect-[16/10]"
        }`}
      >
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Fallback Static SVG in case Leaflet script is still fetching */}
        {!leafletLoaded && (
          <div className="absolute inset-0 z-0 flex items-center justify-center bg-neutral-100 dark:bg-neutral-900 p-6 text-center font-mono">
            <div>
              <Plane className="w-8 h-8 text-black dark:text-white animate-bounce mx-auto mb-2" />
              <p className="text-xs uppercase font-bold text-black dark:text-white">
                Initializing Leaflet Airspace Tiles...
              </p>
            </div>
          </div>
        )}

        {/* Overlay Badges */}
        <div className="absolute top-3 left-3 z-[400] flex flex-col gap-1.5 pointer-events-none">
          <div className="px-2.5 py-1 bg-[#f3d400] text-black border-2 border-black font-mono text-[10px] font-black uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 bg-black"></span>
            <span>CORRIDOR: {originAirport.code} ➔ {destinationAirport.code}</span>
          </div>
          <div className="px-2.5 py-1 bg-white/90 dark:bg-black/90 text-black dark:text-white border border-black dark:border-white font-mono text-[9px] font-bold uppercase">
            STYLE: {mapStyle.toUpperCase()} • ETE: {eteFormatted}
          </div>
        </div>

        {/* Bottom Legend Overlay */}
        <div className="absolute bottom-3 left-3 z-[400] px-3 py-1.5 bg-white/95 dark:bg-black/95 border-2 border-black dark:border-white text-[10px] text-black dark:text-white font-mono flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-[#f3d400] inline-block border border-black"></span>
            <span>{originAirport.code} ({originAirport.city})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-neutral-400 dark:bg-neutral-300 inline-block border border-black dark:border-white"></span>
            <span>{destinationAirport.code} ({destinationAirport.city})</span>
          </div>
        </div>
      </div>

      {/* Comprehensive Airway Telemetry Readout Grid */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-left">
        <div className="p-3 bg-neutral-100 dark:bg-neutral-900 border border-black dark:border-white">
          <span className="text-[10px] uppercase text-neutral-500 font-bold block mb-0.5">
            Great Circle Track
          </span>
          <span className="text-sm font-black text-black dark:text-white uppercase">
            {distanceKm.toLocaleString("en-IN")} KM
          </span>
          <span className="text-[9px] text-neutral-500 block">{distanceNM} Nautical Miles</span>
        </div>

        <div className="p-3 bg-neutral-100 dark:bg-neutral-900 border border-black dark:border-white">
          <span className="text-[10px] uppercase text-neutral-500 font-bold block mb-0.5">
            True Track Bearing
          </span>
          <span className="text-sm font-black text-black dark:text-white uppercase">
            {bearing}° HEADING
          </span>
          <span className="text-[9px] text-neutral-500 block">Magnetic Var: +1.2°</span>
        </div>

        <div className="p-3 bg-neutral-100 dark:bg-neutral-900 border border-black dark:border-white">
          <span className="text-[10px] uppercase text-neutral-500 font-bold block mb-0.5">
            Standard En Route Time
          </span>
          <span className="text-sm font-black text-black dark:text-white uppercase">
            {eteFormatted}
          </span>
          <span className="text-[9px] text-neutral-500 block">Cruise FL360 @ 460KT</span>
        </div>

        <div className="p-3 bg-neutral-100 dark:bg-neutral-900 border border-black dark:border-white">
          <span className="text-[10px] uppercase text-neutral-500 font-bold block mb-0.5">
            Airspace FIR Sector
          </span>
          <span className="text-sm font-black text-black dark:text-white uppercase">
            {originAirport.code === "DEL" ? "VIDF ➔ VOBL" : `${originAirport.code} ➔ ${destinationAirport.code}`}
          </span>
          <span className="text-[9px] text-neutral-500 block">DGCA Controlled Airway</span>
        </div>
      </div>
    </div>
  )
}
