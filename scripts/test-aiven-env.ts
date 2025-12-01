// scripts/test-aiven-env.ts
import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
const envPath = resolve(process.cwd(), '.env.local');
config({ path: envPath });

async function testAivenWithEnvVars() {
  console.log('🔧 Testing Aiven connection with environment variables...');
  
  const { 
    POSTGRES_HOST, 
    POSTGRES_PORT, 
    POSTGRES_USER, 
    POSTGRES_PASSWORD, 
    POSTGRES_DATABASE 
  } = process.env;

  if (!POSTGRES_HOST || !POSTGRES_USER || !POSTGRES_PASSWORD) {
    console.error('❌ Missing required environment variables');
    return;
  }

  const clientConfig = {
    host: POSTGRES_HOST,
    port: parseInt(POSTGRES_PORT || '25538'),
    user: POSTGRES_USER,
    password: POSTGRES_PASSWORD,
    database: POSTGRES_DATABASE || 'defaultdb',
    ssl: {
      rejectUnauthorized: false
    },
    connectionTimeoutMillis: 15000,
  };

  console.log('Config:', { 
    ...clientConfig, 
    password: '****' // Mask password in logs
  });

  const client = new Client(clientConfig);

  try {
    console.log('🔄 Connecting to Aiven...');
    await client.connect();
    console.log('✅ Successfully connected to Aiven PostgreSQL!');

    const versionResult = await client.query('SELECT version()');
    console.log('📋 PostgreSQL version:', versionResult.rows[0].version);
    
    console.log('🎉 Connection test successful!');
    
  } catch (error) {
    console.error('❌ Connection failed:');
    console.error(error);
  } finally {
    await client.end();
  }
}

testAivenWithEnvVars();