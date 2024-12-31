const fs = require('fs');
const path = require('path');

// Source and destination paths
const srcDir = path.join(__dirname, 'dist');
const destDir = path.join(__dirname, '..', 'web-host', 'src', 'assets', 'mfe');

// Ensure the destination directory exists
const ensureDirExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Copy all files and directories recursively
const copyRecursive = (src, dest) => {
  if (fs.lstatSync(src).isDirectory()) {
    // If it's a directory, create it in the destination and copy its contents
    ensureDirExists(dest);
    fs.readdirSync(src).forEach((file) => {
      copyRecursive(path.join(src, file), path.join(dest, file));
    });
  } else {
    // If it's a file, copy it to the destination
    fs.copyFileSync(src, dest);
    console.log(`Copied: ${src} -> ${dest}`);
  }
};

// Start the copy process
ensureDirExists(destDir); // Ensure the destination directory exists
copyRecursive(srcDir, destDir);

console.log('All files copied successfully!');