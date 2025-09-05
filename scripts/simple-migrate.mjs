#!/usr/bin/env node

import { execSync } from 'child_process';

console.log('🚀 Simple production migration...');

try {
  // Just generate the client - no database operations during build
  console.log('🔧 Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client generated!');
} catch (error) {
  console.error('❌ Failed to generate client:', error.message);
  process.exit(1);
}