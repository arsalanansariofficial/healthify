import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { execSync } from 'child_process';

dotenv.config();

const mongoUri = process.env.DATABASE_URL;
const importDir = process.env.MONGO_IMPORT_DIR;

if (!mongoUri || !importDir) {
  console.error('MONGO_URI or MONGO_IMPORT_DIR is not defined in .env');
  process.exit(1);
}

const fullImportPath = path.resolve(importDir);

try {
  if (!fs.existsSync(fullImportPath)) {
    console.error(`Import directory does not exist: ${fullImportPath}`);
    process.exit(1);
  }

  const dbFolders = fs
    .readdirSync(fullImportPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => path.join(fullImportPath, dirent.name));

  if (dbFolders.length === 0) {
    console.error(`No database folders found inside: ${fullImportPath}`);
    process.exit(1);
  }

  // Restore each database folder
  for (const dbFolder of dbFolders) {
    console.log(`Restoring database from: ${dbFolder}`);
    execSync(`mongorestore --uri="${mongoUri}" --dir="${dbFolder}" --drop`, {
      stdio: 'inherit'
    });
    console.log(`Completed restore from: ${dbFolder}`);
  }

  console.log(`All databases restored successfully from: ${fullImportPath}`);
} catch (error) {
  console.error('Error running mongorestore:', error.message);
  process.exit(1);
}
