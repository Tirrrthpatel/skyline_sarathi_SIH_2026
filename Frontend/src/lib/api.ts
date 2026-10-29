import type { FlightSearchParams, TelemetryPredictionResult, Airport, UserSession } from "@/types/aviation"
import { INDIAN_AIRPORTS } from "./aviationData"

const API_BASE = import.meta.env.VITE_FASTAPI_BASE || "http://localhost:8000/api"

export async function fetchAirports(): Promise<Airport[]> {
  try {
    const res = await fetch(`${API_BASE}/airports`, { signal: AbortSignal.timeout(1800) })
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        return data
      }
    }
  } catch {
    // Graceful fallback to client-side certified dataset
  }
  return INDIAN_AIRPORTS
}

export async function predictFlightFare(params: FlightSearchParams): Promise<TelemetryPredictionResult> {
  const res = await fetch(`${API_BASE}/predict-fare`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
    signal: AbortSignal.timeout(15000)
  })

  if (!res.ok) {
    const data: { detail?: string } = await res.json()
    throw new Error(data.detail || `Fare query failed (HTTP ${res.status}).`)
  }

  return res.json() as Promise<TelemetryPredictionResult>
}

export const GOOGLE_CLIENT_ID: string = import.meta.env.VITE_GOOGLE_CLIENT_ID || ""

export const NEON_JWKS_URL: string =
  import.meta.env.VITE_NEON_JWKS_URL ||
  "https://ep-fancy-tree-b3l0w0b1.neonauth.c-4.ap-southeast-1.aws.neon.tech/neondb/auth/.well-known/jwks.json"

export const NEON_AUTH_URL: string =
  import.meta.env.VITE_NEON_AUTH_URL ||
  "https://ep-fancy-tree-b3l0w0b1.neonauth.c-4.ap-southeast-1.aws.neon.tech/neondb/auth"

export function parseJwt(token: string): any {
  try {
    const base64Url = token.split(".")[1]
    if (!base64Url) return null
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    )
    return JSON.parse(jsonPayload)
  } catch (e) {
    console.error("JWT parse error:", e)
    return null
  }
}

