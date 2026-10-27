/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        alabaster: '#FAF7F2',
        parchment: '#F2ECE4',
        espresso: '#140E11',
        obsidian: '#0D090B',
        charcoal: '#181115',
        carmine: {
          DEFAULT: '#D4365C',
          dark: '#A82243',
          light: '#F9E6EB',
        },
        line: {
          light: '#E5DDD3',
          dark: '#2A1F25',
        }
      },
      animation: {
        'marquee': 'marquee 34s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      }
    },
  },
  plugins: [],
}
