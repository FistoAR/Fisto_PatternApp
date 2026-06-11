const fs = require('fs');
const path = require('path');

const fileContent = fs.readFileSync('src/components/editor/ModelsPopup.jsx', 'utf-8');
const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
let match;
const basePath = 'src/components/editor';

let errors = 0;
while ((match = importRegex.exec(fileContent)) !== null) {
  let importPath = match[1];
  if (importPath.startsWith('.')) {
    // strip ?url
    const rawPath = importPath.split('?')[0];
    const absolutePath = path.resolve(basePath, rawPath);
    const relativeToRoot = path.relative(process.cwd(), absolutePath);
    
    // Check if file exists exactly with this case
    if (!fs.existsSync(absolutePath)) {
      console.log('NOT FOUND:', importPath, '->', relativeToRoot);
      errors++;
    } else {
      // check case sensitivity
      const dir = path.dirname(absolutePath);
      const base = path.basename(absolutePath);
      const filesInDir = fs.readdirSync(dir);
      if (!filesInDir.includes(base)) {
        console.log('CASE MISMATCH:', importPath, '->', relativeToRoot);
        errors++;
      }
    }
  }
}
console.log('Total errors:', errors);
