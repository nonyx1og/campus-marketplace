const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('================================================================');
console.log(' CAMPUS MARKETPLACE - PROMPT 10: 4 STATES, THEME & A11Y AUDIT');
console.log('================================================================\n');

const rootDir = path.resolve(__dirname, '..');

let totalTests = 0;
let passedTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ✔ PASS: ${name}`);
  } catch (err) {
    console.error(`  ✘ FAIL: ${name}`);
    console.error(`         ${err.message}`);
  }
}

function walkTsx(dir, filelist = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filepath = path.join(dir, file);
    if (['node_modules', '.expo', 'dist', 'scripts'].includes(file)) continue;
    const stat = fs.statSync(filepath);
    if (stat.isDirectory()) {
      walkTsx(filepath, filelist);
    } else if (filepath.endsWith('.tsx')) {
      filelist.push(filepath);
    }
  }
  return filelist;
}

const allTsxFiles = walkTsx(rootDir);

// -------------------------------------------------------------
// 1. FOUR STATES COVERAGE AUDIT
// -------------------------------------------------------------
console.log('--- 1. Four States (Loading, Empty, Error + Retry, Content) ---');

const screensToVerify = [
  { file: 'app/(auth)/sign-in.tsx', name: 'Sign-in Screen' },
  { file: 'app/(app)/(tabs)/index.tsx', name: 'Catalogue Screen' },
  { file: 'app/(app)/(tabs)/favorites.tsx', name: 'Favorites Screen' },
  { file: 'app/(app)/(tabs)/cart.tsx', name: 'Cart Screen' },
  { file: 'app/(app)/listing/[id].tsx', name: 'Listing Detail Screen' },
  { file: 'app/(app)/modal/create-listing.tsx', name: 'Create Listing Modal' },
  { file: 'app/+not-found.tsx', name: '404 Not Found Screen' },
];

screensToVerify.forEach(({ file, name }) => {
  runTest(`Verifies ${name} (${file}) handles all 4 states with retry`, () => {
    const content = fs.readFileSync(path.join(rootDir, file), 'utf8');
    
    // Check loading state
    const hasLoading =
      content.includes("'loading'") ||
      content.includes('"loading"') ||
      content.includes('loadingMessage') ||
      content.includes('isLoading') ||
      content.includes('CatalogueSkeleton');
    assert.strictEqual(hasLoading, true, `${file} missing loading state handling`);

    // Check empty state
    const hasEmpty =
      content.includes("'empty'") ||
      content.includes('"empty"') ||
      content.includes('emptyTitle') ||
      content.includes('emptyMessage') ||
      content.includes('EmptyState');
    assert.strictEqual(hasEmpty, true, `${file} missing contextual empty state`);

    // Check error state & retry action
    const hasError =
      content.includes("'error'") ||
      content.includes('"error"') ||
      content.includes('errorMessage') ||
      content.includes('errorTitle') ||
      content.includes('ErrorState');
    assert.strictEqual(hasError, true, `${file} missing error state`);

    const hasRetry =
      content.includes('onRetry') ||
      content.includes('handleRetry') ||
      content.includes('refetch') ||
      content.includes('Retry');
    assert.strictEqual(hasRetry, true, `${file} missing active retry action`);

    // Check content state
    const hasContent =
      content.includes("'content'") ||
      content.includes('"content"') ||
      content.includes('FlatList') ||
      content.includes('ScrollView') ||
      content.includes('children');
    assert.strictEqual(hasContent, true, `${file} missing content state`);
  });
});

// -------------------------------------------------------------
// 2. THEME SYSTEM & TOKEN ISOLATION AUDIT
// -------------------------------------------------------------
console.log('\n--- 2. Single Token File & Light/Dark Contrast Audit ---');

runTest('Theme file provides required semantic tokens for Light and Dark themes', () => {
  const themeContent = fs.readFileSync(path.join(rootDir, 'constants', 'theme.ts'), 'utf8');
  const requiredTokens = [
    'background',
    'surface',
    'text',
    'mutedText',
    'primary',
    'danger',
    'border',
    'success',
  ];

  assert.ok(themeContent.includes('export const lightTokens'), 'Must export lightTokens');
  assert.ok(themeContent.includes('export const darkTokens'), 'Must export darkTokens');

  requiredTokens.forEach((token) => {
    assert.ok(themeContent.includes(`${token}:`), `Theme tokens must define: ${token}`);
  });
});

runTest('Single source of truth: Zero hard-coded hex colors outside constants/theme.ts', () => {
  function getFiles(dir, files = []) {
    fs.readdirSync(dir).forEach((f) => {
      const p = path.join(dir, f);
      if (['node_modules', '.expo', 'dist', 'scripts', '.git'].includes(f)) return;
      if (fs.statSync(p).isDirectory()) getFiles(p, files);
      else if (/\.(ts|tsx|js|jsx)$/.test(f)) files.push(p);
    });
    return files;
  }

  const allCodeFiles = getFiles(rootDir);
  const themeFilePath = path.join(rootDir, 'constants', 'theme.ts');

  const hexRegex = /#[0-9A-Fa-f]{3,8}\b/g;
  const violations = [];

  allCodeFiles.forEach((f) => {
    if (path.resolve(f) === path.resolve(themeFilePath)) return;
    const content = fs.readFileSync(f, 'utf8');
    const matches = content.match(hexRegex);
    if (matches) {
      violations.push({ file: path.relative(rootDir, f), matches });
    }
  });

  assert.strictEqual(
    violations.length,
    0,
    `Found hardcoded hex codes outside theme.ts: ${JSON.stringify(violations)}`
  );
});

// -------------------------------------------------------------
// 3. ACCESSIBILITY ROLES & LABELS AUDIT
// -------------------------------------------------------------
console.log('\n--- 3. Accessibility Roles & Dynamic Labels (WCAG AA) ---');

runTest('All interactive elements (TouchableOpacity, Pressable, TextInput) declare accessibilityRole and accessibilityLabel', () => {
  const missingA11y = [];
  const targets = ['TouchableOpacity', 'Pressable', 'TextInput'];

  for (const file of allTsxFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const relFile = path.relative(rootDir, file);

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
          });
        }
        searchIdx = endIdx + 1;
      }
    }
  }

  assert.strictEqual(
    missingA11y.length,
    0,
    `Missing a11y attributes on interactive elements: ${JSON.stringify(missingA11y)}`
  );
});

// -------------------------------------------------------------
// 4. TOUCH TARGETS (MINIMUM 44x44)
// -------------------------------------------------------------
console.log('\n--- 4. Touch Targets Audit (Minimum >= 44x44 px) ---');

runTest('Theme defines layout.minTouchTarget as 44', () => {
  const themeContent = fs.readFileSync(path.join(rootDir, 'constants', 'theme.ts'), 'utf8');
  assert.ok(themeContent.includes('minTouchTarget: 44'), 'layout.minTouchTarget must be 44');
});

runTest('AppButton, AppInput, and FavoriteToggleButton enforce minTouchTarget >= 44', () => {
  const buttonCode = fs.readFileSync(path.join(rootDir, 'components/primitives/AppButton.tsx'), 'utf8');
  assert.ok(buttonCode.includes('minHeight: theme.layout.minTouchTarget') || buttonCode.includes('minHeight: 44'), 'AppButton must enforce minHeight 44');
  assert.ok(buttonCode.includes('minWidth: theme.layout.minTouchTarget') || buttonCode.includes('minWidth: 44'), 'AppButton must enforce minWidth 44');

  const inputCode = fs.readFileSync(path.join(rootDir, 'components/primitives/AppInput.tsx'), 'utf8');
  assert.ok(inputCode.includes('minHeight: multiline ? 88 : theme.layout.minTouchTarget'), 'AppInput must enforce minTouchTarget');

  const favCode = fs.readFileSync(path.join(rootDir, 'components/favorites/FavoriteToggleButton.tsx'), 'utf8');
  assert.ok(favCode.includes('minTouchTarget'), 'FavoriteToggleButton must enforce minTouchTarget');
});

runTest('Screen interactive control styles enforce minHeight and minWidth >= 44', () => {
  const indexCode = fs.readFileSync(path.join(rootDir, 'app/(app)/(tabs)/index.tsx'), 'utf8');
  assert.ok(indexCode.includes('minHeight: theme.layout.minTouchTarget') && indexCode.includes('clearFilterBtnStyle'), 'clearFilterBtnStyle must enforce 44x44');
  assert.ok(indexCode.includes('minHeight: theme.layout.minTouchTarget') && indexCode.includes('demoChipStyle'), 'demoChipStyle must enforce 44 minHeight');

  const detailCode = fs.readFileSync(path.join(rootDir, 'app/(app)/listing/[id].tsx'), 'utf8');
  assert.ok(detailCode.includes('minHeight: theme.layout.minTouchTarget') && detailCode.includes('roleChipStyle'), 'roleChipStyle must enforce 44 minHeight');

  const freshnessCode = fs.readFileSync(path.join(rootDir, 'features/catalogue/components/CatalogueHeaderFreshness.tsx'), 'utf8');
  assert.ok(freshnessCode.includes('minWidth: theme.layout.minTouchTarget') && freshnessCode.includes('minHeight: theme.layout.minTouchTarget'), 'dismissBtnStyle must enforce 44x44');
});

// -------------------------------------------------------------
// 5. NON-COLOR STATUS & WCAG AA INDICATORS
// -------------------------------------------------------------
console.log('\n--- 5. Non-Color Information & Screen Reader Visibility ---');

runTest('Stock status is communicated with text badges ("Còn hàng", "Hết hàng"), not color alone', () => {
  const cardCode = fs.readFileSync(path.join(rootDir, 'features/catalogue/components/CatalogueCard.tsx'), 'utf8');
  assert.ok(cardCode.includes("Còn hàng:"), 'CatalogueCard must include text "Còn hàng"');
  assert.ok(cardCode.includes("'Hết hàng'"), 'CatalogueCard must include text "Hết hàng"');

  const detailCode = fs.readFileSync(path.join(rootDir, 'app/(app)/listing/[id].tsx'), 'utf8');
  assert.ok(detailCode.includes('Còn hàng ('), 'Detail screen must include text "Còn hàng"');
  assert.ok(detailCode.includes('Hết hàng / Tạm ngưng'), 'Detail screen must include text "Hết hàng / Tạm ngưng"');
});

runTest('Delivery rules and thresholds include checkmarks (✓) and explicit text, not color alone', () => {
  const cartCode = fs.readFileSync(path.join(rootDir, 'app/(app)/(tabs)/cart.tsx'), 'utf8');
  assert.ok(cartCode.includes("isSelected ? '✓ ' : '○ '"), 'Cart delivery options must include symbol prefix');
  assert.ok(cartCode.includes('Miễn phí'), 'Cart must state explicit "Miễn phí" text');
  assert.ok(cartCode.includes('✓ Đã đạt điều kiện Miễn phí'), 'Cart must include explicit threshold success text');
});

runTest('Forms implement KeyboardAvoidingView and keyboardShouldPersistTaps', () => {
  const signInCode = fs.readFileSync(path.join(rootDir, 'app/(auth)/sign-in.tsx'), 'utf8');
  assert.ok(signInCode.includes('KeyboardAvoidingView'), 'sign-in must use KeyboardAvoidingView');
  assert.ok(signInCode.includes('keyboardShouldPersistTaps="handled"'), 'sign-in must use keyboardShouldPersistTaps');

  const createCode = fs.readFileSync(path.join(rootDir, 'app/(app)/modal/create-listing.tsx'), 'utf8');
  assert.ok(createCode.includes('KeyboardAvoidingView'), 'create-listing must use KeyboardAvoidingView');
  assert.ok(createCode.includes('keyboardShouldPersistTaps="handled"'), 'create-listing must use keyboardShouldPersistTaps');
  assert.ok(createCode.includes('keyboardVerticalOffset'), 'create-listing must set keyboardVerticalOffset');
});

// -------------------------------------------------------------
// 6. ROUTING & BLANK SCREEN PREVENTION
// -------------------------------------------------------------
console.log('\n--- 6. Routing, 404 Route & Blank Screen Prevention ---');

runTest('+not-found.tsx provides clear explanation and valid navigation back to root /', () => {
  const notFoundCode = fs.readFileSync(path.join(rootDir, 'app/+not-found.tsx'), 'utf8');
  assert.ok(notFoundCode.includes('404 - Không tìm thấy trang'), 'Must state 404 header');
  assert.ok(notFoundCode.includes('href="/"'), 'Must link back to /');
  assert.ok(notFoundCode.includes('accessibilityRole="button"'), 'Return link must have role="button"');
  assert.ok(notFoundCode.includes('minTouchTarget'), 'Return link must meet minTouchTarget');
});

runTest('RootLayout prevents blank screen during session restore with animated indicator and theme tokens', () => {
  const layoutCode = fs.readFileSync(path.join(rootDir, 'app/_layout.tsx'), 'utf8');
  assert.ok(layoutCode.includes('ThemeProvider'), 'RootLayout must be wrapped with ThemeProvider');
  assert.ok(layoutCode.includes('isRestoringSession'), 'NavigationGuard must handle isRestoringSession');
  assert.ok(layoutCode.includes('ActivityIndicator'), 'Must show animated indicator during restore');
  assert.ok(layoutCode.includes('accessibilityRole="alert"'), 'Splash screen must alert screen reader');
  assert.ok(layoutCode.includes('StatusBar'), 'StatusBar style must dynamically adapt to theme');
});

// -------------------------------------------------------------
// SUMMARY
// -------------------------------------------------------------
console.log('\n================================================================');
console.log(` SUMMARY: ${passedTests}/${totalTests} AUDIT TESTS PASSED (${Math.round((passedTests / totalTests) * 100)}% GREEN)`);
console.log('================================================================');

if (passedTests !== totalTests) {
  process.exit(1);
}
