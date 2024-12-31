import { type Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';

export default {
  content: ['./{src,mdx}/**/*.{js,mjs,jsx,ts,tsx,mdx}'],
  darkMode: 'selector',
  theme: {
    extend: {
      fontSize: {
        '2xs': '.6875rem',
      },
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
        display: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      opacity: {
        2.5: '0.025',
        7.5: '0.075',
        15: '0.15',
      },
      colors: {
        primary: '#4F46E5',
        lightPurple: '#4F46E5',
        softBlue: '#f1f4f9',
        softbluelight: '#E7EDF4',
        blueGrayTitles: '#28303F',
        darkBlueFont: '#475569',
        red: '#FF0000',
        graybg: '#FAFAFA',
      },
      margin: {
        '1.1': '0.500rem',
      },
      minHeight: {
        customHeader: 'calc(100vh - 64px)', // min height viewPort minus header height (64px)
      },
      maxHeight: {
        customHeader: 'calc(100vh - 64px)', // min height viewPort minus header height (64px)
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        slideIn: 'slideIn 0.5s ease-out',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
} satisfies Config;
