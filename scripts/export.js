import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { execSync } from 'child_process';

dotenv.config();

const mongoUri = process.env.DATABASE_URL;
const exportDir = process.env.MONGO_EXPORT_DIR;

if (!mongoUri || !exportDir) {
  console.error('MONGO_URI or MONGO_EXPORT_DIR is not defined in .env');
  process.exit(1);
}

const fullExportPath = path.resolve(exportDir);

try {
  if (!fs.existsSync(fullExportPath)) {
    fs.mkdirSync(fullExportPath, { recursive: true });
    console.log(`Created export directory: ${fullExportPath}`);
  }

  if (fs.existsSync(fullExportPath)) {
    fs.rmSync(fullExportPath, { recursive: true, force: true });
    fs.mkdirSync(fullExportPath, { recursive: true });
    console.log(`Cleared existing export directory: ${fullExportPath}`);
  }

  console.log('Starting MongoDB export...');

  execSync(`mongodump --uri="${mongoUri}" --out="${fullExportPath}"`, {
    stdio: 'inherit'
  });

  console.log(`MongoDB export completed successfully to: ${fullExportPath}`);
} catch (error) {
  console.error('Error running mongodump:', error.message);
  process.exit(1);
}
