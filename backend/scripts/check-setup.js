import { setupMigrations } from './migration-runner.js';

console.log('\n🚀 Events App - Database Setup Check\n');
console.log('=' .repeat(50));

const status = setupMigrations();

console.log('=' .repeat(50));
console.log('\nNOTE: The database schema must be set up before the application can run.');
console.log('Follow the instructions above or run: npm run migrations:setup\n');

process.exit(status.status === 'up-to-date' ? 0 : 1);
