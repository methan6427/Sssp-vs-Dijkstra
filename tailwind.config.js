/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                // Algorithm visualization colors
                'node-unvisited': '#9CA3AF',
                'node-visited': '#3B82F6',
                'node-current': '#FBBF24',
                'node-complete': '#10B981',
                'node-pivot': '#8B5CF6',
                'path-shortest': '#EF4444',
                // Dark mode variants
                'dark-bg': '#0F172A',
                'dark-surface': '#1E293B',
                'dark-border': '#334155',
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'fade-in': 'fadeIn 0.3s ease-in-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                }
            }
        },
    },
    plugins: [],
}
