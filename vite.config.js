import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

/**
 * Content Security Policy for production builds (dev needs inline scripts for
 * hot reload, so it is only added by `vite build`). Allows Google Fonts, blob:
 * images for the try-on photo and uploads, and the Supabase project (catalog,
 * admin login, product images); everything else is same-origin.
 */
const csp = (supabase) =>
  [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    `img-src 'self' data: blob:${supabase ? ` ${supabase}` : ''}`,
    `connect-src 'self'${supabase ? ` ${supabase} ${supabase.replace(/^https/, 'wss')}` : ''}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');

const cspMeta = (supabase) => ({
  name: 'csp-meta',
  apply: 'build',
  transformIndexHtml: {
    order: 'post',
    handler: (html) =>
      html.replace('<meta charset="UTF-8" />', `<meta charset="UTF-8" />\n    <meta http-equiv="Content-Security-Policy" content="${csp(supabase)}" />`),
  },
});

/**
 * `npm run dev` runs the serverless functions in api/ the way Vercel does
 * (req.body parsed, res.status().json()), so checkout works locally too.
 */
const devApi = () => ({
  name: 'dev-api',
  apply: 'serve',
  configureServer(server) {
    server.middlewares.use('/api', async (req, res, next) => {
      const name = req.url.split('?')[0].replace(/^\/+|\/+$/g, '');
      if (!/^[a-z0-9-]+$/.test(name)) return next();
      let mod;
      try {
        mod = await server.ssrLoadModule(`/api/${name}.js`);
      } catch {
        return next();
      }
      let raw = '';
      for await (const chunk of req) raw += chunk;
      try {
        req.body = raw && /json/.test(req.headers['content-type'] || '') ? JSON.parse(raw) : raw;
      } catch {
        req.body = raw;
      }
      res.status = (code) => ((res.statusCode = code), res);
      res.json = (data) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(data));
        return res;
      };
      try {
        await mod.default(req, res);
      } catch (e) {
        console.error(e);
        if (!res.headersSent) res.status(500).json({ error: String(e) });
      }
    });
  },
});

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // server functions read process.env, as they do on Vercel
  for (const [k, v] of Object.entries(env)) process.env[k] ??= v;
  const supabase = (env.SUPABASE_URL || '').replace(/\/+$/, '');
  return {
    // Vite only exposes VITE_* vars to the browser, so pass the two public ones
    // by name. Never add SUPABASE_SECRET_KEY here.
    define: {
      'import.meta.env.SUPABASE_URL': JSON.stringify(env.SUPABASE_URL || ''),
      'import.meta.env.SUPABASE_KEY': JSON.stringify(env.SUPABASE_KEY || ''),
    },
    plugins: [react(), tailwindcss(), cspMeta(supabase), devApi()],
    build: {
      sourcemap: false,
    },
  };
});
