const fs = require('fs');
const path = require('path');

const sourceDir = path.join(process.cwd(), 'attached_assets');
const targetDir = path.join(process.cwd(), 'dist', 'attached_assets');

console.log('Copying assets from:', sourceDir);
console.log('Copying assets to:', targetDir);

if (fs.existsSync(sourceDir)) {
    // Create target directory if it doesn't exist
    fs.mkdirSync(targetDir, { recursive: true });

    // Copy directory recursively
    function copyDir(src, dest) {
        const entries = fs.readdirSync(src, { withFileTypes: true });

        for (const entry of entries) {
            const srcPath = path.join(src, entry.name);
            const destPath = path.join(dest, entry.name);

            if (entry.isDirectory()) {
                fs.mkdirSync(destPath, { recursive: true });
                copyDir(srcPath, destPath);
            } else {
                fs.copyFileSync(srcPath, destPath);
            }
        }
    }

    copyDir(sourceDir, targetDir);
    console.log('Assets copied successfully!');
} else {
    console.log('Source directory does not exist:', sourceDir);
}