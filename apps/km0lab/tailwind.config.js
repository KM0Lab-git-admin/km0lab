/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
    '../../packages/components/**/*.{js,jsx,ts,tsx}',
    '../../packages/app/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: { '2xl': '1400px' },
    },
    /**
     * screens estándar de Tailwind. Lovable usa sm:/md: en algunos
     * componentes portados; los conservamos para que esas clases
     * funcionen. El AGENTS.md sigue prohibiendo su uso en código
     * nuevo: usar los breakpoints semánticos del proyecto
     * (vertical-mobile, vertical-tablet, horizontal-mobile,
     * horizontal-desktop).
     */
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        km0: {
          blue: {
            50: 'hsl(var(--km0-blue-50))',
            100: 'hsl(var(--km0-blue-100))',
            200: 'hsl(var(--km0-blue-200))',
            300: 'hsl(var(--km0-blue-300))',
            400: 'hsl(var(--km0-blue-400))',
            500: 'hsl(var(--km0-blue-500))',
            600: 'hsl(var(--km0-blue-600))',
            700: 'hsl(var(--km0-blue-700))',
            800: 'hsl(var(--km0-blue-800))',
            900: 'hsl(var(--km0-blue-900))',
          },
          beige: {
            50: 'hsl(var(--km0-beige-50))',
            100: 'hsl(var(--km0-beige-100))',
            200: 'hsl(var(--km0-beige-200))',
            300: 'hsl(var(--km0-beige-300))',
            400: 'hsl(var(--km0-beige-400))',
            500: 'hsl(var(--km0-beige-500))',
            600: 'hsl(var(--km0-beige-600))',
            700: 'hsl(var(--km0-beige-700))',
            800: 'hsl(var(--km0-beige-800))',
            900: 'hsl(var(--km0-beige-900))',
          },
          yellow: {
            50: 'hsl(var(--km0-yellow-50))',
            100: 'hsl(var(--km0-yellow-100))',
            200: 'hsl(var(--km0-yellow-200))',
            300: 'hsl(var(--km0-yellow-300))',
            400: 'hsl(var(--km0-yellow-400))',
            500: 'hsl(var(--km0-yellow-500))',
            600: 'hsl(var(--km0-yellow-600))',
            700: 'hsl(var(--km0-yellow-700))',
            800: 'hsl(var(--km0-yellow-800))',
            900: 'hsl(var(--km0-yellow-900))',
          },
          teal: {
            50: 'hsl(var(--km0-teal-50))',
            100: 'hsl(var(--km0-teal-100))',
            200: 'hsl(var(--km0-teal-200))',
            300: 'hsl(var(--km0-teal-300))',
            400: 'hsl(var(--km0-teal-400))',
            500: 'hsl(var(--km0-teal-500))',
            600: 'hsl(var(--km0-teal-600))',
            700: 'hsl(var(--km0-teal-700))',
            800: 'hsl(var(--km0-teal-800))',
            900: 'hsl(var(--km0-teal-900))',
          },
          coral: {
            50: 'hsl(var(--km0-coral-50))',
            100: 'hsl(var(--km0-coral-100))',
            200: 'hsl(var(--km0-coral-200))',
            300: 'hsl(var(--km0-coral-300))',
            400: 'hsl(var(--km0-coral-400))',
            500: 'hsl(var(--km0-coral-500))',
            600: 'hsl(var(--km0-coral-600))',
            700: 'hsl(var(--km0-coral-700))',
            800: 'hsl(var(--km0-coral-800))',
            900: 'hsl(var(--km0-coral-900))',
          },
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      fontFamily: {
        brand: ["'Antique Olive'", 'Impact', 'Arial Black', 'sans-serif'],
        ui: ["'Inter'", 'sans-serif'],
        body: ["'DM Sans'", "'Inter'", 'sans-serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        float: 'float 3s ease-in-out infinite',
        'float-slow': 'float 3.4s ease-in-out infinite',
        'float-slower': 'float 3.8s ease-in-out infinite',
        'float-slowest': 'float 4.2s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 0.4s ease-out forwards',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/typography'),
    /**
     * Breakpoints oficiales del proyecto, alineados con Playwright.
     * Cubren rangos amplios sin condición de altura: toda combinación
     * de orientación + ancho cae siempre en exactamente un breakpoint.
     *
     * Adicionalmente exponemos aliases idénticos a los que usa el
     * proyecto Lovable (short-landscape, wide-landscape, tablet-portrait)
     * para que el código portado funcione sin reescribir cada clase.
     * En código NUEVO en producción se prefieren los nombres oficiales.
     */
    function ({ addVariant }) {
      addVariant('vertical-mobile', '@media (orientation: portrait) and (max-width: 767px)')
      addVariant('vertical-tablet', '@media (orientation: portrait) and (min-width: 768px)')
      addVariant('horizontal-mobile', '@media (orientation: landscape) and (max-width: 1279px)')
      addVariant('horizontal-desktop', '@media (orientation: landscape) and (min-width: 1280px)')

      // Aliases para compatibilidad con código portado de Lovable.
      addVariant('short-landscape', '@media (orientation: landscape) and (max-width: 1279px)')
      addVariant('wide-landscape', '@media (orientation: landscape) and (min-width: 1280px)')
      addVariant('tablet-portrait', '@media (orientation: portrait) and (min-width: 768px)')
    },
  ],
}
