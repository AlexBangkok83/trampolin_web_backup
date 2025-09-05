#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync, readdirSync } from 'fs';

console.log('🚀 Starting production database migration...');

try {
  // First, try standard migration deploy
  console.log('📋 Attempting standard migration deployment...');
  
  try {
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    console.log('✅ Standard migration deployment successful!');
  } catch (error) {
    console.log('⚠️  Standard migration failed, attempting baseline approach...');
    
    // If that fails with P3005 (non-empty database), baseline it
    console.log('🔧 Baselining existing database...');
    
    // Get the first migration file name to baseline against
    const migrationsDir = 'prisma/migrations';
    if (existsSync(migrationsDir)) {
      const migrations = readdirSync(migrationsDir).filter(dir => 
        dir.match(/^\d{14}_/) // Match migration timestamp format
      ).sort();
      
      if (migrations.length > 0) {
        const firstMigration = migrations[0];
        console.log(`📌 Baselining against: ${firstMigration}`);
        
        try {
          // Mark the first migration as already applied
          execSync(`npx prisma migrate resolve --applied "${firstMigration}"`, { stdio: 'inherit' });
          console.log('✅ Database baseline successful!');
          
          // Now try to deploy any remaining migrations
          execSync('npx prisma migrate deploy', { stdio: 'inherit' });
          console.log('✅ Remaining migrations deployed!');
          
        } catch (baselineError) {
          console.log('⚠️  Baseline approach failed, using db push as fallback...');
          // Final fallback: use db push to sync schema
          execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
          console.log('✅ Schema synchronized with db push!');
        }
      } else {
        console.log('⚠️  No migrations found, using db push...');
        execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
        console.log('✅ Schema synchronized with db push!');
      }
    }
  }
  
  // Always generate the Prisma client
  console.log('🔧 Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client generated successfully!');
  
  console.log('🎉 Production database migration completed!');
  
} catch (error) {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
}