const { hairlineWidth } = require('nativewind/theme')

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    '../../packages/components/**/*.{js,jsx,ts,tsx}',
    '../../packages/app/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        placeholder: 'hsl(var(--placeholder))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        inverse: {
          DEFAULT: 'hsl(var(--inverse))',
          foreground: 'hsl(var(--inverse-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          muted: 'hsl(var(--primary-muted))',
          accent: 'hsl(var(--primary-accent))',
          'accent-muted': 'hsl(var(--primary-accent-muted))',
          active: 'hsl(var(--primary-active))',
          subtle: 'hsl(var(--primary-subtle))',
          contrast: 'hsl(var(--primary-contrast))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
          active: 'hsl(var(--secondary-active))',
          subtle: 'hsl(var(--secondary-subtle))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        info: {
          DEFAULT: 'hsl(var(--info))',
          foreground: 'hsl(var(--info-foreground))',
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
          subtle: 'hsl(var(--destructive-subtle))',
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          foreground: 'hsl(var(--warning-foreground))',
        },
        purple: {
          DEFAULT: 'hsl(var(--purple))',
          foreground: 'hsl(var(--purple-foreground))',
        },
      },
      borderWidth: {
        hairline: hairlineWidth(),
      },
      fontFamily: {
        sans: ['System'],
        'sans-italic': ['System'],
        'sans-medium': ['System'],
        'sans-semibold': ['System'],
        'sans-bold': ['System'],
      },
      minHeight: {
        textarea: '5rem',
      },
      spacing: {
        'alert-icon-inset': '3.125rem',
      },
    },
  },
  plugins: [],
}
