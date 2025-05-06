import { migrateToFirebase } from './migrations/mysql-to-firebase';

async function main() {
  try {
    console.log('Starting database migration to Firebase...');
    await migrateToFirebase();
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

main();