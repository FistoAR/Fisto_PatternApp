const fs = require('fs');
const code = fs.readFileSync('src/components/editor/EditorScreen1.jsx', 'utf-8');
const lines = code.split('\n');
let divs = 0;
for (let i = 2913; i < 3341; i++) {
  const line = lines[i] || '';
  const openCount = (line.match(/<div\b[^>]*>/g) || []).length;
  const closeCount = (line.match(/<\/div>/g) || []).length;
  divs += openCount;
  divs -= closeCount;
  if (line.includes('</div>') && divs <= 0) {
    console.log(`WARNING at ${i+1}: divs=${divs}`);
  }
}
console.log(`Final div depth: ${divs}`);
