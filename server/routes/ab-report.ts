import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.get('/ab', authenticate, requireRole('ceo'), async (req: any, res) => {
  try {
    const file = path.join(__dirname, '..', 'logs', 'ab.log');
    if (!fs.existsSync(file)) {
      return res.json({ experiments: [] });
    }
    const lines = fs.readFileSync(file, 'utf8').trim().split('\n').filter(Boolean);
    const stats: any = {};
    for (const line of lines) {
      try {
        const r = JSON.parse(line);
        const key = r.experiment || 'unknown';
        stats[key] = stats[key] || { A: { impressions: 0, conversions: 0 }, B: { impressions: 0, conversions: 0 } };
        const v = (r.variant === 'A' || r.variant === 'B') ? r.variant : 'B';
        if (r.event === 'impression') stats[key][v].impressions++;
        if (r.event === 'conversion') stats[key][v].conversions++;
      } catch {}
    }
    res.json({ experiments: stats });
  } catch (e) {
    res.status(500).json({ error: 'Failed to read report' });
  }
});

export default router;
