import { Router } from 'express';
import fs from 'fs';
import path from 'path';

const router = Router();

router.post('/ab', async (req: any, res) => {
  try {
    const record = {
      ts: new Date().toISOString(),
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress || '',
      ua: req.headers['user-agent'] || '',
      experiment: String(req.body?.experiment || ''),
      variant: String(req.body?.variant || ''),
      event: String(req.body?.event || ''),
    };
    const dir = path.join(__dirname, '..', 'logs');
    fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, 'ab.log');
    fs.appendFileSync(file, JSON.stringify(record) + '\n');
    res.json({ status: 'ok' });
  } catch (e) {
    res.status(500).json({ error: 'Failed to record analytics' });
  }
});

export default router;
