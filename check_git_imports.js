const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get all git files
const gitFilesStr = execSync('git ls-files', { encoding: 'utf-8' });
const gitFiles = gitFilesStr.split('\n').filter(Boolean);

const fileContent = fs.readFileSync('src/components/editor/ModelsPopup.jsx', 'utf-8');
const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
let match;
const basePath = 'src/components/editor';

let errors = 0;
while ((match = importRegex.exec(fileContent)) !== null) {
  let importPath = match[1];
  if (importPath.startsWith('.')) {
    const rawPath = importPath.split('?')[0];
    const absolutePath = path.resolve(basePath, rawPath);
    const relativeToRoot = path.relative(process.cwd(), absolutePath);
    
    if (!gitFiles.includes(relativeToRoot)) {
      console.log('NOT IN GIT WITH EXACT CASE:', relativeToRoot);
      errors++;
    }
  }
}
console.log('Total errors:', errors);
