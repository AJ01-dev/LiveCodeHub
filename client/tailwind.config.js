/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // GitHub Dark palette — flat tokens so bg-gh-canvas, text-gh-fg-subtle, etc. always resolve
        'gh-canvas': '#0d1117',
        'gh-subtle': '#161b22',
        'gh-inset': '#010409',
        'gh-border': '#30363d',
        'gh-border-muted': '#21262d',
        'gh-fg': '#e6edf3',
        'gh-muted': '#8b949e',
        'gh-fg-subtle': '#6e7681',
        'gh-accent': '#58a6ff',
        'gh-accent-muted': '#388bfd26',
        'gh-success': '#3fb950',
        'gh-warning': '#d29922',
        'gh-danger': '#f85149',
        'gh-purple': '#a371f7',
        vscode: {
          sidebar: '#181818',
          panel: '#1e1e1e',
          titlebar: '#1f1f1f',
          tab: '#2d2d2d',
          tabActive: '#1e1e1e',
          statusbar: '#007acc',
        },
      },
      fontFamily: {
        sans: ['Geist', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '6px',
        md: '8px',
        lg: '10px',
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
      },
    },
  },
  plugins: [],
};
