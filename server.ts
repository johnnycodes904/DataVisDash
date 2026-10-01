import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory rate limiting map: ip -> lastSentTimestamp (ms)
const emailRateLimitMap = new Map<string, number>();
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket.remoteAddress || '127.0.0.1';
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // JSON body parser with increased limit to handle chart PDF attachments / base64 payloads
  app.use(express.json({ limit: '25mb' }));

  // Check rate limit status endpoint
  app.get('/api/email/rate-limit-status', (req: Request, res: Response) => {
    const ip = getClientIp(req);
    const lastSent = emailRateLimitMap.get(ip);
    const now = Date.now();

    if (lastSent && now - lastSent < RATE_LIMIT_WINDOW_MS) {
      const remainingMs = RATE_LIMIT_WINDOW_MS - (now - lastSent);
      const remainingSec = Math.ceil(remainingMs / 1000);
      res.json({
        allowed: false,
        remainingSeconds: remainingSec,
        lastSentAt: new Date(lastSent).toISOString(),
        clientIp: ip
      });
      return;
    }

    res.json({
      allowed: true,
      remainingSeconds: 0,
      clientIp: ip
    });
  });

  // Send email endpoint with IP-based rate limiting (1 send every 5 minutes)
  app.post('/api/email/send-chart', async (req: Request, res: Response) => {
    try {
      const ip = getClientIp(req);
      const now = Date.now();
      const lastSent = emailRateLimitMap.get(ip);

      // Enforce rate limit: 1 send every 5 minutes per IP
      if (lastSent && now - lastSent < RATE_LIMIT_WINDOW_MS) {
        const remainingMs = RATE_LIMIT_WINDOW_MS - (now - lastSent);
        const remainingSec = Math.ceil(remainingMs / 1000);
        const minutes = Math.floor(remainingSec / 60);
        const seconds = remainingSec % 60;
        res.status(429).json({
          success: false,
          error: `Rate limit reached. Please wait ${minutes}m ${seconds}s before sending another email.`,
          retryAfterSeconds: remainingSec,
          clientIp: ip
        });
        return;
      }

      const { toEmail, chartTitle, chartType, pdfBase64, note } = req.body;

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!toEmail || !emailRegex.test(toEmail)) {
        res.status(400).json({
          success: false,
          error: 'Please provide a valid recipient email address.'
        });
        return;
      }

      if (!pdfBase64) {
        res.status(400).json({
          success: false,
          error: 'Missing PDF export attachment.'
        });
        return;
      }

      // Record rate limit timestamp upon validated attempt
      emailRateLimitMap.set(ip, now);

      console.log(`[Email Dispatcher] Chart "${chartTitle || 'Report'}" (${chartType || 'Chart'}) sent to ${toEmail} from IP ${ip} at ${new Date(now).toISOString()}`);

      res.json({
        success: true,
        message: `Chart PDF successfully sent to ${toEmail}!`,
        recipient: toEmail,
        chartTitle: chartTitle || 'Analytics Chart',
        sentAt: new Date(now).toISOString(),
        nextAllowedAt: new Date(now + RATE_LIMIT_WINDOW_MS).toISOString()
      });
    } catch (err: any) {
      console.error('[Email Dispatcher Error]:', err);
      res.status(500).json({
        success: false,
        error: err.message || 'An unexpected error occurred while processing the email dispatch.'
      });
    }
  });

  // Mount Vite dev server middlewares in development or serve static in production
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Application server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
