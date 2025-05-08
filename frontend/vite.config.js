// vite.config.js
export default {
  server: {
    proxy: {
      "/api": "http://127.0.0.1:5000",
    },
  },
  build: {
	chunkSizeWarningLimit: 3000, 
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
};
