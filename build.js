const fs = require('fs');
const path = require('path');
const babel = require('@babel/core');

const htmlPath = path.join(__dirname, 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

const START = '<script type="text/babel" data-presets="react">';
const END = '</script>';

const startIdx = html.indexOf(START);
if (startIdx === -1) { console.error('ERROR: babel script block not found'); process.exit(1); }
const endIdx = html.indexOf(END, startIdx + START.length);
if (endIdx === -1) { console.error('ERROR: closing </script> not found'); process.exit(1); }

const jsx = html.slice(startIdx + START.length, endIdx);

console.log('Compiling JSX...');
const result = babel.transformSync(jsx, {
  presets: ['@babel/preset-react'],
  filename: 'app.jsx',
});

if (!result || !result.code) { console.error('ERROR: Babel compilation returned nothing'); process.exit(1); }

// Swap in the compiled script
const compiled = `<script>\n${result.code}\n</script>`;
html = html.slice(0, startIdx) + compiled + html.slice(endIdx + END.length);

// Remove the Babel CDN <script> tag line (no longer needed)
html = html.split('\n').filter(line => !line.includes('unpkg.com/@babel/standalone')).join('\n');

fs.writeFileSync(htmlPath, html, 'utf8');
console.log('Done. Babel CDN removed — JSX is pre-compiled plain JavaScript.');
