import express from 'express';
import { query } from './db.js';
import { QueryResult } from 'pg';

const router = express.Router();

router.get('/connection', async  (req: any, res: any) => {
    try {
        const result: QueryResult = await query('SELECT NOW()', []);
        res.json({ success: true, serverTime: result.rows[0].now });
        console.log('Database connection success')
      } catch (error) {
        console.error('Database connection error:', error);
        res.status(500).json({ success: false, message: 'Database connection error' });
      }
});

export default router;

