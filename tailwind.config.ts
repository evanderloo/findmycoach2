import type { Config } from 'tailwindcss';
const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Inter', 'sans-serif'],
      },
      colors: {
        brand: {
          DEFAULT: '#2563eb',
          foreground: '#f8fafc',
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
