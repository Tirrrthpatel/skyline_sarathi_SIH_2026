# Skyline सारथी — Technology Stack Reference

This document provides a comprehensive overview of all technologies, frameworks, libraries, and architectural patterns used in the Skyline सारथी aviation fare prediction platform.

---

## 1. Frontend Architecture (`/frontend`)

### Core Framework & Build Tooling
- **React 18 (`v18.3.1`)**: Component-based UI library utilizing functional components, custom hooks, `useMemo` for derived fare calculations, `useCallback` for canvas drawing routines, and `forwardRef` / `useImperativeHandle` for programmatic scrollytelling navigation.
- **Vite 6 (`v6.1.0`)**: Modern build tool providing ESM development server, ultra-fast Hot Module Replacement (HMR), production code-splitting, and reverse proxying `/api` requests to the Python backend.

### Styling & Design System
- **Tailwind CSS (`v3.4.17`)**: Utility-first CSS framework customized with glassmorphism design tokens (`backdrop-blur-2xl`, translucent white/slate palettes, modern aviation styling).
- **PostCSS (`v8.5.1`) & Autoprefixer (`v10.4.20`)**: Automated CSS vendor prefixing and modern stylesheet compilation.

### Scrollytelling, Animations & Canvas
- **HTML5 2D Canvas**: 60 FPS hardware-composited canvas rendering 240 photographic camera trajectory frames with nearest-neighbor fallback, frame deduplication, and mobile-optimized 1x DPR scaling.
- **Lenis (`v1.1.20`)**: Smooth momentum scrolling library driving the 750vh scrollytelling camera movement while preserving natural mobile touch swiping.
- **Motion (`v12.4.7`)**: Hardware-accelerated transitions and subtle micro-animations for card entrances.
- **Canvas Confetti (`v1.9.4`)**: Celebratory visual feedback for interactive events.

### Geospatial & Mapping
- **Leaflet (`v1.9.4`)**: Mobile-friendly interactive mapping engine.
- **CartoDB Positron & Esri World Imagery**: Free, fast vector and satellite tile layers requiring zero API keys and immune to domain/referrer blocks over tunnels.
- **Geodesic Trajectory Calculation**: Real-time quadratic Bézier flight curve generation with animated airplane icons and airport hubs.

### Icons & Typography
- **Lucide React (`v0.475.0`)**: Comprehensive vector icon collection.
- **Google Fonts**:
  - *Space Grotesk*: Monospace-inspired technical headings and telemetry readouts.
  - *Playfair Display*: High-contrast editorial serif italic titles.
  - *Plus Jakarta Sans*: Highly readable modern sans-serif body copy.
  - *JetBrains Mono*: Cockpit telemetry and code data badges.

---

## 2. Backend Architecture (`/backend`)

### API & Server
- **Python 3.10+**: Core backend runtime.
- **FastAPI (`>=0.110.0`)**: Asynchronous, high-throughput REST API framework with automatic OpenAPI/Swagger documentation.
- **Uvicorn (`>=0.28.0`)**: ASGI web server running on `0.0.0.0:8000` with standard event loop and worker support.
- **Pydantic v2 (`>=2.6.0`)**: Strict schema validation and serialization for flight query parameters, prediction results, and health checks.

### Machine Learning & Data Science
- **Scikit-Learn (`>=1.4.0`)**: Machine learning framework for flight regression models.
- **Pandas (`>=2.2.0`)**: Tabular data manipulation and feature engineering for flight records.
- **NumPy (`>=1.26.0`)**: Vectorized matrix operations and numeric processing.
- **Joblib (`>=1.3.2`)**: Model serialization and dynamic loading of `.joblib`, `.pkl`, and `.pickle` model weights.
- **Modular ModelLoader**: Auto-detects custom trained models from `/backend/app/models/` or falls back to domain empirical calculations if no weights file is present.

---

## 3. Networking, Reverse Proxy & Tunneling

- **Vite Reverse Proxy**: Seamlessly proxies all frontend requests from `http://localhost:3000/api/*` to `http://localhost:8000/api/*`, eliminating CORS issues in both local and remote environments.
- **Cloudflare Tunnel (`cloudflared`)**: Creates public HTTPS endpoints (`*.trycloudflare.com`) via HTTP/2 protocol (`--protocol http2`) for testing on mobile devices and remote networks.
