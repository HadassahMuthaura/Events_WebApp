import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const migrationsDir = path.join(__dirname, '../database/migrations');
const migrationsFile = path.join(__dirname, '../database/.migrations.json');

// Initialize migrations tracking file if it doesn't exist
function initializeMigrationsFile() {
  if (!fs.existsSync(migrationsFile)) {
    fs.writeFileSync(migrationsFile, JSON.stringify({ applied: [], lastChecked: null }, null, 2));
  }
}

// Get applied migrations
function getAppliedMigrations() {
  initializeMigrationsFile();
  const data = fs.readFileSync(migrationsFile, 'utf8');
  return JSON.parse(data);
}

// Save applied migrations
function saveAppliedMigrations(migrations) {
  migrations.lastChecked = new Date().toISOString();
  fs.writeFileSync(migrationsFile, JSON.stringify(migrations, null, 2));
}

// Get pending migrations
function getPendingMigrations() {
  const applied = getAppliedMigrations();
  const appliedNames = new Set(applied.applied);
  
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();
  
  return files.filter(f => !appliedNames.has(f));
}

// Get migration SQL content
function getMigrationSQL(filename) {
  const filepath = path.join(migrationsDir, filename);
  return fs.readFileSync(filepath, 'utf8');
}

// Check migration status and provide setup instructions
export function setupMigrations() {
  try {
    const pending = getPendingMigrations();
    
    if (pending.length === 0) {
      console.log('✅ All migrations are up to date');
      return { status: 'up-to-date', pending: [] };
    }
    
    console.log('\n🔧 MIGRATION SETUP REQUIRED\n');
    console.log(`Found ${pending.length} pending migration(s):\n`);
    
    pending.forEach((migration, index) => {
      console.log(`${index + 1}. ${migration}`);
      const sql = getMigrationSQL(migration);
      const description = sql.split('\n').find(line => line.includes('Description:'));
      if (description) {
        console.log(`   ${description.trim()}`);
      }
    });
    
    console.log('\n📋 TO APPLY MIGRATIONS:\n');
    console.log('1. Go to your Supabase Dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. For each pending migration, copy and run the SQL:\n');
    
    pending.forEach((migration, index) => {
      console.log(`--- Migration ${index + 1}: ${migration} ---`);
      const sql = getMigrationSQL(migration);
      console.log(sql);
      console.log('');
    });
    
    console.log('\n4. After running all migrations in Supabase, mark them as applied by running:');
    console.log('   npm run migrations:mark-applied\n');
    
    return { status: 'migrations-pending', pending };
  } catch (error) {
    console.error('❌ Setup error:', error);
    return { status: 'error', error: error.message };
  }
}

// Mark migrations as applied after manual verification
export function markMigrationsApplied() {
  const pending = getPendingMigrations();
  
  if (pending.length === 0) {
    console.log('✅ No pending migrations to mark');
    return;
  }
  
  const applied = getAppliedMigrations();
  applied.applied.push(...pending);
  saveAppliedMigrations(applied);
  
  console.log(`✅ Marked ${pending.length} migration(s) as applied`);
  console.log('Applied migrations:');
  applied.applied.forEach(m => console.log(`  - ${m}`));
}

// Get migration status
export function getMigrationStatus() {
  const applied = getAppliedMigrations();
  const pending = getPendingMigrations();
  
  return {
    applied: applied.applied,
    pending: pending,
    totalApplied: applied.applied.length,
    totalPending: pending.length,
    lastChecked: applied.lastChecked
  };
}
