import type { Config } from 'tailwindcss'
import forms from '@tailwindcss/forms'
import typography from '@tailwindcss/typography'

/**
 * Villa Paradise Tahiti — Design Tokens
 *
 * Source of truth: docs/02-design-identite.md
 *
 * Palette principale :
 *  - lagoon    #006994  Bleu profond du Pacifique (primary / CTA secondaires)
 *  - turquoise #40B4C8  Variante claire du lagon (accent / hover)
 *  - sand      #F5E6C8  Sable chaud (background alterné)
 *  - gold      #C9A84C  Or polynésien (CTA primaire, accents premium)
 *  - pearl     #FAFAF8  Blanc nacre (background principal)
 *  - midnight  #1A2A3A  Nuit tropicale (texte principal)
 *
 * Couleurs utilitaires :
 *  - leaf      #2D6A4F  Vert feuille (badges "Disponible")
 *  - coral     #E8614A  Corail (alertes, urgence)
 */
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Palette principale — chaque couleur dispose d'une échelle 50→950
        lagoon: {
          50: '#E6F1F5',
          100: '#CCE3EB',
          200: '#99C7D7',
          300: '#66ABC3',
          400: '#338FAF',
          500: '#006994',
          600: '#005A80',
          700: '#004A6B',
          800: '#003B55',
          900: '#002B40',
          950: '#001A26',
          DEFAULT: '#006994',
        },
        turquoise: {
          50: '#ECF8FA',
          100: '#D9F0F4',
          200: '#B3E1E9',
          300: '#8DD2DF',
          400: '#66C3D3',
          500: '#40B4C8',
          600: '#3399AA',
          700: '#267E8C',
          800: '#1A636E',
          900: '#0D4750',
          950: '#062C32',
          DEFAULT: '#40B4C8',
        },
        sand: {
          50: '#FDFAF3',
          100: '#FBF5E8',
          200: '#F9EFDA',
          300: '#F7EAC9',
          400: '#F6E8C0',
          500: '#F5E6C8',
          600: '#D6C5A9',
          700: '#A89878',
          800: '#7A6C53',
          900: '#4B412F',
          950: '#2E2719',
          DEFAULT: '#F5E6C8',
        },
        gold: {
          50: '#FBF6E8',
          100: '#F6ECCC',
          200: '#EDD99A',
          300: '#E3C667',
          400: '#D6B658',
          500: '#C9A84C',
          600: '#A88B3D',
          700: '#876E2E',
          800: '#665321',
          900: '#473A16',
          950: '#2A220C',
          DEFAULT: '#C9A84C',
        },
        pearl: {
          50: '#FFFFFF',
          100: '#FDFDFB',
          200: '#FAFAF8',
          300: '#F4F4F0',
          400: '#EAEAE4',
          500: '#DCDCD3',
          600: '#B8B8AC',
          700: '#8B8B7E',
          800: '#5E5E54',
          900: '#33332D',
          950: '#1A1A17',
          DEFAULT: '#FAFAF8',
        },
        midnight: {
          50: '#E8ECF0',
          100: '#D0D6DD',
          200: '#A0AEBC',
          300: '#71869A',
          400: '#425D78',
          500: '#1A2A3A',
          600: '#172534',
          700: '#13202C',
          800: '#0E1822',
          900: '#0A1219',
          950: '#04080D',
          DEFAULT: '#1A2A3A',
        },
        // Couleurs utilitaires
        leaf: {
          50: '#E8F2EC',
          100: '#D1E5DA',
          200: '#A3CBB5',
          300: '#75B190',
          400: '#48986C',
          500: '#2D6A4F',
          600: '#245540',
          700: '#1B3F30',
          800: '#122A20',
          900: '#091510',
          DEFAULT: '#2D6A4F',
        },
        coral: {
          50: '#FCEDE9',
          100: '#F9DBD3',
          200: '#F3B7A8',
          300: '#EE937C',
          400: '#E86F51',
          500: '#E8614A',
          600: '#BA4D3B',
          700: '#8B3A2C',
          800: '#5D261D',
          900: '#2E130F',
          DEFAULT: '#E8614A',
        },
      },
      fontFamily: {
        // Wired via CSS variables exposed in app/layout.tsx through next/font/google
        display: ['var(--font-cormorant)', 'Georgia', 'serif'],
        heading: ['var(--font-playfair)', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      fontSize: {
        // Échelle luxe (titres + body)
        caption: ['0.75rem', { lineHeight: '1.5', letterSpacing: '0.02em' }],
        eyebrow: ['0.72rem', { lineHeight: '1.4', letterSpacing: '0.22em' }],
        'body-sm': ['0.875rem', { lineHeight: '1.65' }],
        'body-md': ['1rem', { lineHeight: '1.7' }],
        'body-lg': ['1.125rem', { lineHeight: '1.7' }],
        'h3-luxe': ['1.5rem', { lineHeight: '1.3', letterSpacing: '0.01em' }],
        'h2-luxe': ['2.25rem', { lineHeight: '1.2', letterSpacing: '0.01em' }],
        'h1-luxe': ['3.5rem', { lineHeight: '1.1', letterSpacing: '0.01em' }],
        'hero-sm': ['3rem', { lineHeight: '1.05', letterSpacing: '0.01em' }],
        'hero-md': ['4.5rem', { lineHeight: '1.02', letterSpacing: '0.01em' }],
        'hero-lg': ['6rem', { lineHeight: '1', letterSpacing: '0.01em' }],
        'hero-display': ['6rem', { lineHeight: '1', letterSpacing: '0.005em' }],
      },
      letterSpacing: {
        luxe: '0.05em',
        wider2: '0.14em',
        widest2: '0.22em',
      },
      spacing: {
        section: '6rem',
        'section-sm': '4rem',
        'section-lg': '8rem',
        gutter: '1.5rem',
        'gutter-lg': '2rem',
      },
      maxWidth: {
        prose: '65ch',
        luxe: '80rem',
      },
      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        card: '0 4px 24px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 12px 40px rgba(0, 0, 0, 0.12)',
        soft: '0 2px 8px rgba(26, 42, 58, 0.06)',
        elevated: '0 24px 60px rgba(0, 0, 0, 0.18)',
        'inner-luxe': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.06)',
      },
      backgroundImage: {
        'hero-overlay':
          'linear-gradient(to top, rgba(10,16,24,0.92) 0%, rgba(10,16,24,0.5) 45%, rgba(10,16,24,0.15) 100%)',
        'gold-shimmer':
          'linear-gradient(90deg, rgba(201,168,76,0) 0%, rgba(201,168,76,0.4) 50%, rgba(201,168,76,0) 100%)',
      },
      transitionTimingFunction: {
        luxe: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      transitionDuration: {
        250: '250ms',
        400: '400ms',
        600: '600ms',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'subtle-zoom': {
          '0%': { transform: 'scale(1.06)' },
          '100%': { transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'scroll-pulse': {
          '0%, 100%': { opacity: '0.5', transform: 'scaleY(1)' },
          '50%': { opacity: '1', transform: 'scaleY(1.15)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 500ms cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in': 'fade-in 400ms ease-out both',
        'subtle-zoom': 'subtle-zoom 14s ease-out forwards',
        shimmer: 'shimmer 2.5s linear infinite',
        'scroll-pulse': 'scroll-pulse 2s ease-in-out infinite',
      },
    },
  },
  plugins: [forms, typography],
}

export default config
