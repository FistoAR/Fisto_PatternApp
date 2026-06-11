const fs = require('fs');
const path = require('path');

const modelsDir = '/Users/fist-o/Downloads/Murugan/Fisto Pattern App/src/assets/models';

function findWebpFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === '.DS_Store') continue;
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      findWebpFiles(filePath, fileList);
    } else if (filePath.endsWith('.webp')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const webpFiles = findWebpFiles(modelsDir);

const modelsPopupPath = '/Users/fist-o/Downloads/Murugan/Fisto Pattern App/src/components/editor/ModelsPopup.jsx';

const popupContent = fs.readFileSync(modelsPopupPath, 'utf8');

// Extract the MODELS array from popupContent
const modelsRegex = /const MODELS = \[\s*([\s\S]*?)\s*\];/;
const modelsMatch = popupContent.match(modelsRegex);

if (!modelsMatch) {
  console.log("Could not find MODELS");
  process.exit(1);
}

const modelsBlock = modelsMatch[1];
const modelLines = modelsBlock.split('\n').filter(l => l.includes('{ id:'));

let imports = [];
let newModelsBlock = [];

modelLines.forEach(line => {
  const match = line.match(/name:\s*'([^']+)',\s*modelUrl:\s*(\w+)/);
  if (!match) return;
  const name = match[1];
  const modelUrlVar = match[2];

  const importRegex = new RegExp(`import ${modelUrlVar} from "([^"]+)"`);
  const importMatch = popupContent.match(importRegex);
  if (!importMatch) return;
  let glbRelPath = importMatch[1].replace('?url', '');
  
  const glbFullPath = path.resolve('/Users/fist-o/Downloads/Murugan/Fisto Pattern App/src/components/editor', glbRelPath);
  const dirName = path.dirname(glbFullPath);
  const baseName = path.basename(glbFullPath, '.glb');
  
  let webpPath = webpFiles.find(f => path.dirname(f) === dirName && path.basename(f, '.webp').toLowerCase() === baseName.toLowerCase());
  
  if (!webpPath) {
    const dirFiles = webpFiles.filter(f => path.dirname(f) === dirName);
    if (dirFiles.length === 1) {
      webpPath = dirFiles[0];
    } else {
      const numMatch = name.match(/\d+/);
      if (numMatch) {
        webpPath = dirFiles.find(f => f.includes(numMatch[0]));
      }
    }
  }

  if (webpPath) {
    const importName = modelUrlVar.replace('Url', 'Img');
    const relWebpPath = path.relative('/Users/fist-o/Downloads/Murugan/Fisto Pattern App/src/components/editor', webpPath).replace(/\\/g, '/');
    imports.push(`import ${importName} from "${relWebpPath}";`);
    
    // add imageUrl: importName
    const newLine = line.replace(/imageKey:\s*'[^']+'/, `imageUrl: ${importName}`);
    newModelsBlock.push(newLine);
  } else {
    console.log("No webp found for", name, glbFullPath);
    newModelsBlock.push(line);
  }
});

console.log("IMPORTS:");
console.log(imports.join('\n'));
console.log("\nNEW MODELS POPUP ARRAY:");
console.log(newModelsBlock.join('\n'));
