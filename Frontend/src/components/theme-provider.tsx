/* eslint-disable react-refresh/only-export-components */
import * as React from "react"

export type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  resolvedTheme: "dark" | "light"
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeProviderContext = React.createContext<ThemeProviderState | undefined>(undefined)

export function ThemeProvider({
  children,
  defaultTheme = "light",
  storageKey = "theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<Theme>(() => {
    try {
      const stored = localStorage.getItem(storageKey) as Theme | null
      if (stored === "dark" || stored === "light") return stored
    } catch {
      // Fallback
    }
    return defaultTheme
  })

  const [resolvedTheme, setResolvedTheme] = React.useState<"dark" | "light">(() => {
    if (typeof document !== "undefined") {
      return document.documentElement.classList.contains("dark") ? "dark" : "light"
    }
    return "light"
  })

  const applyTheme = React.useCallback((targetTheme: Theme) => {
    if (typeof document === "undefined") return
    const root = document.documentElement
    let resolved: "dark" | "light" = "light"
    if (targetTheme === "dark") {
      resolved = "dark"
    } else if (targetTheme === "light") {
      resolved = "light"
    } else {
      resolved = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    }

    if (resolved === "dark") {
      root.classList.add("dark")
      root.classList.remove("light")
      root.setAttribute("data-theme", "dark")
      root.style.colorScheme = "dark"
    } else {
      root.classList.remove("dark")
      root.classList.add("light")
      root.setAttribute("data-theme", "light")
      root.style.colorScheme = "light"
    }
    setResolvedTheme(resolved)
  }, [])

  const setTheme = React.useCallback(
    (nextTheme: Theme) => {
      try {
        localStorage.setItem(storageKey, nextTheme)
      } catch {
        // Fallback
      }
      setThemeState(nextTheme)
      applyTheme(nextTheme)
    },
    [storageKey, applyTheme]
  )

  const toggleTheme = React.useCallback(() => {
    const isCurrentlyDark = document.documentElement.classList.contains("dark")
    const next: Theme = isCurrentlyDark ? "light" : "dark"
    setTheme(next)
  }, [setTheme])

  React.useEffect(() => {
    applyTheme(theme)
  }, [theme, applyTheme])

  const value = React.useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
      toggleTheme,
    }),
    [theme, resolvedTheme, setTheme, toggleTheme]
  )

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = React.useContext(ThemeProviderContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
