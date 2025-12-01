// scripts/debug-env.ts
import { config } from 'dotenv';
import { resolve } from 'path';
import { readFileSync, existsSync } from 'fs';

console.log('🔍 Debugging environment setup...');

// Check if .env.local exists
const envLocalPath = resolve(process.cwd(), '.env.local');
console.log('📁 .env.local path:', envLocalPath);
console.log('📁 File exists:', existsSync(envLocalPath));

if (existsSync(envLocalPath)) {
  console.log('📄 File content:');
  const content = readFileSync(envLocalPath, 'utf8');
  // Mask passwords in the output
  const maskedContent = content.replace(/(password[^=]*=)([^\s]+)/gi, '$1****');
  console.log(maskedContent);
} else {
  console.log('❌ .env.local file not found!');
}

// Try to load .env.local
console.log('\n🔄 Loading .env.local...');
const result = config({ path: envLocalPath });

if (result.error) {
  console.error('❌ Error loading .env.local:', result.error);
} else {
  console.log('✅ Successfully loaded .env.local');
}

// Check what environment variables are loaded
console.log('\n📋 Loaded environment variables:');
const envVars = Object.keys(process.env)
  .filter(key => key.includes('POSTGRES') || key.includes('DATABASE') || key.includes('DB'))
  .map(key => ({
    key,
    value: process.env[key]?.replace(/:([^:]+)@/, ':****@') // Mask passwords
  }));

if (envVars.length === 0) {
  console.log('   No database-related environment variables found');
} else {
  envVars.forEach(({ key, value }) => {
    console.log(`   ${key}=${value}`);
  });
}

console.log('\n💡 Current working directory:', process.cwd());