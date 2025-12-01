import { Pool } from 'pg';

// Aiven PostgreSQL connection
const pool = new Pool({
  user: process.env.AIVEN_DB_USER,
  host: process.env.AIVEN_DB_HOST,
  database: process.env.AIVEN_DB_NAME,
  password: process.env.AIVEN_DB_PASSWORD,
  port: parseInt(process.env.AIVEN_DB_PORT || '5432'),
  ssl: {
    rejectUnauthorized: false // Aiven requires SSL
  }
});

// Create users table if it doesn't exist
const initDb = async () => {
  try {
    const client = await pool.connect();
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `);
    client.release();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
};

initDb();

export { pool };