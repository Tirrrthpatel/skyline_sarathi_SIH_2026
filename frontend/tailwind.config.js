/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Aviation Window Palette
        'aviation-blue': {
          DEFAULT: '#074E8D', // Deep aviation blue - primary buttons, nav, key links, active states
          deep: '#074E8D',
          sky: '#2D74B4',    // Natural sky blue - secondary buttons, highlights, charts
          accent: '#5691C8', // Medium sky blue - hover states, secondary highlights
          light: '#88B3DC',  // Pale atmospheric blue - subtle bgs, cards, transitions
          subtle: '#EAF2F9', // Very soft blue wash for card backdrops
        },
        'aviation-surface': {
          DEFAULT: '#E2E0E3', // Cloud white/cool white - page backgrounds, cards
          cloud: '#E2E0E3',
          card: '#ECEAEF',
          pure: '#F7F6F9',
        },
        'aircraft': {
          silver: '#C2C9D7',  // Cool metallic gray - borders, dividers, metallic accents
          shadow: '#A8ADBB',  // Cool gray - secondary borders, disabled, depth
          plate: '#D4DAE5',
        },
        'cabin': {
          accent: '#48382F',   // Warm dark brown - cabin accents, warm contrast
          muted: '#736358',    // Warm muted brown-gray - secondary warm surfaces
          bezel: '#362A23',    // Window bezel shadow
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        'sky-gradient': 'linear-gradient(180deg, #074E8D 0%, #2D74B4 45%, #5691C8 80%, #88B3DC 100%)',
        'sky-horizon': 'linear-gradient(180deg, #2D74B4 0%, #5691C8 50%, #88B3DC 85%, #E2E0E3 100%)',
        'blue-button': 'linear-gradient(135deg, #074E8D 0%, #2D74B4 100%)',
        'blue-button-hover': 'linear-gradient(135deg, #2D74B4 0%, #5691C8 100%)',
        'cloud-surface': 'linear-gradient(180deg, rgba(247, 246, 249, 0.92) 0%, rgba(226, 224, 227, 0.96) 100%)',
        'window-frame-bevel': 'linear-gradient(135deg, #E2E0E3 0%, #C2C9D7 50%, #736358 100%)',
      },
      boxShadow: {
        'aviation-subtle': '0 4px 20px -2px rgba(7, 78, 141, 0.08), 0 2px 6px -1px rgba(7, 78, 141, 0.04)',
        'aviation-elevated': '0 14px 34px -4px rgba(7, 78, 141, 0.14), 0 4px 12px -2px rgba(7, 78, 141, 0.08)',
        'window-depth': 'inset 0 0 40px rgba(72, 56, 47, 0.35), 0 20px 50px rgba(7, 78, 141, 0.25)',
        'window-inner': 'inset 0 10px 30px rgba(0, 0, 0, 0.25), inset 0 -6px 20px rgba(136, 179, 220, 0.3)',
      }
    },
  },
  plugins: [],
}
