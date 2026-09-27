import type { UserSession } from "@/types/aviation"
import { LogIn, ArrowUpRight, Sun, Moon } from "lucide-react"
import { useTheme } from "@/components/theme-provider"

interface NavbarProps {
  currentView: "landing" | "search" | "dashboard"
  onNavigate: (view: "landing" | "search" | "dashboard") => void
  user: UserSession | null
  onOpenAuth: () => void
}

export function Navbar({ currentView, onNavigate, user, onOpenAuth }: NavbarProps) {
  const { resolvedTheme, toggleTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  const navItems = [
    {
      id: "landing" as const,
      index: "01",
      label: "OVERVIEW",
      active: currentView === "landing",
    },
    {
      id: "search" as const,
      index: "02",
      label: "CORRIDOR SEARCH",
      active: currentView === "search",
    },
    {
      id: "dashboard" as const,
      index: "03",
      label: "LIVE TELEMETRY",
      active: currentView === "dashboard",
    },
  ]

  return (
    <header className="sticky top-0 z-50 w-full bg-white dark:bg-black border-b-2 border-black dark:border-white transition-colors duration-150">
      <div className="max-w-7xl mx-auto flex items-stretch justify-between">
        
        {/* Brand Cell */}
        <button
          onClick={() => onNavigate("landing")}
          className="flex items-center gap-3 px-4 sm:px-6 py-3.5 sm:py-4 border-r-2 border-black dark:border-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors cursor-pointer text-left select-none"
        >
          <div className="w-5 h-5 bg-[#f3d400] text-black border border-black flex items-center justify-center font-mono text-[10px] font-black shrink-0">
            ▲
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-sans font-black text-base sm:text-lg tracking-tighter uppercase text-black dark:text-white leading-none">
                Skyline
              </span>
              <span className="font-sans font-black text-base sm:text-lg tracking-normal text-black dark:text-white leading-none">
                सारथी
              </span>
            </div>
            <span className="font-mono text-[9px] text-neutral-500 dark:text-neutral-400 uppercase tracking-widest block mt-0.5">
              MoSPI CPI Telemetry • SIH26056
            </span>
          </div>
        </button>

        {/* Navigation Grid Links */}
        <nav className="hidden md:flex items-stretch divide-x-2 divide-black dark:divide-white">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex items-center gap-2 px-6 py-4 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                item.active
                  ? "bg-[#f3d400] text-black font-black"
                  : "bg-white dark:bg-black text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900"
              }`}
            >
              <span className={`font-mono text-[10px] ${item.active ? "text-black font-black" : "text-neutral-500 dark:text-neutral-400"}`}>
                {item.index}.
              </span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Right CTA / Theme Toggle / Auth Cell */}
        <div className="flex items-stretch border-l-2 border-black dark:border-white">
          
          {/* Theme Toggle Button (Light/Dark Mode) at Top Right Corner */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-3.5 sm:px-5 py-3.5 sm:py-4 bg-white dark:bg-black text-black dark:text-white border-r-2 border-black dark:border-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors cursor-pointer text-xs font-mono font-bold uppercase tracking-wider select-none"
            aria-label="Toggle Theme Mode"
            title={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
          >
            {isDark ? (
              <>
                <Sun className="w-4 h-4 text-white" />
                <span className="hidden sm:inline font-bold">LIGHT</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-black" />
                <span className="hidden sm:inline font-bold">DARK</span>
              </>
            )}
          </button>

          {/* Quick launch button for mobile */}
          <button
            onClick={() => onNavigate(currentView === "dashboard" ? "search" : "dashboard")}
            className="md:hidden flex items-center gap-1.5 px-3 py-3 text-[11px] font-bold uppercase tracking-wider bg-neutral-100 dark:bg-neutral-900 text-black dark:text-white border-r-2 border-black dark:border-white hover:bg-[#f3d400] hover:text-black transition-colors"
          >
            <span>{currentView === "dashboard" ? "Search" : "Live"}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>

          {/* User Sign In / Session Cell */}
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-2 px-4 sm:px-6 py-3.5 sm:py-4 bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors cursor-pointer text-xs font-bold uppercase tracking-wider select-none"
          >
            {user ? (
              <>
                <span className="w-2 h-2 bg-[#f3d400] inline-block border border-black"></span>
                <span className="max-w-[100px] truncate">{user.name.split(" ")[0]}</span>
              </>
            ) : (
              <>
                <LogIn className="w-3.5 h-3.5" />
                <span>SIGN IN</span>
              </>
            )}
          </button>
        </div>

      </div>
    </header>
  )
}
