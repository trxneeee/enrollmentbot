export default {
  server: {
    proxy: {
      "/api": "http://127.0.0.1:5000", // Proxy for development
    },
  },
  build: {
    chunkSizeWarningLimit: 1000, // Increase chunk size warning limit to 1MB
    rollupOptions: {
      output: {
        manualChunks: {
          // Example: Split @botpress/chat into its own chunk
          'botpress-chat': ['@botpress/chat'],
          // Add more dynamic chunking logic if needed
        },
      },
    },
  },
};
