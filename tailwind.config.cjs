module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        accent: '#2563eb'
      }
    }
  },
  plugins: [],
  darkMode: 'class', // Add this line to enable class-based dark mode
}
