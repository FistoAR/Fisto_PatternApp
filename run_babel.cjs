const { parse } = require('@babel/parser');
const fs = require('fs');

const code = fs.readFileSync('src/components/editor/EditorScreen1.jsx', 'utf-8');
try {
  parse(code, {
    sourceType: 'module',
    plugins: ['jsx']
  });
  console.log('No syntax errors found by Babel!');
} catch (e) {
  console.error('Babel parse error:', e.message);
}
