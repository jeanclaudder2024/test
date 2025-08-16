import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to copy directory recursively
function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    console.warn(`Source directory ${src} does not exist`);
    return;
  }

  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Copy attached_assets to dist directory
const projectRoot = path.resolve(__dirname, '..');
const srcPath = path.join(projectRoot, 'attached_assets');
const destPath = path.join(projectRoot, 'dist', 'attached_assets');

console.log('Copying assets...');
console.log(`From: ${srcPath}`);
console.log(`To: ${destPath}`);

try {
  copyDir(srcPath, destPath);
  console.log('✅ Assets copied successfully');
} catch (error) {
  console.error('❌ Error copying assets:', error);
  process.exit(1);
}