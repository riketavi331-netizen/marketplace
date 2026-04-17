import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  'rgba(201,169,110,0.10)',
          100: 'rgba(201,169,110,0.18)',
          500: '#c9a96e',
          600: '#c9a96e',
          700: '#a88840',
          800: '#8a6e28',
        },
        surface: {
          DEFAULT: '#121212',
          2: '#1a1a1a',
          3: '#222222',
        },
      },
      fontFamily: {
        display: ['var(--font-cormorant)', 'Georgia', 'serif'],
      },
      letterSpacing: {
        widest2: '0.2em',
      },
    },
  },
  plugins: [],
};
export default config;
