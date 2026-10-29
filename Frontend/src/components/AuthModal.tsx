import { useState, useEffect, useRef } from "react"
import type { UserSession } from "@/types/aviation"
import {
  authenticateGoogle,
  authenticateManual,
  logoutUser,
  GOOGLE_CLIENT_ID,
} from "@/lib/api"
import {
  ShieldCheck,
  LogOut,
  X,
  AlertCircle,
  Mail,
  Lock,
  User,
  ArrowRight,
} from "lucide-react"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  currentUser: UserSession | null
  onUserChange: (user: UserSession | null) => void
}

export function AuthModal({ isOpen, onClose, currentUser, onUserChange }: AuthModalProps) {
  const [mode, setMode] = useState<"signin" | "signup">("signin")
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [gisLoaded, setGisLoaded] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const googleBtnContainerRef = useRef<HTMLDivElement>(null)

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setErrorMessage(null)
      setFullName("")
      setEmail("")
      setPassword("")
    }
  }, [isOpen])

  // Initialize official Google Identity Services when modal opens
  useEffect(() => {
    if (!isOpen) return

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
            text: mode === "signin" ? "signin_with" : "signup_with",
            shape: "rectangular",
            logo_alignment: "center",
            width: containerWidth,
          })
          setGisLoaded(true)
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
  }, [isOpen, mode, onUserChange, onClose])

  if (!isOpen) return null

  // Google OAuth Flow fallback
  const handleGoogleLogin = () => {
    setLoading(true)
    setErrorMessage(null)

    if (!GOOGLE_CLIENT_ID) {
      setLoading(false)
      setErrorMessage(
        "Google Client ID is not configured. Please sign in or register with your email and password below."
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
              if (resp.error === "popup_closed_by_user") {
                setErrorMessage("Google Sign-In popup was closed before completing authorization.")
              } else {
                setErrorMessage(`Google OAuth notice: ${resp.error_description || resp.error}`)
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
            setErrorMessage(`Google sign-in error: ${err?.message || "Popup blocked or origin restricted."}`)
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
            setErrorMessage("Google Sign-In prompt was skipped or blocked by browser settings.")
          }
        })
        return
      } catch (e: any) {
        console.warn("Prompt error:", e)
      }
    }

    setLoading(false)
    setErrorMessage("Google SDK unavailable. Please use the manual email and password option below.")
  }

  // Manual Sign In / Sign Up handler
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.")
      return
    }

    if (!password.trim() || password.length < 4) {
      setErrorMessage("Password must be at least 4 characters.")
      return
    }

    if (mode === "signup" && !fullName.trim()) {
      setErrorMessage("Please enter your full name.")
      return
    }

    try {
      setLoading(true)
      const user = authenticateManual({
        fullName: mode === "signup" ? fullName.trim() : undefined,
        email: email.trim(),
        password: password.trim(),
        mode,
      })
      onUserChange(user)
      onClose()
    } catch (err: any) {
      setErrorMessage(err?.message || "Authentication failed. Please check your credentials.")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logoutUser()
    onUserChange(null)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white dark:bg-black border-4 border-black dark:border-white p-6 sm:p-8 rounded-none text-black dark:text-white shadow-none max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 border-2 border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="mb-6 pb-4 border-b-2 border-black dark:border-white text-left">
          <div className="text-[11px] font-mono uppercase font-black tracking-widest text-black dark:text-white mb-1 flex items-center gap-2">
            <span>00. AUTHENTICATION // PORTAL ACCESS</span>
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
          /* ================= ACTIVE USER SESSION VIEW ================= */
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
                    VERIFIED
                  </span>
                  {currentUser.provider && (
                    <span className="px-1.5 py-0.5 font-mono text-[9px] font-black uppercase bg-black text-white dark:bg-white dark:text-black border border-black dark:border-white">
                      {currentUser.provider.toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
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
          /* ================= SIGN IN / SIGN UP FORM ================= */
          <div className="space-y-5 text-left">
            {/* Mode Selector Tabs (Sign In vs Sign Up) */}
            <div className="grid grid-cols-2 border-2 border-black dark:border-white">
              <button
                type="button"
                onClick={() => {
                  setMode("signin")
                  setErrorMessage(null)
                }}
                className={`py-2.5 px-3 text-xs font-mono font-black uppercase tracking-wider transition-colors cursor-pointer ${
                  mode === "signin"
                    ? "bg-[#f3d400] text-black"
                    : "bg-white dark:bg-black text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("signup")
                  setErrorMessage(null)
                }}
                className={`py-2.5 px-3 text-xs font-mono font-black uppercase tracking-wider transition-colors cursor-pointer border-l-2 border-black dark:border-white ${
                  mode === "signup"
                    ? "bg-[#f3d400] text-black"
                    : "bg-white dark:bg-black text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white"
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border-2 border-red-700 text-red-900 dark:text-red-200 text-xs font-mono flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
                <p className="leading-snug">{errorMessage}</p>
              </div>
            )}

            {/* Google Authentication Container */}
            <div className="space-y-2">
              <div
                ref={googleBtnContainerRef}
                id="google-signin-target"
                className="w-full flex justify-center empty:hidden min-h-[44px]"
              />

              {!gisLoaded && (
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white dark:bg-black border-2 border-black dark:border-white text-black dark:text-white font-black uppercase text-xs tracking-wider hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
                  <span>{loading ? "Connecting to Google..." : mode === "signin" ? "Sign in with Google" : "Sign up with Google"}</span>
                </button>
              )}
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-2">
              <div className="w-full border-t border-black dark:border-white"></div>
              <span className="bg-white dark:bg-black px-2 text-[10px] font-mono font-black uppercase text-neutral-500 tracking-wider">
                or with email
              </span>
            </div>

            {/* Manual Sign In / Sign Up Form */}
            <form onSubmit={handleManualSubmit} className="space-y-3.5">
              {mode === "signup" && (
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-2.5 text-neutral-500" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Tirth Patel"
                      className="w-full pl-9 pr-3 py-2 text-xs font-mono bg-white dark:bg-black border-2 border-black dark:border-white text-black dark:text-white focus:outline-none focus:bg-[#f3d400]/10"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                  Email ID
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-2.5 text-neutral-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full pl-9 pr-3 py-2 text-xs font-mono bg-white dark:bg-black border-2 border-black dark:border-white text-black dark:text-white focus:outline-none focus:bg-[#f3d400]/10"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-2.5 text-neutral-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-xs font-mono bg-white dark:bg-black border-2 border-black dark:border-white text-black dark:text-white focus:outline-none focus:bg-[#f3d400]/10"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-black dark:bg-white hover:bg-[#f3d400] hover:text-black dark:hover:bg-[#f3d400] dark:hover:text-black text-white dark:text-black font-black uppercase text-xs tracking-wider border-2 border-black dark:border-white transition-colors cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                <span>{mode === "signin" ? "Sign In to Account" : "Create Account & Sign In"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Toggle Mode Footer */}
            <div className="text-center pt-2 border-t border-neutral-200 dark:border-neutral-800">
              {mode === "signin" ? (
                <p className="text-[11px] font-mono text-neutral-600 dark:text-neutral-400">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("signup")
                      setErrorMessage(null)
                    }}
                    className="font-bold underline text-black dark:text-white hover:text-neutral-600 cursor-pointer"
                  >
                    Create Account
                  </button>
                </p>
              ) : (
                <p className="text-[11px] font-mono text-neutral-600 dark:text-neutral-400">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("signin")
                      setErrorMessage(null)
                    }}
                    className="font-bold underline text-black dark:text-white hover:text-neutral-600 cursor-pointer"
                  >
                    Sign In
                  </button>
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
