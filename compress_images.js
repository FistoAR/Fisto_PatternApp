const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const floralDir = path.join(__dirname, 'src/assets/images/Editor 2/Floral');

if (!fs.existsSync(floralDir)) {
  console.error("Directory not found:", floralDir);
  process.exit(1);
}

const files = fs.readdirSync(floralDir);
console.log(`Found ${files.length} files in Floral directory.`);

files.forEach(file => {
  if (file === '.DS_Store') return;
  const filePath = path.join(floralDir, file);
  const ext = path.extname(file).toLowerCase();

  // If it's a jpg/jpeg/png
  if (ext === '.jpg' || ext === '.jpeg' || ext === '.png') {
    const baseName = path.basename(file, ext);
    const outPath = path.join(floralDir, `${baseName}.webp`);
    
    console.log(`Converting and compressing: ${file}`);
    try {
      // resample height/width max to 1024, format as webp
      execSync(`sips -s format webp --resampleHeightWidthMax 1024 "${filePath}" --out "${outPath}"`);
      
      // Verify size is under 200KB
      const stats = fs.statSync(outPath);
      const sizeKB = stats.size / 1024;
      console.log(`-> Created WebP: ${baseName}.webp (${sizeKB.toFixed(1)} KB)`);

      // Delete the original file
      fs.unlinkSync(filePath);
      console.log(`-> Deleted original: ${file}`);
    } catch (err) {
      console.error(`Failed to convert ${file}:`, err.message);
    }
  }
});

console.log("Image compression and conversion complete!");
