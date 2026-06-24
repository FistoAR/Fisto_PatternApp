const fs = require('fs');
const code = fs.readFileSync('src/components/editor/EditorScreen1.jsx', 'utf-8');
const lines = code.split('\n');
let p = 0, b = 0, c = 0, sq = 0;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i] || '';
  for(let char of line) {
    if(char === '(') p++;
    if(char === ')') p--;
    if(char === '{') b++;
    if(char === '}') b--;
    if(char === '[') sq++;
    if(char === ']') sq--;
  }
  if(p < 0 || b < 0 || sq < 0) {
    console.log(`ERROR at ${i+1}: p:${p} b:${b} sq:${sq} | ${line}`);
  }
}
console.log(`Final: p:${p} b:${b} sq:${sq}`);
