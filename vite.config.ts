import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, Plugin} from 'vite';
import http from 'http';
import https from 'https';

function fetchWithRedirects(
  currentUrl: string,
  res: http.ServerResponse,
  maxRedirects: number = 5
) {
  if (maxRedirects <= 0) {
    res.statusCode = 502;
    res.end('Too many redirects');
    return;
  }

  try {
    const parsed = new URL(currentUrl);
    const fetchLib = parsed.protocol === 'https:' ? https : http;

    const requestOptions = {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Accept-Language': 'es,en;q=0.9',
      },
    };

    fetchLib
      .get(currentUrl, requestOptions, (proxyRes) => {
        if (
          proxyRes.statusCode &&
          proxyRes.statusCode >= 300 &&
          proxyRes.statusCode < 400 &&
          proxyRes.headers.location
        ) {
          const redirectUrl = new URL(proxyRes.headers.location, currentUrl).href;
          fetchWithRedirects(redirectUrl, res, maxRedirects - 1);
          return;
        }

        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', '*');
        res.setHeader(
          'Content-Type',
          proxyRes.headers['content-type'] || 'image/jpeg'
        );
        res.setHeader('Cache-Control', 'public, max-age=86400');
        proxyRes.pipe(res);
      })
      .on('error', (err) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.statusCode = 502;
        res.end('Proxy error: ' + err.message);
      });
  } catch (err: any) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.statusCode = 400;
    res.end('Invalid URL: ' + err.message);
  }
}

function imageProxyPlugin(): Plugin {
  return {
    name: 'image-proxy-middleware',
    configureServer(server) {
      server.middlewares.use('/api/proxy-image', (req, res) => {
        if (req.method === 'OPTIONS') {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', '*');
          res.statusCode = 204;
          res.end();
          return;
        }

        try {
          const host = req.headers.host || 'localhost:3000';
          const reqUrl = new URL(req.url || '', `http://${host}`);
          const targetUrl = reqUrl.searchParams.get('url');

          if (!targetUrl) {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.statusCode = 400;
            res.end('Missing url parameter');
            return;
          }

          fetchWithRedirects(targetUrl, res);
        } catch (err: any) {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.statusCode = 500;
          res.end(err.message || 'Internal proxy error');
        }
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), imageProxyPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
