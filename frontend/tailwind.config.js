/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#0a0f14',
        surface: {
          DEFAULT: '#0d1520',
          elevated: '#111e2c',
        },
        border: {
          DEFAULT: '#1a2e3d',
          hover: '#2a4560',
        },
        accent: {
          DEFAULT: '#00d4ff', // Cyan
          dim: '#0ea5c9',
          glow: 'rgba(0, 212, 255, 0.12)',
        },
        text: {
          primary: '#e2eaf0',
          secondary: '#7a9ab0',
          muted: '#3d5a6e',
        },
        success: '#00ff9d',
        warning: '#f59e0b',
        danger: '#ef4444',
      },
      fontFamily: {
        sans: ['Inter', 'DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
