const fs = require('fs');
const path = require('path');

const src1 = '/Users/fist-o/Downloads/assetfile_5131_e2c3cd85b12344f4';
const dest1 = path.join(__dirname, 'src/assets/images/Editor 1/Texture/Floral/Floral1');

const src2 = '/Users/fist-o/Downloads/assetfile_20_25b667bc31011015';
const dest2 = path.join(__dirname, 'src/assets/images/Editor 1/Texture/Floral/Floral2');

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  const files = fs.readdirSync(src);
  for (const file of files) {
    fs.copyFileSync(path.join(src, file), path.join(dest, file));
  }
}

copyDir(src1, dest1);
copyDir(src2, dest2);
console.log('Copied successfully!');
