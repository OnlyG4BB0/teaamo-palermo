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
        display: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
        sans: ['Figtree', 'system-ui', 'sans-serif'],
        hand: ['Caveat', 'cursive'],
      },
      colors: {
        ink: {
          DEFAULT: '#1D0B33',
          soft: '#5E4B7A',
        },
        milk: '#FFF6F0',
        blush: '#FFE3EC',
        pop: {
          DEFAULT: '#FF2E7E',
          deep: '#E0156A',
          ink: '#D6105F',
        },
        taro: {
          DEFAULT: '#A98BFF',
          soft: '#EEE7FF',
        },
        matcha: '#9AD96B',
        mango: '#FFC94A',
        sky: '#7CCBFF',
        night: {
          DEFAULT: '#0E0620',
          2: '#190C33',
          3: '#2B1A4D',
        },
        haze: '#C9B9EE',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        soft: '0 18px 50px -24px rgba(29, 11, 51, 0.28)',
        pop: '0 16px 40px -14px rgba(224, 21, 106, 0.65)',
        neon: '0 0 0 1px rgba(255, 46, 126, 0.5), 0 0 40px -6px rgba(255, 46, 126, 0.55)',
      },
      animation: {
        marquee: 'marquee 36s linear infinite',
        'marquee-reverse': 'marquee 40s linear infinite reverse',
        'spin-slow': 'spin 12s linear infinite',
        float: 'floatY 6s ease-in-out infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        floatY: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}
