import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

/**
 * Content Security Policy for production builds (dev needs inline scripts for
 * hot reload, so it is only added by `vite build`). Allows Google Fonts and
 * blob: images for the try-on photo; everything else is same-origin.
 */
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

const cspMeta = () => ({
  name: 'csp-meta',
  apply: 'build',
  transformIndexHtml: {
    order: 'post',
    handler: (html) =>
      html.replace('<meta charset="UTF-8" />', `<meta charset="UTF-8" />\n    <meta http-equiv="Content-Security-Policy" content="${CSP}" />`),
  },
});

export default defineConfig({
  plugins: [react(), tailwindcss(), cspMeta()],
  build: {
    sourcemap: false,
  },
});
