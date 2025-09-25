import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '../../lib/db-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const result = await query('SELECT * FROM scheduled_tests ORDER BY created_at DESC');
      const tests = result.rows.map(row => ({
        id: row.id,
        title: row.title,
        description: row.description,
        startDate: row.start_date,
        endDate: row.end_date,
        duration: row.duration,
        topics: row.topics,
        questionCount: row.question_count,
        isActive: row.is_active,
        createdAt: row.created_at
      }));
      
      res.status(200).json(tests);
    } catch (error) {
      console.error('Error fetching scheduled tests:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}