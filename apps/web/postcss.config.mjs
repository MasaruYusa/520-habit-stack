/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
  // Windows環境でのパス解決問題を回避
  map: false,
};

export default config;