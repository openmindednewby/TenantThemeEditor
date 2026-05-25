import { defineConfig, loadEnv, ConfigEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }: ConfigEnv) => {
  const env = loadEnv(mode, process.cwd());
  const identityUrl = process.env['VITE_IDENTITY_URL'] || env['VITE_IDENTITY_URL'] || 'http://localhost:5002';
  const contentUrl = process.env['VITE_CONTENT_URL'] || env['VITE_CONTENT_URL'] || 'http://localhost:5009';

  return {
    plugins: [react()].filter(Boolean),
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './src/components'),
        '@stores': path.resolve(__dirname, './src/stores'),
        '@utils': path.resolve(__dirname, './src/utils'),
        '@api': path.resolve(__dirname, './src/api'),
        '@localization': path.resolve(__dirname, './src/localization'),
        '@styles': path.resolve(__dirname, './src/styles'),
      },
    },
    build: {
      minify: 'esbuild',
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/'))
              return 'react-vendor';
            if (id.includes('zustand')) return 'state';
            if (id.includes('@tanstack/react-query')) return 'query-vendor';
            if (id.includes('i18next')) return 'i18n';
            if (id.includes('axios')) return 'http';
            return undefined;
          },
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
        },
      },
      sourcemap: false,
      target: 'es2020',
      cssCodeSplit: true,
      chunkSizeWarningLimit: 500,
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-dom/client',
        'react/jsx-runtime',
        'zustand',
        'zustand/middleware',
        '@tanstack/react-query',
        'i18next',
        'react-i18next',
        'axios',
      ],
    },
    preview: {
      port: 4447,
      strictPort: true,
      proxy: {
        '/api/identity': {
          target: identityUrl,
          changeOrigin: true,
          rewrite: (p: string) => p.replace(/^\/api\/identity/, '/api'),
        },
        '/api/content': {
          target: contentUrl,
          changeOrigin: true,
          rewrite: (p: string) => p.replace(/^\/api\/content/, '/api'),
        },
      },
    },
    server: {
      port: 4446,
      strictPort: true,
      open: false,
      proxy: {
        '/api/identity': {
          target: identityUrl,
          changeOrigin: true,
          rewrite: (p: string) => p.replace(/^\/api\/identity/, '/api'),
        },
        '/api/content': {
          target: contentUrl,
          changeOrigin: true,
          rewrite: (p: string) => p.replace(/^\/api\/content/, '/api'),
        },
      },
    },
    esbuild: {
      legalComments: 'none',
      keepNames: true,
    },
  };
});
