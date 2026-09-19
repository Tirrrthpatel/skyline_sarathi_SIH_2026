import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Layers, Maximize2, Compass, Plane, ZoomIn, ZoomOut } from 'lucide-react';

// Tile Layer Configurations (100% Free, Zero API Key Required, Works on Cloudflare Tunnel & Mobile)
const MAP_LAYERS = {
  vector: {
    name: 'Aviation Vector',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    options: {
      subdomains: 'abcd',
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap &copy; CARTO',
    },
  },
  satellite: {
    name: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    options: {
      maxZoom: 18,
      attribution: '&copy; Esri &copy; Earthstar Geographics',
    },
  },
  osm: {
    name: 'OpenStreetMap',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    options: {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    },
  },
};

/**
 * Computes intermediate geodesic curve points for a great-circle flight trajectory
 */
function getCurvedFlightPath(start, end, numPoints = 60) {
  const points = [];
  const lat1 = start.lat;
  const lng1 = start.lng;
  const lat2 = end.lat;
  const lng2 = end.lng;

  // Midpoint with great-circle deflection
  const midLat = (lat1 + lat2) / 2 + (lng2 - lng1) * 0.12;
  const midLng = (lng1 + lng2) / 2 - Math.abs(lat2 - lat1) * 0.10;

  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    // Quadratic Bezier interpolation
    const lat = (1 - t) * (1 - t) * lat1 + 2 * (1 - t) * t * midLat + t * t * lat2;
    const lng = (1 - t) * (1 - t) * lng1 + 2 * (1 - t) * t * midLng + t * t * lng2;
    points.push([lat, lng]);
  }
  return points;
}

/**
 * Calculates bearing angle in degrees between two coordinate points
 */
function getBearing(startLat, startLng, endLat, endLng) {
  const y = Math.sin((endLng - startLng) * (Math.PI / 180)) * Math.cos(endLat * (Math.PI / 180));
  const x =
    Math.cos(startLat * (Math.PI / 180)) * Math.sin(endLat * (Math.PI / 180)) -
    Math.sin(startLat * (Math.PI / 180)) *
      Math.cos(endLat * (Math.PI / 180)) *
      Math.cos((endLng - startLng) * (Math.PI / 180));
  const bearing = (Math.atan2(y, x) * 180) / Math.PI;
  return (bearing + 360) % 360;
}

