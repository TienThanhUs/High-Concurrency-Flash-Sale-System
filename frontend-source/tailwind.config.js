/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'bg-page': 'var(--bg-page)',
        'bg-panel': 'var(--bg-panel)',
        'bg-panel-light': 'var(--bg-panel-light)',
        'bg-inset': 'var(--bg-inset)',

        'text-main': 'var(--text)',
        'text-muted': 'var(--text-muted)',
        'text-on-accent': 'var(--text-on-accent)',

        outline: 'var(--outline)',

        'pixel-green': {
          light: 'var(--green-light)',
          DEFAULT: 'var(--green)',
          dark: 'var(--green-dark)',
        },
        'pixel-yellow': {
          light: 'var(--yellow-light)',
          DEFAULT: 'var(--yellow)',
          dark: 'var(--yellow-dark)',
        },
        'pixel-blue': {
          light: 'var(--blue-light)',
          DEFAULT: 'var(--blue)',
          dark: 'var(--blue-dark)',
        },
        'pixel-red': {
          light: 'var(--red-light)',
          DEFAULT: 'var(--red)',
          dark: 'var(--red-dark)',
        },
        'pixel-gray': {
          light: 'var(--gray-light)',
          DEFAULT: 'var(--gray)',
          dark: 'var(--gray-dark)',
        },
      },
      fontFamily: {
        logo: ['var(--font-logo)', 'monospace'],
        pixel: ['var(--font-pixel)', 'monospace'],
        body: ['var(--font-body)', 'monospace'],
      },
      boxShadow: {
        none: 'none',
        pixel: 'var(--shadow-offset) var(--shadow-offset) 0 0 var(--outline)',
        'pixel-sm': '2px 2px 0 0 var(--outline)',
        'pixel-lg': '6px 6px 0 0 var(--outline)',
        'pixel-box':
          'inset calc(var(--border-w) * -1) calc(var(--border-w) * -1) 0 0 rgba(0,0,0,.35), inset var(--border-w) var(--border-w) 0 0 rgba(255,255,255,.18), var(--shadow-offset) var(--shadow-offset) 0 0 var(--outline)',
        'pixel-inset':
          'inset 4px 4px 0 0 rgba(0,0,0,.5), inset -4px -4px 0 0 rgba(255,255,255,.08)',
      },
      borderWidth: {
        DEFAULT: 'var(--border-w)',
        sm: 'var(--border-w-sm)',
        '0': '0px',
        '2': '2px',
        '3': '3px',
        '4': '4px',
      },
      borderRadius: {
        none: '0px',
        DEFAULT: '0px',
      },
      transitionTimingFunction: {
        pixel: 'steps(2)',
        blink: 'steps(1)',
      },
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
        '16': '64px',
      },
    },
  },
  plugins: [],
};
