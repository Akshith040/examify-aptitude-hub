import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export { pool };

export async function query(text: string, params?: any[]) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

// Helper functions for common operations
export async function getUserById(id: string) {
  const result = await query(
    'SELECT u.*, p.username, p.name, p.role FROM users u JOIN profiles p ON u.id = p.id WHERE u.id = $1',
    [id]
  );
  return result.rows[0];
}

export async function getUserByEmail(email: string) {
  const result = await query(
    'SELECT u.*, p.username, p.name, p.role FROM users u JOIN profiles p ON u.id = p.id WHERE u.email = $1',
    [email]
  );
  return result.rows[0];
}

export async function createUser(email: string, passwordHash: string, userData: any) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Insert user
    const userResult = await client.query(
      'INSERT INTO users (email, password_hash, email_verified) VALUES ($1, $2, $3) RETURNING id',
      [email, passwordHash, true]
    );
    
    const userId = userResult.rows[0].id;
    
    // Insert profile
    await client.query(
      'INSERT INTO profiles (id, username, name, email, role) VALUES ($1, $2, $3, $4, $5)',
      [userId, userData.username, userData.name, email, userData.role || 'student']
    );
    
    await client.query('COMMIT');
    return userId;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}