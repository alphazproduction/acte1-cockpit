import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#0e0f11',
        'bg-card': '#1a1c20',
        'bg-hover': '#252830',
        'border-custom': '#2e3138',
        'text-muted': '#8a8f9e',
        'text-main': '#f2f3f5',
        gold: '#c9a96e',
        green: '#4caf82',
        red: '#e05c5c',
        orange: '#e08c3a',
        blue: '#5b8dee',
      },
      fontFamily: {
        serif: ['var(--font-dm-serif)', 'serif'],
        mono: ['var(--font-dm-mono)', 'monospace'],
        sans: ['var(--font-outfit)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
