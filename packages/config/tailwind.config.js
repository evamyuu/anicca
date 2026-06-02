const { fontFamily } = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      // ── Brand Colors ──────────────────────────────────────────
      colors: {
        // Primary — Deep Brown (Anicca brand: #403229)
        primary: {
          50:  '#f7f4f2',
          100: '#ede6e0',
          200: '#d9cdc3',
          300: '#c0ad9f',
          400: '#a48b78',
          500: '#403229', // Main brand color
          600: '#382b23',
          700: '#2e231c',
          800: '#231a15',
          900: '#17110d',
          950: '#0c0907',
        },
        // Secondary — Warm Orange (compassion / energy: #FF9A5C)
        secondary: {
          50:  '#fff5ee',
          100: '#ffe8d5',
          200: '#ffd0aa',
          300: '#ffb87f',
          400: '#ffa96b',
          500: '#FF9A5C', // Main secondary color
          600: '#e8813a',
          700: '#c66820',
          800: '#9e5018',
          900: '#7a3c10',
          950: '#4a2208',
        },
        // Auxiliaries — used in strategic points
        aux: {
          green:  '#4DA167', // Growth / success
          purple: '#725AC1', // Clinical / doctor panel
          blue:   '#255C99', // Trust / info
        },
        // Background (light mode)
        brand: {
          bg: '#F0E9E5',
        },
        // Dark mode surfaces
        surface: {
          DEFAULT:       '#F0E9E5', // Light mode background
          dark:          '#1E1E1E', // Dark mode background
          'card-dark':   '#2C2C2C', // Dark mode card surface
          card:          '#FFFFFF',
          border:        '#d9cdc3',
          'border-dark': '#3a3a3a',
        },
        // ── Error / Danger ────────────────────────────────────────
        error: {
          DEFAULT: '#D4203B',
          soft:    '#FA5770',
          vivid:   '#E83752',
          light:   '#fef2f4',
          dark:    '#a8142c',
        },
        // ── Semantic aliases ─────────────────────────────────────
        success: { DEFAULT: '#4DA167', light: '#edf7f0', dark: '#357249' },
        warning: { DEFAULT: '#FF9A5C', light: '#fff5ee', dark: '#c66820' },
        info:    { DEFAULT: '#255C99', light: '#eef4fb', dark: '#1a4272' },
        // ── CTCAE Grade Colors (WCAG AA compliant) ────────────────
        'ctcae-0': { DEFAULT: '#4DA167', text: '#1e5c31', bg: '#edf7f0', border: '#9dcfad' },
        'ctcae-1': { DEFAULT: '#84cc16', text: '#365314', bg: '#f7fee7', border: '#bef264' },
        'ctcae-2': { DEFAULT: '#FF9A5C', text: '#7a3c10', bg: '#fff5ee', border: '#ffb87f' },
        'ctcae-3': { DEFAULT: '#D4203B', text: '#7f1d1d', bg: '#fef2f4', border: '#f9a3b0' },
        'ctcae-4': { DEFAULT: '#725AC1', text: '#2e1065', bg: '#f5f0fc', border: '#b8a4e4' },
      },

      // ── Typography — Nunito ───────────────────────────────────
      fontFamily: {
        sans: ['Nunito', 'Nunito Variable', ...fontFamily.sans],
        display: ['Nunito', 'Nunito Variable', ...fontFamily.sans],
      },
      fontSize: {
        xs: ['12px', { lineHeight: '16px', letterSpacing: '0.025em' }],
        sm: ['14px', { lineHeight: '20px', letterSpacing: '0.01em' }],
        base: ['16px', { lineHeight: '24px' }],
        lg: ['18px', { lineHeight: '28px' }], // MIN_ACCESSIBLE_FONT_SIZE
        xl: ['20px', { lineHeight: '28px' }],
        '2xl': ['24px', { lineHeight: '32px' }],
        '3xl': ['30px', { lineHeight: '36px' }],
        '4xl': ['36px', { lineHeight: '40px' }],
        '5xl': ['48px', { lineHeight: '52px' }],
      },

      // ── Spacing (4px base) ────────────────────────────────────
      spacing: {
        px: '1px',
        0: '0px',
        0.5: '2px',
        1: '4px',
        1.5: '6px',
        2: '8px',
        2.5: '10px',
        3: '12px',
        3.5: '14px',
        4: '16px',
        5: '20px',
        6: '24px',
        7: '28px',
        8: '32px',
        9: '36px',
        10: '40px',
        11: '44px', // MIN_TOUCH_TARGET iOS
        12: '48px', // MIN_TOUCH_TARGET Android
        14: '56px',
        16: '64px',
        20: '80px',
        24: '96px',
        28: '112px',
        32: '128px',
      },

      // ── Border Radius ────────────────────────────────────────
      borderRadius: {
        none: '0px',
        sm: '6px',
        DEFAULT: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        '2xl': '24px',
        '3xl': '32px',
        full: '9999px',
      },

      // ── Shadows ──────────────────────────────────────────────
      boxShadow: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        'glow-primary': '0 0 24px -4px rgb(64 50 41 / 0.35)',
        'glow-secondary': '0 0 24px -4px rgb(255 154 92 / 0.45)',
        card: '0 2px 12px 0 rgb(0 0 0 / 0.08)',
        'card-dark': '0 2px 12px 0 rgb(0 0 0 / 0.3)',
      },

      // ── Animation ────────────────────────────────────────────
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'fade-up': 'fadeUp 0.4s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'pulse-gentle': 'pulseGentle 2s ease-in-out infinite',
        'bounce-gentle': 'bounceGentle 1s ease-in-out infinite',
        'ani-wave': 'aniWave 0.5s ease-in-out',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        fadeUp: { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideIn: { from: { transform: 'translateX(-100%)' }, to: { transform: 'translateX(0)' } },
        pulseGentle: { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.7' } },
        bounceGentle: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-6px)' } },
        aniWave: { '0%': { transform: 'rotate(0deg)' }, '25%': { transform: 'rotate(-10deg)' }, '75%': { transform: 'rotate(10deg)' }, '100%': { transform: 'rotate(0deg)' } },
      },
    },
  },
  plugins: [],
};
