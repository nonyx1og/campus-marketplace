const fs = require('fs');
const path = require('path');

// 1. Check hex colors in all ts/tsx files
function walk(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === 'node_modules' || file === '.git' || file === '.expo') continue;
    const p = path.join(dir, file);
    if (fs.statSync(p).isDirectory()) {
      walk(p, fileList);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      fileList.push(p);
    }
  }
  return fileList;
}

const allTsFiles = walk('.');
const hexRegex = /#[0-9a-fA-F]{3,8}\b/g;
const violations = [];

for (const file of allTsFiles) {
  const norm = file.replace(/\\/g, '/');
  if (norm.endsWith('constants/theme.ts')) continue;
  const content = fs.readFileSync(file, 'utf8');
  const matches = content.match(hexRegex);
  if (matches) {
    violations.push({ file: norm, matches });
  }
}

console.log('--- 1. HEX COLORS OUTSIDE THEME AUDIT ---');
if (violations.length === 0) {
  console.log('PASS: 0 hex colors found outside constants/theme.ts!');
} else {
  console.log('FAIL: Violations found:', JSON.stringify(violations, null, 2));
}

// 2. Contrast verification
function lum(hex) {
  const rgb = hex.replace('#', '').match(/.{2}/g).map(x => parseInt(x, 16) / 255);
  const a = rgb.map(v => v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}
function contrast(hex1, hex2) {
  const l1 = lum(hex1);
  const l2 = lum(hex2);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

const light = {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  text: '#0F172A',
  mutedText: '#475569',
  primary: '#1D4ED8',
  danger: '#B91C1C',
  success: '#15803D',
  primaryBg: '#1D4ED8',
  dangerBg: '#B91C1C',
  successBg: '#15803D',
  textInverse: '#FFFFFF'
};

const dark = {
  background: '#0B0F17',
  surface: '#161E2E',
  text: '#F8FAFC',
  mutedText: '#94A3B8',
  primary: '#60A5FA',
  danger: '#F87171',
  success: '#4ADE80',
  primaryBg: '#2563EB',
  dangerBg: '#DC2626',
  successBg: '#15803D',
  textInverse: '#FFFFFF'
};

console.log('\n--- 2. WCAG AA >= 4.5:1 CONTRAST AUDIT ---');
const lightChecks = [
  ['Light: text on surface', light.text, light.surface],
  ['Light: text on background', light.text, light.background],
  ['Light: mutedText on surface', light.mutedText, light.surface],
  ['Light: mutedText on background', light.mutedText, light.background],
  ['Light: primary on surface', light.primary, light.surface],
  ['Light: danger on surface', light.danger, light.surface],
  ['Light: success on surface', light.success, light.surface],
  ['Light: textInverse on primaryBg', light.textInverse, light.primaryBg],
  ['Light: textInverse on dangerBg', light.textInverse, light.dangerBg],
  ['Light: textInverse on successBg', light.textInverse, light.successBg],
];

let allPass = true;
for (const [desc, c1, c2] of lightChecks) {
  const cr = contrast(c1, c2);
  const pass = cr >= 4.5;
  if (!pass) allPass = false;
  console.log(`${desc.padEnd(35)}: ${cr.toFixed(2)}:1 [${pass ? 'PASS' : 'FAIL'}]`);
}

const darkChecks = [
  ['Dark: text on surface', dark.text, dark.surface],
  ['Dark: text on background', dark.text, dark.background],
  ['Dark: mutedText on surface', dark.mutedText, dark.surface],
  ['Dark: mutedText on background', dark.mutedText, dark.background],
  ['Dark: primary on surface', dark.primary, dark.surface],
  ['Dark: primary on background', dark.primary, dark.background],
  ['Dark: danger on surface', dark.danger, dark.surface],
  ['Dark: danger on background', dark.danger, dark.background],
  ['Dark: success on surface', dark.success, dark.surface],
  ['Dark: success on background', dark.success, dark.background],
  ['Dark: textInverse on primaryBg', dark.textInverse, dark.primaryBg],
  ['Dark: textInverse on dangerBg', dark.textInverse, dark.dangerBg],
  ['Dark: textInverse on successBg', dark.textInverse, dark.successBg],
];

for (const [desc, c1, c2] of darkChecks) {
  const cr = contrast(c1, c2);
  const pass = cr >= 4.5;
  if (!pass) allPass = false;
  console.log(`${desc.padEnd(35)}: ${cr.toFixed(2)}:1 [${pass ? 'PASS' : 'FAIL'}]`);
}

console.log(`\nOVERALL CONTRAST RESULT: ${allPass ? 'ALL TESTS PASSED (>= 4.5:1)' : 'FAILED'}`);
