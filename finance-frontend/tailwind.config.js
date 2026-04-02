/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6366f1',
          hover: '#4f46e5',
          light: '#eef2ff',
        },
        success: {
          DEFAULT: '#22c55e',
          light: '#f0fdf4',
        },
        danger: {
          DEFAULT: '#ef4444',
          light: '#fef2f2',
        },
        warning: {
          DEFAULT: '#f59e0b',
          light: '#fffbeb',
        },
        surface: '#ffffff',
        muted: '#f8fafc',
        border: '#e2e8f0',
        text: {
          primary: '#0f172a',
          secondary: '#64748b',
          muted: '#94a3b8',
        },
      },
    },
  },
  plugins: [],
}
