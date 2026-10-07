// Vite serves the pages in client/ during development
// and builds them into dist/ for production.
import { defineConfig } from 'vite';

export default defineConfig({
  root: 'client',

  // One HTML file per page, no single-page-app fallback.
  appType: 'mpa',

  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rolldownOptions: {
      input: [
        'index.html',
        'events/index.html',
        'event/index.html',
        'confirmation/index.html',
      ],
    },
  },
});
