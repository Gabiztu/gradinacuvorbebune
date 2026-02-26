import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-plus-jakarta)', 'sans-serif'],
        inter: ['var(--font-inter)', 'sans-serif'],
        serif: ['var(--font-playfair)', 'serif'],
      },
      colors: {
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        accent: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
        },
        garden: {
          seed: '#8B7355',
          sprout: '#90EE90',
          leaf: '#228B22',
          tall: '#006400',
          bloom: '#FF69B4',
        },
      },
      animation: {
        'grow': 'grow 0.5s ease-out',
        'pulse-soft': 'pulse-soft 2s infinite',
        'bounce-gentle': 'bounce-gentle 1s infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
        'scale-in': 'scale-in 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-up': 'slide-up 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        'fade-in': 'fade-in 0.5s ease-out',
        'success': 'success-pop 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'heart': 'heart-beat 0.6s ease-in-out',
        'gradient': 'gradient-shift 8s ease infinite',
        'breathe': 'breathe 8s ease-in-out infinite',
        'glow': 'glow 4s ease-in-out infinite alternate',
      },
      keyframes: {
        grow: {
          '0%': { transform: 'scale(0.8)', opacity: '0.5' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'bounce-gentle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(142, 76, 36, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(142, 76, 36, 0.5)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'success-pop': {
          '0%': { transform: 'scale(0)' },
          '50%': { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)' },
        },
        'heart-beat': {
          '0%': { transform: 'scale(1)' },
          '25%': { transform: 'scale(1.3)' },
          '50%': { transform: 'scale(1)' },
          '75%': { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.5' },
          '50%': { transform: 'scale(1.1)', opacity: '0.7' },
        },
        glow: {
          from: { filter: 'drop-shadow(0 0 10px rgba(74, 222, 128, 0.2))' },
          to: { filter: 'drop-shadow(0 0 25px rgba(74, 222, 128, 0.6))' },
        },
      },
    },
  },
  plugins: [],
}
export default config
