import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { query } from '../../../lib/db-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password, username, name } = req.body;

  if (!email || !password || !username) {
    return res.status(400).json({ error: 'Email, password, and username are required' });
  }

  try {
    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Determine role based on email
    const role = email.includes('admin') ? 'admin' : 'student';

    // Create user and profile in transaction
    const client = await query('BEGIN');
    
    try {
      // Insert user
      const userResult = await query(
        'INSERT INTO users (email, password_hash, email_verified) VALUES ($1, $2, $3) RETURNING id',
        [email, hashedPassword, true]
      );

      const userId = userResult.rows[0].id;

      // Insert profile
      await query(
        'INSERT INTO profiles (id, username, name, email, role) VALUES ($1, $2, $3, $4, $5)',
        [userId, username, name, email, role]
      );

      await query('COMMIT');

      // Return user data
      const userData = {
        id: userId,
        username,
        email,
        role,
        name
      };

      res.status(201).json({ user: userData });
    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}