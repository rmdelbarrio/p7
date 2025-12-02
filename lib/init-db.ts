import { config } from 'dotenv';
import { createConnection } from 'mysql2/promise'; // Assuming you use createConnection/pool creation here

config();

// FIX: Change to NAMED import { pool } instead of default import.
// This assumes your lib/db.ts exports the connection as 'pool'
import { pool } from '../lib/db';

async function initDatabase() {
  let connection;
  try {
    // 1. Establish connection (using pool or direct connection from lib/db)
    connection = pool; // Assuming pool is the exported connection/pool object

    console.log('Database connection established. Starting initialization...');

    // 2. Define schema queries (using simple thread/user schema as an example)
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        user_id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        refresh_token VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    const createThreadsTable = `
      CREATE TABLE IF NOT EXISTS threads (
        thread_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
      );
    `;

    await connection.execute(createUsersTable);
    console.log('Table "users" ensured.');

    await connection.execute(createThreadsTable);
    console.log('Table "threads" ensured.');


  } catch (error) {
    console.error('Error during database initialization:', error);
    process.exit(1);
  } finally {
    // In a real script, if 'pool' is a connection pool, you might want to end it here.
    // For simplicity in a Next.js environment, we'll assume it's correctly managed.
    console.log('Database initialization complete.');
  }
}

initDatabase();
