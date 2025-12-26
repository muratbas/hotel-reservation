
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        "primary": "#137fec",
        "background-light": "#f6f7f8",
        "background-dark": "#101922",
        "sidebar-dark": "#111a22",
        "card-dark": "#192633",
        "hover-dark": "#233648",
        "border-color": "#324d67",
        "text-primary": "#ffffff",
        "text-secondary": "#92adc9",
        "status-available": "#10b981",
        "status-occupied": "#f59e0b",
        "status-maintenance": "#ef4444",
      },
      fontFamily: {
        "display": ["Manrope", "sans-serif"]
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
    },
  },
  plugins: [],
}

