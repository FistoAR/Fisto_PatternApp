const fs = require('fs');

const popupPath = '/Users/fist-o/Downloads/Murugan/Fisto Pattern App/src/components/editor/ModelsPopup.jsx';
const content = fs.readFileSync(popupPath, 'utf8');

// Find all image imports
// import sqBox1Img from "../../assets/models/box models/sq box/squareBox1.webp";
const imgImports = content.match(/import (\w+)Img from "(.*?).webp";/g);

let newGlbImports = [];

imgImports.forEach(imp => {
  const match = imp.match(/import (\w+)Img from "(.*?).webp";/);
  const name = match[1]; // e.g. sqBox1
  const path = match[2]; // e.g. ../../assets/models/...
  
  newGlbImports.push(`import ${name}Url from "${path}.glb?url";`);
});

// For Cup 3 and Cup 4, we manually add them because they didn't have specific webps and got mapped to cup2Img.
// But we know there's plasticCup1 and plasticCup2.
newGlbImports.push(`import cup3Url from "../../assets/models/Container/cup/plasticCup1.glb?url";`);
newGlbImports.push(`import cup4Url from "../../assets/models/Container/cup/plasticCup2.glb?url";`);

console.log(newGlbImports.join('\n'));
