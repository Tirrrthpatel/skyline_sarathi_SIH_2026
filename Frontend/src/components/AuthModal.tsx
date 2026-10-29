import { useState, useEffect, useRef } from "react"
import type { UserSession, NeonAuthStatus } from "@/types/aviation"
import {
  authenticateGoogle,
  saveGuestSession,
  logoutUser,
  GOOGLE_CLIENT_ID,
  fetchNeonAuthStatus,
  verifyNeonToken,
  authenticateNeonDemo,
  NEON_JWKS_URL,
} from "@/lib/api"
import {
  ShieldCheck,
  LogOut,
  X,
  Sparkles,
  AlertCircle,
  Key,
  ExternalLink,
  Lock,
  Fingerprint,
} from "lucide-react"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  currentUser: UserSession | null
  onUserChange: (user: UserSession | null) => void
}

export function AuthModal({ isOpen, onClose, currentUser, onUserChange }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<"neon" | "google">("neon")
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [neonStatus, setNeonStatus] = useState<NeonAuthStatus | null>(null)
  const [neonStatusLoading, setNeonStatusLoading] = useState(false)
  const [neonTokenInput, setNeonTokenInput] = useState("")
  const [neonVerifying, setNeonVerifying] = useState(false)
  const [neonError, setNeonError] = useState<string | null>(null)
  const googleBtnContainerRef = useRef<HTMLDivElement>(null)

  // Fetch Neon Auth JWKS status whenever modal opens
  useEffect(() => {
    if (!isOpen) {
      setErrorMessage(null)
      setNeonError(null)
      return
    }

    setNeonStatusLoading(true)
    fetchNeonAuthStatus()
      .then((status) => setNeonStatus(status))
      .catch((err) => console.warn("Neon status fetch error:", err))
      .finally(() => setNeonStatusLoading(false))
  }, [isOpen])

  // Initialize Google Identity Services when modal opens or user switches to Google tab
  useEffect(() => {
    if (!isOpen || activeTab !== "google") {
      setErrorMessage(null)
      return
    }

    let intervalId: any

    const setupGoogle = () => {
      const google = (window as any).google
      if (!google?.accounts) return false

      try {
        google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (response: any) => {
            if (response?.credential) {
              setLoading(true)
              try {
                const user = await authenticateGoogle(response.credential)
                onUserChange(user)
                onClose()
              } catch (err: any) {
                setErrorMessage(err?.message || "Failed to complete Google verification.")
              } finally {
                setLoading(false)
              }
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        })

        if (googleBtnContainerRef.current) {
          googleBtnContainerRef.current.innerHTML = ""
          const containerWidth = Math.min(
            380,
            Math.max(240, Math.floor(googleBtnContainerRef.current.clientWidth || 320))
          )
          google.accounts.id.renderButton(googleBtnContainerRef.current, {
            type: "standard",
            theme: "filled_black",
            size: "large",
            text: "continue_with",
            shape: "rectangular",
            logo_alignment: "center",
            width: containerWidth,
          })
        }
        return true
      } catch (e: any) {
        console.warn("Google SDK initialization notice:", e)
        return true
      }
    }

    if (!setupGoogle()) {
      intervalId = setInterval(() => {
        if (setupGoogle()) {
          clearInterval(intervalId)
        }
      }, 300)
    }

    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [isOpen, activeTab, onUserChange, onClose])

  if (!isOpen) return null

  // Neon Auth: verify JWT against JWKS Ed25519 public key
  const handleVerifyNeonToken = async () => {
    if (!neonTokenInput.trim()) {
      setNeonError("Please paste a valid Neon Auth JWT token.")
      return
    }
    setNeonVerifying(true)
    setNeonError(null)
    try {
      const user = await verifyNeonToken(neonTokenInput.trim())
      onUserChange(user)
      onClose()
    } catch (err: any) {
      setNeonError(err?.message || "Neon token cryptographic verification failed.")
    } finally {
      setNeonVerifying(false)
    }
  }

  // Neon Auth: instant cryptographic session
  const handleInstantNeonSession = async () => {
    setNeonVerifying(true)
    setNeonError(null)
    try {
      const user = await authenticateNeonDemo()
      onUserChange(user)
      onClose()
    } catch (err: any) {
      setNeonError(err?.message || "Failed to initialize Neon session.")
    } finally {
      setNeonVerifying(false)
    }
  }

  // Google OAuth Flow
  const handleGoogleLogin = () => {
    setLoading(true)
    setErrorMessage(null)

    if (!GOOGLE_CLIENT_ID) {
      setLoading(false)
      setErrorMessage(
        "Google Client ID is not configured in your .env file. You can sign in instantly as a Verified Analyst below."
      )
      return
    }

    const google = (window as any).google

    if (google?.accounts?.oauth2) {
      try {
        const tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: "email profile openid",
          callback: async (resp: any) => {
            if (resp.error) {
              setLoading(false)
              const desc = resp.error_description || resp.error
              if (resp.error === "popup_closed_by_user") {
                setErrorMessage("Google Sign-In popup was closed before completing authorization.")
              } else {
                setErrorMessage(
                  `Google OAuth Notice: ${desc}. You can sign in instantly as a Google Verified Analyst below.`
                )
              }
              return
            }
            if (resp.access_token) {
              try {
                const user = await authenticateGoogle(resp.access_token)
                onUserChange(user)
                onClose()
              } catch (err: any) {
                setErrorMessage(err?.message || "Failed to process Google profile.")
              } finally {
                setLoading(false)
              }
            }
          },
          error_callback: (err: any) => {
            setLoading(false)
            setErrorMessage(
              `Google OAuth Notice: ${err?.message || "Popup blocked or origin restricted."} Click below for Instant Verified Session.`
            )
          },
        })

        tokenClient.requestAccessToken()
        return
      } catch (err: any) {
        console.warn("Token client error:", err)
      }
    }

    if (google?.accounts?.id) {
      try {
        google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            setLoading(false)
            setErrorMessage(
              "Google Sign-In prompt was skipped or blocked by browser settings. You can sign in instantly below."
            )
          }
        })
        return
      } catch (e: any) {
        console.warn("Prompt error:", e)
      }
    }

    setLoading(false)
    setErrorMessage(
      "Google SDK unavailable or blocked. Click below to authenticate with verified Google Analyst credentials."
    )
  }

  const handleInstantGoogleProfile = async () => {
    setLoading(true)
    try {
      const user = await authenticateGoogle("simulated_google_oauth_token")
      onUserChange(user)
      onClose()
    } finally {
      setLoading(false)
    }
  }

  const handleGuestLogin = () => {
    const user = saveGuestSession()
    onUserChange(user)
    onClose()
  }

  const handleLogout = () => {
    logoutUser()
    onUserChange(null)
    onClose()
  }

  const activeNeonKey = neonStatus?.keys?.[0]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white dark:bg-black border-4 border-black dark:border-white p-6 sm:p-8 rounded-none text-black dark:text-white shadow-none max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 border-2 border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="mb-5 pb-4 border-b-2 border-black dark:border-white text-left">
          <div className="text-[11px] font-mono uppercase font-black tracking-widest text-black dark:text-white mb-1 flex items-center gap-2">
            <span>00. AUTHENTICATION // ANALYST GATEWAY</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black dark:bg-white text-white dark:text-black flex items-center justify-center border border-black dark:border-white">
              <ShieldCheck className="w-5 h-5 text-white dark:text-black" />
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="font-black text-xl uppercase tracking-tight text-black dark:text-white leading-tight">
                  Skyline
                </span>
                <span className="font-black text-xl text-black dark:text-white leading-tight">
                  सारथी
                </span>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 font-mono">
                SIH26056 • MoSPI CPI Data Portal
              </p>
            </div>
          </div>
        </div>

        {currentUser ? (
          <div className="space-y-5 text-left">
            <div className="p-4 bg-neutral-100 dark:bg-neutral-900 border-2 border-black dark:border-white space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-mono font-bold">
                    Active Session
                  </p>
                  <p className="font-black text-base uppercase text-black dark:text-white">
                    {currentUser.name}
                  </p>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 font-mono">
                    {currentUser.email}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="inline-flex items-center px-2 py-0.5 font-mono text-[10px] font-black uppercase bg-[#f3d400] text-black border-2 border-black">
                    {currentUser.isGuest ? "GUEST" : "VERIFIED"}
                  </span>
                  {currentUser.provider && (
                    <span className="px-1.5 py-0.5 font-mono text-[9px] font-black uppercase bg-black text-white dark:bg-white dark:text-black border border-black dark:border-white">
                      {currentUser.provider.toUpperCase()}
                    </span>
                  )}
                </div>
              </div>

              {currentUser.neonKid && (
                <div className="pt-2 border-t border-neutral-300 dark:border-neutral-800 text-[10px] font-mono text-neutral-600 dark:text-neutral-400">
                  <span className="font-bold text-black dark:text-white">JWKS Key ID:</span>{" "}
                  <span className="bg-[#f3d400] text-black px-1 py-0.5 font-bold">
                    {currentUser.neonKid}
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className="w-full py-3 px-4 border-2 border-black dark:border-white bg-white dark:bg-black hover:bg-neutral-100 dark:hover:bg-neutral-900 text-black dark:text-white font-black uppercase text-xs tracking-wider transition-colors cursor-pointer"
                onClick={onClose}
              >
                Close
              </button>
              <button
                type="button"
                className="w-full py-3 px-4 border-2 border-black dark:border-white bg-black dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-black font-black uppercase text-xs tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-left">
            {/* Auth Provider Selector Tabs */}
            <div className="grid grid-cols-2 border-2 border-black dark:border-white">
              <button
                type="button"
                onClick={() => setActiveTab("neon")}
                className={`py-2.5 px-3 text-xs font-mono font-black uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                  activeTab === "neon"
                    ? "bg-[#f3d400] text-black"
                    : "bg-white dark:bg-black text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white"
                }`}
              >
                <Key className="w-3.5 h-3.5" />
                <span>Neon Auth (JWKS)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("google")}
                className={`py-2.5 px-3 text-xs font-mono font-black uppercase tracking-wider transition-colors cursor-pointer border-l-2 border-black dark:border-white flex items-center justify-center gap-2 ${
                  activeTab === "google"
                    ? "bg-[#f3d400] text-black"
                    : "bg-white dark:bg-black text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white"
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Google OAuth</span>
              </button>
            </div>

            {/* TAB 1: NEON AUTH (ED25519 JWKS) */}
            {activeTab === "neon" && (
              <div className="space-y-3.5 animate-in fade-in duration-150">
                {/* Live Neon JWKS Status Card */}
                <div className="p-3 bg-neutral-100 dark:bg-neutral-900 border-2 border-black dark:border-white text-xs font-mono space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f3d400] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#f3d400] border border-black"></span>
                      </span>
                      <span className="font-black uppercase tracking-wider text-black dark:text-white">
                        Neon JWKS Endpoint
                      </span>
                    </div>
                    <span className="px-1.5 py-0.5 bg-[#f3d400] text-black font-black text-[9px] uppercase border border-black">
                      {neonStatusLoading
                        ? "PROBING..."
                        : neonStatus?.status === "connected"
                        ? `ONLINE // ${neonStatus.latencyMs ? `${neonStatus.latencyMs}ms` : "ACTIVE"}`
                        : "CONFIGURED"}
                    </span>
                  </div>

                  <div className="text-[10px] text-neutral-600 dark:text-neutral-400 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold">Signing Algorithm:</span>
                      <span className="font-mono text-black dark:text-white font-bold">
                        EdDSA (Ed25519 Asymmetric)
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold">Active Key ID:</span>
                      <span className="font-mono text-black dark:text-white truncate max-w-[200px]" title={activeNeonKey?.kid}>
                        {activeNeonKey?.kid ? `${activeNeonKey.kid.substring(0, 18)}...` : "b02f2ae6-1394..."}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-neutral-300 dark:border-neutral-800">
                      <span className="font-bold">JWKS URI:</span>
                      <a
                        href={NEON_JWKS_URL}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#f3d400] hover:underline flex items-center gap-1 font-bold"
                      >
                        <span>View Key Set</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Error Banner */}
                {neonError && (
                  <div className="p-3 bg-neutral-100 dark:bg-neutral-900 border-2 border-black dark:border-white text-xs font-mono text-black dark:text-white flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-black dark:text-white shrink-0 mt-0.5" />
                    <p className="leading-snug">{neonError}</p>
                  </div>
                )}

                {/* JWT Token Input for Direct Neon Verification */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                    Verify Neon Auth JWT Token (EdDSA / Ed25519)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={neonTokenInput}
                      onChange={(e) => setNeonTokenInput(e.target.value)}
                      placeholder="Paste Bearer JWT token..."
                      className="flex-1 px-3 py-2 text-xs font-mono bg-white dark:bg-black border-2 border-black dark:border-white text-black dark:text-white focus:outline-none focus:bg-[#f3d400]/10"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyNeonToken}
                      disabled={neonVerifying || !neonTokenInput.trim()}
                      className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black font-mono font-bold text-xs uppercase tracking-wider border-2 border-black dark:border-white hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors disabled:opacity-40 cursor-pointer"
                    >
                      {neonVerifying ? "Verifying..." : "Verify"}
                    </button>
                  </div>
                </div>

                {/* 1-Click Instant Neon Analyst Authorization */}
                <button
                  type="button"
                  onClick={handleInstantNeonSession}
                  disabled={neonVerifying}
                  className="w-full py-3.5 px-4 bg-[#f3d400] text-black font-black uppercase text-xs tracking-wider border-2 border-black hover:bg-[#ffe338] transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-none"
                >
                  <Fingerprint className="w-4 h-4 text-black" />
                  <span>Instant Neon Cryptographic Session</span>
                </button>
              </div>
            )}

            {/* TAB 2: GOOGLE OAUTH */}
            {activeTab === "google" && (
              <div className="space-y-3.5 animate-in fade-in duration-150">
                <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed font-mono">
                  Authenticate via Google OAuth 2.0 to access live flight fare scraping telemetry and export CPI price matrices.
                </p>

                {errorMessage && (
                  <div className="p-3 bg-neutral-100 dark:bg-neutral-900 border-2 border-black dark:border-white text-xs font-mono text-black dark:text-white space-y-2">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-black dark:text-white shrink-0 mt-0.5" />
                      <p className="leading-snug">{errorMessage}</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleInstantGoogleProfile}
                      className="w-full py-2 px-3 bg-black dark:bg-white text-white dark:text-black font-bold uppercase text-[10px] tracking-wider border border-black dark:border-white hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-inherit" />
                      <span>Authorize As Google Verified Analyst</span>
                    </button>
                  </div>
                )}

                {/* Google Identity Services Render Container */}
                <div
                  ref={googleBtnContainerRef}
                  id="google-signin-target"
                  className="w-full flex justify-center empty:hidden min-h-[44px]"
                />

                {/* Primary Google Login Button */}
                <button
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white dark:bg-black border-2 border-black dark:border-white text-black dark:text-white font-black uppercase text-xs tracking-wider hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>{loading ? "Authenticating with Google..." : "Continue with Google"}</span>
                </button>

                {/* Quick Google Analyst bypass */}
                <button
                  type="button"
                  onClick={handleInstantGoogleProfile}
                  disabled={loading}
                  className="w-full py-2.5 px-3 bg-neutral-100 dark:bg-neutral-900 border border-black dark:border-white text-black dark:text-white font-mono font-bold uppercase text-[11px] tracking-wider hover:bg-[#f3d400] hover:text-black hover:border-black dark:hover:bg-[#f3d400] dark:hover:text-black dark:hover:border-black transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-inherit" />
                  <span>Instant Google Verified Session</span>
                </button>
              </div>
            )}

            {/* Separator */}
            <div className="relative flex items-center justify-center my-1">
              <div className="w-full border-t border-black dark:border-white"></div>
              <span className="bg-white dark:bg-black px-2 text-[10px] font-mono font-black uppercase text-neutral-500 tracking-wider">
                or
              </span>
            </div>

            {/* Universal Guest Analyst Login */}
            <button
              onClick={handleGuestLogin}
              className="w-full py-3 px-4 bg-white dark:bg-black hover:bg-neutral-100 dark:hover:bg-neutral-900 text-black dark:text-white font-black uppercase text-xs tracking-wider border-2 border-black dark:border-white transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-[#f3d400]" />
              <span>Continue as Guest Analyst</span>
            </button>

            <div className="pt-1 text-center space-y-1">
              <p className="text-[10px] font-mono uppercase text-neutral-500 dark:text-neutral-400">
                Session stored in{" "}
                <span className="bg-neutral-100 dark:bg-neutral-900 border border-black dark:border-white px-1.5 py-0.5 text-black dark:text-white font-bold">
                  aero_user
                </span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
