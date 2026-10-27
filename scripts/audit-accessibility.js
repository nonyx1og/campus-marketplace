const fs = require('fs');
const path = require('path');

function walk(dir, filelist = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filepath = path.join(dir, file);
    if (['node_modules', '.expo', 'dist', 'scripts'].includes(file)) continue;
    const stat = fs.statSync(filepath);
    if (stat.isDirectory()) {
      walk(filepath, filelist);
    } else if (filepath.endsWith('.tsx')) {
      filelist.push(filepath);
    }
  }
  return filelist;
}

const rootDir = path.resolve(__dirname, '..');
const tsxFiles = walk(rootDir);

const missingA11y = [];
const smallTouchTargets = [];

for (const file of tsxFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const relFile = path.relative(rootDir, file);

  // Parse JSX tags
  const targets = ['TouchableOpacity', 'Pressable', 'TextInput'];
  for (const tag of targets) {
    let searchIdx = 0;
    while (true) {
      const idx = content.indexOf('<' + tag, searchIdx);
      if (idx === -1) break;

      let endIdx = idx + tag.length + 1;
      let inBrace = 0;
      let inQuote = null;
      while (endIdx < content.length) {
        const ch = content[endIdx];
        if (inQuote) {
          if (ch === inQuote && content[endIdx - 1] !== '\\') {
            inQuote = null;
          }
        } else {
          if (ch === '"' || ch === "'" || ch === '`') {
            inQuote = ch;
          } else if (ch === '{') {
            inBrace++;
          } else if (ch === '}') {
            inBrace--;
          } else if (ch === '>' && inBrace === 0) {
            break;
          }
        }
        endIdx++;
      }

      const tagContent = content.substring(idx, endIdx + 1);
      const hasRole = /accessibilityRole\s*=/.test(tagContent);
      const hasLabel = /accessibilityLabel\s*=/.test(tagContent);
      const line = content.substring(0, idx).split('\n').length;

      if (!hasRole || !hasLabel) {
        missingA11y.push({
          file: relFile,
          line,
          tag,
          hasRole,
          hasLabel,
          snippet: tagContent.replace(/\s+/g, ' ').substring(0, 100),
        });
      }
      searchIdx = endIdx + 1;
    }
  }
}

console.log('--- ACCESSIBILITY AUDIT (ROLES & LABELS) ---');
if (missingA11y.length === 0) {
  console.log('PASS: All interactive elements have accessibilityRole and accessibilityLabel!');
} else {
  console.log(`FOUND ${missingA11y.length} interactive elements missing accessibility attributes:`);
  missingA11y.forEach((m) => {
    console.log(`  [FAIL] ${m.file}:${m.line} <${m.tag}> | role: ${m.hasRole}, label: ${m.hasLabel}`);
    console.log(`         Snippet: ${m.snippet}`);
  });
}
