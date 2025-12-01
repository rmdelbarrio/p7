// scripts/test-aiven.ts
import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
const envPath = resolve(process.cwd(), '.env.local');
console.log('📁 Loading environment from:', envPath);

const result = config({ path: envPath });

if (result.error) {
  console.error('❌ Error loading .env.local:', result.error);
} else {
  console.log('✅ Successfully loaded .env.local');
}

async function testAivenConnection() {
  console.log('🔧 Testing Aiven PostgreSQL connection...');
  
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('❌ DATABASE_URL not found in .env.local');
    return;
  }

  // Mask the password in logs
  const maskedUrl = connectionString.replace(/:([^:]+)@/, ':****@');
  console.log('Connection string:', maskedUrl);

  const client = new Client({
    connectionString: connectionString,
    ssl: {
      rejectUnauthorized: false, // This is crucial for Aiven
    },
    connectionTimeoutMillis: 15000,
  });

  try {
    console.log('🔄 Connecting to Aiven...');
    console.log('Note: Aiven requires SSL with self-signed certificates');
    await client.connect();
    console.log('✅ Successfully connected to Aiven PostgreSQL!');

    // Test basic query
    const versionResult = await client.query('SELECT version()');
    console.log('📋 PostgreSQL version:', versionResult.rows[0].version);

    // List tables to verify we can query
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('📊 Existing tables:', tablesResult.rows.map(row => row.table_name));

    console.log('🎉 Aiven connection test completed successfully!');
    
  } catch (error) {
    console.error('❌ Aiven connection failed:');
    
    if (error instanceof Error) {
      console.log('Error message:', error.message);
      console.log('Error code:', (error as any).code);
      
      if (error.message.includes('self-signed certificate')) {
        console.log('\n💡 Solution: Aiven uses self-signed certificates');
        console.log('   Make sure you have rejectUnauthorized: false in SSL config');
      } else if (error.message.includes('ECONNREFUSED')) {
        console.log('\n💡 Solution: Check if the host and port are correct');
      } else if (error.message.includes('password authentication')) {
        console.log('\n💡 Solution: Check if the password is correct');
      }
    }
  } finally {
    await client.end();
    console.log('🔚 Connection closed');
  }
}

testAivenConnection();