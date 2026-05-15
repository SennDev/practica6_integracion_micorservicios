import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');
const apiTargets = {
  '/api/courses': process.env['COURSES_SERVICE_URL'] ?? 'http://localhost:3001',
  '/api/enrollments': process.env['ENROLLMENTS_SERVICE_URL'] ?? 'http://localhost:3002',
  '/api/contact': process.env['CONTACT_SERVICE_URL'] ?? 'http://localhost:3003',
};

const app = express();
const angularApp = new AngularNodeAppEngine();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

for (const [prefix, target] of Object.entries(apiTargets)) {
  app.use(prefix, async (req, res) => {
    try {
      const upstreamUrl = new URL(req.originalUrl, target);
      const headers = new Headers();

      Object.entries(req.headers).forEach(([key, value]) => {
        if (!value || ['host', 'content-length', 'connection'].includes(key)) {
          return;
        }

        if (Array.isArray(value)) {
          headers.set(key, value.join(','));
        } else {
          headers.set(key, value);
        }
      });

      const upstreamResponse = await fetch(upstreamUrl, {
        method: req.method,
        headers,
        body:
          ['GET', 'HEAD'].includes(req.method) || Object.keys(req.body ?? {}).length === 0
            ? undefined
            : JSON.stringify(req.body),
      });

      upstreamResponse.headers.forEach((value, key) => {
        if (['content-length', 'connection', 'keep-alive', 'transfer-encoding'].includes(key)) {
          return;
        }

        res.setHeader(key, value);
      });

      const body = Buffer.from(await upstreamResponse.arrayBuffer());
      res.status(upstreamResponse.status).send(body);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Proxy no disponible';
      res.status(502).json({
        message: 'No fue posible conectar con el microservicio solicitado.',
        details: message,
      });
    }
  });
}

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
