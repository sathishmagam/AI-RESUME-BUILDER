import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, Plugin} from 'vite';
import { generateSummaryAI, enhanceBulletAI, calculateAtsScoreAI, generateCoverLetterAI } from './src/server/aiHandler';

function apiServerPlugin(): Plugin {
  return {
    name: 'api-server-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/ai/')) {
          return next();
        }

        let body = '';
        req.on('data', chunk => {
          body += chunk;
        });

        req.on('end', async () => {
          try {
            const parsedBody = body ? JSON.parse(body) : {};
            res.setHeader('Content-Type', 'application/json');

            if (req.url === '/api/ai/generate-summary') {
              const result = await generateSummaryAI(parsedBody);
              res.end(JSON.stringify({ success: true, summaries: result }));
              return;
            }

            if (req.url === '/api/ai/enhance-bullet') {
              const result = await enhanceBulletAI(parsedBody);
              res.end(JSON.stringify({ success: true, bullets: result }));
              return;
            }

            if (req.url === '/api/ai/ats-score') {
              const result = await calculateAtsScoreAI(parsedBody);
              res.end(JSON.stringify({ success: true, result }));
              return;
            }

            if (req.url === '/api/ai/cover-letter') {
              const result = await generateCoverLetterAI(parsedBody);
              res.end(JSON.stringify({ success: true, coverLetter: result }));
              return;
            }

            res.statusCode = 404;
            res.end(JSON.stringify({ error: 'Endpoint not found' }));
          } catch (err: any) {
            console.error('API middleware error:', err);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message || 'Internal server error' }));
          }
        });
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiServerPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