export default function GoogleRouteMap({
  origin = { code: 'DEL', city: 'Delhi', lat: 28.5562, lng: 77.1000 },
  destination = { code: 'BOM', city: 'Mumbai', lat: 19.0896, lng: 72.8656 },
  allAirports = {},
  height = '100%',
  className = '',
  showAllHubs = true,
  onSelectAirport,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const flightPathRef = useRef(null);
  const planeMarkerRef = useRef(null);
  const airportMarkersRef = useRef([]);
  const animFrameIdRef = useRef(null);

  const [activeLayer, setActiveLayer] = useState('vector');

  // Safe fallback coordinates
  const safeOrigin = {
    code: origin?.code || 'DEL',
    city: origin?.city || 'Delhi',
    lat: origin?.lat ?? 28.5562,
    lng: origin?.lng ?? 77.1000,
  };
  const safeDest = {
    code: destination?.code || 'BOM',
    city: destination?.city || 'Mumbai',
    lat: destination?.lat ?? 19.0896,
    lng: destination?.lng ?? 72.8656,
  };

  // 1. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Destroy existing instance if container changed
    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.remove();
      } catch (_) {}
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [21.7679, 78.8718],
      zoom: 5,
      zoomControl: false,
      attributionControl: false,
      fadeAnimation: true,
      zoomAnimation: true,
    });

    // Add initial tile layer
    const layerConfig = MAP_LAYERS[activeLayer] || MAP_LAYERS.vector;
    const tileLayer = L.tileLayer(layerConfig.url, layerConfig.options).addTo(map);
    tileLayerRef.current = tileLayer;
    mapInstanceRef.current = map;

    // Invalidate size once container renders in DOM
    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 150);

    return () => {
      clearTimeout(timer);
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (_) {}
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 2. Handle Layer Switching (Vector / Satellite / OSM)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const layerConfig = MAP_LAYERS[activeLayer] || MAP_LAYERS.vector;
    tileLayerRef.current = L.tileLayer(layerConfig.url, layerConfig.options).addTo(map);
  }, [activeLayer]);

  // 3. Draw Route, Airport Markers & Animated Airplane
  const updateRoute = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // A. Clear existing markers & paths
    airportMarkersRef.current.forEach((m) => {
      try { map.removeLayer(m); } catch (_) {}
    });
    airportMarkersRef.current = [];

    if (flightPathRef.current) {
      try { map.removeLayer(flightPathRef.current); } catch (_) {}
      flightPathRef.current = null;
    }

    if (planeMarkerRef.current) {
      try { map.removeLayer(planeMarkerRef.current); } catch (_) {}
      planeMarkerRef.current = null;
    }

    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }

    // B. Add Background Network Hubs
    if (showAllHubs && allAirports) {
      Object.values(allAirports).forEach((hub) => {
        if (hub.code === safeOrigin.code || hub.code === safeDest.code) return;
        if (!hub.lat || !hub.lng) return;

        const hubIcon = L.divIcon({
          className: 'custom-hub-icon',
          html: `
            <div class="group relative flex items-center justify-center cursor-pointer">
              <div class="w-2.5 h-2.5 rounded-full bg-slate-400 border border-white shadow-sm transition-transform hover:scale-150"></div>
              <span class="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[8px] font-bold text-slate-600 bg-white/90 px-1 rounded shadow-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">${hub.code}</span>
            </div>
          `,
          iconSize: [12, 12],
          iconAnchor: [6, 6],
        });

        const hubMarker = L.marker([hub.lat, hub.lng], { icon: hubIcon }).addTo(map);
        hubMarker.on('click', () => {
          if (onSelectAirport) onSelectAirport(hub);
        });
        airportMarkersRef.current.push(hubMarker);
      });
    }

    // C. Origin Marker (Emerald Beacon)
    const originIcon = L.divIcon({
      className: 'origin-marker-icon',
      html: `
        <div class="flex flex-col items-center cursor-pointer">
          <div class="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-600 text-white font-bold text-[10px] font-mono shadow-md border border-white">
            <span class="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
            <span>${safeOrigin.code}</span>
          </div>
          <div class="w-2 h-2 -mt-1 rotate-45 bg-emerald-600 border-r border-b border-white"></div>
        </div>
      `,
      iconSize: [44, 30],
      iconAnchor: [22, 28],
    });
    const originMarker = L.marker([safeOrigin.lat, safeOrigin.lng], { icon: originIcon }).addTo(map);
    airportMarkersRef.current.push(originMarker);

    // D. Destination Marker (Blue Beacon)
    const destIcon = L.divIcon({
      className: 'dest-marker-icon',
      html: `
        <div class="flex flex-col items-center cursor-pointer">
          <div class="flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-600 text-white font-bold text-[10px] font-mono shadow-md border border-white">
            <span class="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
            <span>${safeDest.code}</span>
          </div>
          <div class="w-2 h-2 -mt-1 rotate-45 bg-blue-600 border-r border-b border-white"></div>
        </div>
      `,
      iconSize: [44, 30],
      iconAnchor: [22, 28],
    });
    const destMarker = L.marker([safeDest.lat, safeDest.lng], { icon: destIcon }).addTo(map);
    airportMarkersRef.current.push(destMarker);

    // E. Geodesic Flight Route Polyline
    const flightPoints = getCurvedFlightPath(safeOrigin, safeDest, 70);
    const flightPolyline = L.polyline(flightPoints, {
      color: '#0f172a',
      weight: 3.5,
      opacity: 0.88,
      lineCap: 'round',
    }).addTo(map);
    flightPathRef.current = flightPolyline;

    // F. Animated Airplane Icon along Geodesic Arc
    let stepIndex = 0;
    const totalSteps = flightPoints.length;

    const createPlaneIcon = (rotation) =>
      L.divIcon({
        className: 'animated-plane-icon',
        html: `
          <div style="transform: rotate(${rotation}deg); transform-origin: center;" class="flex items-center justify-center">
            <div class="w-7 h-7 rounded-full bg-slate-900 shadow-lg border border-white/80 flex items-center justify-center">
              <svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
              </svg>
            </div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

    const initialP1 = flightPoints[0];
    const initialP2 = flightPoints[1] || initialP1;
    const initialBearing = getBearing(initialP1[0], initialP1[1], initialP2[0], initialP2[1]);

    const planeMarker = L.marker(flightPoints[0], {
      icon: createPlaneIcon(initialBearing),
      interactive: false,
    }).addTo(map);
    planeMarkerRef.current = planeMarker;

    // Animation Loop
    let lastTime = performance.now();
    const animate = (currentTime) => {
      if (currentTime - lastTime > 45) {
        stepIndex = (stepIndex + 0.45) % totalSteps;
        const currentIdx = Math.floor(stepIndex);
        const nextIdx = (currentIdx + 1) % totalSteps;

        const p1 = flightPoints[currentIdx];
        const p2 = flightPoints[nextIdx];

        if (p1 && p2) {
          const t = stepIndex - currentIdx;
          const currentLat = p1[0] + (p2[0] - p1[0]) * t;
          const currentLng = p1[1] + (p2[1] - p1[1]) * t;
          const bearing = getBearing(p1[0], p1[1], p2[0], p2[1]);

          planeMarker.setLatLng([currentLat, currentLng]);
          planeMarker.setIcon(createPlaneIcon(bearing));
        }
        lastTime = currentTime;
      }
      animFrameIdRef.current = requestAnimationFrame(animate);
    };
    animFrameIdRef.current = requestAnimationFrame(animate);

    // G. Auto-fit bounds with safe padding
    try {
      map.fitBounds(
        [
          [safeOrigin.lat, safeOrigin.lng],
          [safeDest.lat, safeDest.lng],
        ],
        { padding: [50, 50], maxZoom: 8 }
      );
    } catch (_) {}
  }, [safeOrigin, safeDest, allAirports, showAllHubs, onSelectAirport]);

  useEffect(() => {
    if (mapInstanceRef.current) {
      updateRoute();
    }
  }, [updateRoute]);

  // Window resize observer to ensure map stays crisp and properly sized
  useEffect(() => {
    const handleResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Zoom controls
  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    }
  };

  const handleReset = () => {
    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.fitBounds(
          [
            [safeOrigin.lat, safeOrigin.lng],
            [safeDest.lat, safeDest.lng],
          ],
          { padding: [50, 50], maxZoom: 8 }
        );
      } catch (_) {}
    }
  };

  return (
    <div className={`relative w-full h-full rounded-2xl overflow-hidden ${className}`} style={{ height }}>
      {/* Leaflet Map DOM Node */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Map Controls */}
      <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
        <button
          onClick={handleZoomIn}
          className="w-7 h-7 rounded-lg bg-white/95 hover:bg-white text-slate-800 flex items-center justify-center shadow-md cursor-pointer transition-all hover:scale-105 active:scale-95 border border-slate-200"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleZoomOut}
          className="w-7 h-7 rounded-lg bg-white/95 hover:bg-white text-slate-800 flex items-center justify-center shadow-md cursor-pointer transition-all hover:scale-105 active:scale-95 border border-slate-200"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleReset}
          className="w-7 h-7 rounded-lg bg-white/95 hover:bg-white text-slate-800 flex items-center justify-center shadow-md cursor-pointer transition-all hover:scale-105 active:scale-95 border border-slate-200"
          title="Fit Route to Bounds"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Floating Map Type Selector (Vector / Satellite / OSM) */}
      <div className="absolute top-3 right-3 flex items-center gap-1 z-10 p-1 rounded-xl bg-white/90 border border-slate-200 shadow-md">
        {Object.entries(MAP_LAYERS).map(([key, layer]) => (
          <button
            key={key}
            onClick={() => setActiveLayer(key)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wide transition-all cursor-pointer ${
              activeLayer === key
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            {layer.name}
          </button>
        ))}
      </div>

      {/* Floating Route Badge Bottom Overlay - Transparent Glass with Black Text */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/85 border border-white/90 text-slate-900 backdrop-blur-md shadow-md pointer-events-auto text-[11px]">
          <div className="flex items-center gap-1.5 font-mono font-bold">
            <span className="text-emerald-700 font-bold">{safeOrigin.code}</span>
            <Plane className="w-3.5 h-3.5 text-slate-900 rotate-45" />
            <span className="text-blue-700 font-bold">{safeDest.code}</span>
          </div>
          <span className="text-slate-400">|</span>
          <span className="text-[10px] text-slate-900 font-semibold">{safeOrigin.city} → {safeDest.city}</span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/85 border border-white/90 text-[10px] text-slate-900 font-bold backdrop-blur-md shadow-sm pointer-events-auto">
          <Compass className="w-3 h-3 text-blue-600" />
          <span>Live Geodesic Telemetry</span>
        </div>
      </div>
    </div>
  );
}
