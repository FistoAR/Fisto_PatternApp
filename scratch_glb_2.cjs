const fs = require('fs');

const popupPath = '/Users/fist-o/Downloads/Murugan/Fisto Pattern App/src/components/editor/ModelsPopup.jsx';
const content = fs.readFileSync(popupPath, 'utf8');

// Find all image imports
const imgImports = content.match(/import (\w+)Img from "(.*?).webp";/g);

let popupGlbs = [];
let mockupGlbs = [];

imgImports.forEach(imp => {
  const match = imp.match(/import (\w+)Img from "(.*?).webp";/);
  const name = match[1];
  const pathPopup = match[2]; // ../../assets/models/...
  const pathMockup = pathPopup.replace('../../assets', '../assets');
  
  popupGlbs.push(`import ${name}Url from "${pathPopup}.glb?url";`);
  mockupGlbs.push(`import ${name}Url from "${pathMockup}.glb?url";`);
});

popupGlbs.push(`import cup3Url from "../../assets/models/Container/cup/plasticCup1.glb?url";`);
popupGlbs.push(`import cup4Url from "../../assets/models/Container/cup/plasticCup2.glb?url";`);

mockupGlbs.push(`import cup3Url from "../assets/models/Container/cup/plasticCup1.glb?url";`);
mockupGlbs.push(`import cup4Url from "../assets/models/Container/cup/plasticCup2.glb?url";`);

fs.writeFileSync('popup_glbs.txt', popupGlbs.join('\n'));
fs.writeFileSync('mockup_glbs.txt', mockupGlbs.join('\n'));
