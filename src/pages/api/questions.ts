import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '../../lib/db-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const result = await query('SELECT * FROM questions ORDER BY created_at DESC');
      const questions = result.rows.map(row => ({
        id: row.id,
        text: row.text,
        options: row.options,
        correctOption: row.correct_option,
        explanation: row.explanation,
        topic: row.topic
      }));
      
      res.status(200).json(questions);
    } catch (error) {
      console.error('Error fetching questions:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}