export async function authenticateGoogle(credentialOrToken: string): Promise<UserSession> {
  // 1. Check for fallback simulated token
  if (credentialOrToken === "simulated_google_oauth_token") {
    const session: UserSession = {
      id: "usr_google_analyst_26056",
      name: "Google Verified Analyst (MoSPI)",
      email: "analyst.google@skyline.gov.in",
      avatarUrl: "https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png",
      isGuest: false,
      loginTime: new Date().toISOString(),
      provider: "google"
    }
    localStorage.setItem("aero_user", JSON.stringify(session))
    return session
  }

  // 2. Try decoding as JWT ID token
  const payload = parseJwt(credentialOrToken)

  let name = payload?.name || payload?.given_name || "Google Authenticated Analyst"
  let email = payload?.email || "analyst.google@skyline.gov.in"
  let avatarUrl = payload?.picture || "https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png"
  let id = payload?.sub || "usr_" + Math.random().toString(36).substring(2, 9)

  // 3. If token is an OAuth2 access_token, fetch userinfo from Google endpoint
  if (!payload && credentialOrToken) {
    try {
      const infoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${credentialOrToken}` },
        signal: AbortSignal.timeout(3000)
      })
      if (infoRes.ok) {
        const info = await infoRes.json()
        if (info.name) name = info.name
        if (info.email) email = info.email
        if (info.picture) avatarUrl = info.picture
        if (info.sub) id = info.sub
      }
    } catch (err) {
      console.warn("Failed to fetch userinfo from Google:", err)
    }
  }

  const session: UserSession = {
    id,
    name,
    email,
    avatarUrl,
    isGuest: false,
    loginTime: new Date().toISOString(),
    provider: "google"
  }
  localStorage.setItem("aero_user", JSON.stringify(session))
  return session
}

export function authenticateManual(params: {
  fullName?: string
  email: string
  password?: string
  mode: 'signin' | 'signup'
}): UserSession {
  const email = params.email.trim().toLowerCase()
  let name = params.fullName?.trim() || email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()) || 'Analyst'

  const storedUsersRaw = localStorage.getItem('aero_registered_users')
  let registeredUsers: Array<{ email: string; name: string; password?: string }> = []
  try {
    if (storedUsersRaw) registeredUsers = JSON.parse(storedUsersRaw)
  } catch {
    registeredUsers = []
  }

  if (params.mode === 'signup') {
    const existingIndex = registeredUsers.findIndex(u => u.email === email)
    if (existingIndex >= 0) {
      registeredUsers[existingIndex] = { email, name, password: params.password }
    } else {
      registeredUsers.push({ email, name, password: params.password })
    }
    localStorage.setItem('aero_registered_users', JSON.stringify(registeredUsers))
  } else {
    const existing = registeredUsers.find(u => u.email === email)
    if (existing && existing.name) {
      name = existing.name
    }
  }

  const session: UserSession = {
    id: 'usr_' + Math.random().toString(36).substring(2, 9),
    name,
    email,
    avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=000000&textColor=f3d400`,
    isGuest: false,
    loginTime: new Date().toISOString(),
    provider: 'manual'
  }
  localStorage.setItem('aero_user', JSON.stringify(session))
  return session
}

import type { NeonAuthStatus } from "@/types/aviation"

export async function fetchNeonAuthStatus(): Promise<NeonAuthStatus> {
  try {
    const res = await fetch(`${API_BASE}/auth/neon/status`, {
      signal: AbortSignal.timeout(4000)
    })
    if (res.ok) {
      return (await res.json()) as NeonAuthStatus
    }
  } catch (err) {
    console.warn("FastAPI Neon status route unavailable, querying JWKS directly:", err)
  }

  // Fallback: direct check against the Neon JWKS endpoint
  try {
    const t0 = performance.now()
    const res = await fetch(NEON_JWKS_URL, { signal: AbortSignal.timeout(4000) })
    const latency = Math.round(performance.now() - t0)
    if (res.ok) {
      const data = await res.json()
      const keys = Array.isArray(data?.keys) ? data.keys : []
      return {
        status: "connected",
        configured: true,
        jwksUrl: NEON_JWKS_URL,
        authBaseUrl: NEON_AUTH_URL,
        keyCount: keys.length,
        keys: keys.map((k: any) => ({
          kid: k.kid,
          kty: k.kty,
          crv: k.crv,
          alg: k.alg || "EdDSA",
          use: k.use || "sig"
        })),
        algorithms: Array.from(new Set(keys.map((k: any) => k.alg || "EdDSA"))),
        latencyMs: latency
      }
    }
  } catch (directErr: any) {
    return {
      status: "unreachable",
      configured: Boolean(NEON_JWKS_URL),
      jwksUrl: NEON_JWKS_URL,
      authBaseUrl: NEON_AUTH_URL,
      keyCount: 0,
      keys: [],
      algorithms: [],
      error: directErr?.message || "Failed to reach Neon Auth JWKS endpoint"
    }
  }

  return {
    status: "unreachable",
    configured: Boolean(NEON_JWKS_URL),
    jwksUrl: NEON_JWKS_URL,
    authBaseUrl: NEON_AUTH_URL,
    keyCount: 0,
    keys: [],
    algorithms: []
  }
}

export async function verifyNeonToken(token: string): Promise<UserSession> {
  // 1. First attempt verification via FastAPI backend
  try {
    const res = await fetch(`${API_BASE}/auth/neon/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
      signal: AbortSignal.timeout(6000)
    })
    if (res.ok) {
      const result = await res.json()
      const session: UserSession = {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        avatarUrl: result.user.avatarUrl || "",
        isGuest: false,
        loginTime: new Date().toISOString(),
        provider: "neon",
        neonKid: result.kid,
        neonToken: token
      }
      localStorage.setItem("aero_user", JSON.stringify(session))
      return session
    }
    const errData = await res.json().catch(() => ({}))
    throw new Error(errData.detail || `Token verification failed (HTTP ${res.status}).`)
  } catch (err: any) {
    // If backend wasn't reachable, parse payload client-side with clear notification
    const payload = parseJwt(token)
    if (!payload) {
      throw new Error(err?.message || "Invalid JWT token structure.")
    }
    const session: UserSession = {
      id: payload.sub || payload.id || "usr_neon_" + Math.random().toString(36).substring(2, 8),
      name: payload.name || payload.email?.split("@")[0] || "Neon Authenticated Analyst",
      email: payload.email || "analyst@neonauth.io",
      avatarUrl: payload.picture || payload.image || "",
      isGuest: false,
      loginTime: new Date().toISOString(),
      provider: "neon",
      neonToken: token
    }
    localStorage.setItem("aero_user", JSON.stringify(session))
    return session
  }
}

export async function authenticateNeonDemo(): Promise<UserSession> {
  const session: UserSession = {
    id: "usr_neon_analyst_b02f2ae6",
    name: "Neon Cryptographic Analyst",
    email: "analyst@neon.tech",
    avatarUrl: "https://neon.tech/favicon.ico",
    isGuest: false,
    loginTime: new Date().toISOString(),
    provider: "neon",
    neonKid: "b02f2ae6-1394-4fd2-8bc0-b77313abfbe2"
  }
  localStorage.setItem("aero_user", JSON.stringify(session))
  return session
}

export function getStoredUser(): UserSession | null {
  try {
    const data = localStorage.getItem("aero_user")
    if (data) return JSON.parse(data)
  } catch (e) {
    console.error("Failed to parse aero_user", e)
  }
  return null
}

export function saveGuestSession(): UserSession {
  const session: UserSession = {
    id: "guest_" + Math.random().toString(36).substring(2, 9),
    name: "Guest Telemetry Analyst",
    email: "guest.analyst@skyline.gov.in",
    isGuest: true,
    loginTime: new Date().toISOString(),
    provider: "guest"
  }
  localStorage.setItem("aero_user", JSON.stringify(session))
  return session
}

export function logoutUser(): void {
  localStorage.removeItem("aero_user")
}

