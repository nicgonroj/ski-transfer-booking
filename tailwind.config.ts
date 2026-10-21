import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './config/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          // Placeholder de marca — ajustable desde config/business.ts.identidad.colores
          primary: '#1B6CA8',
          primaryDark: '#155080',
          snow: '#F7FAFC',
          ink: '#0F1E2E',
        },
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 4px 24px -8px rgba(15, 30, 46, 0.18)',
      },
    },
  },
  plugins: [],
};

export default config;
