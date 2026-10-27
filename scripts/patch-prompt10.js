const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

// 1. PATCH index.tsx
{
  const filePath = path.join(rootDir, 'app', '(app)', '(tabs)', 'index.tsx');
  let content = fs.readFileSync(filePath, 'utf8');

  content = content.replace(
    "import { useTheme } from '@/constants/theme';",
    "import { useTheme, useThemeContext } from '@/constants/theme';"
  );

  content = content.replace(
    '  const theme = useTheme();',
    '  const { theme, toggleTheme } = useThemeContext();'
  );

  // Replace clearFilterBtnStyle
  content = content.replace(
    /const clearFilterBtnStyle: ViewStyle = \{\s*minHeight: 32,\s*paddingHorizontal: theme\.spacing\.xs,\s*alignItems: 'center',\s*justifyContent: 'center',\s*\};/,
    `const clearFilterBtnStyle: ViewStyle = {
    minHeight: theme.layout.minTouchTarget,
    minWidth: theme.layout.minTouchTarget,
    paddingHorizontal: theme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  };`
  );

  // Replace demoChipStyle
  content = content.replace(
    /const demoChipStyle = \(active: boolean\): ViewStyle => \(\{\s*paddingHorizontal: theme\.spacing\.xs,\s*paddingVertical: theme\.spacing\.xxs,\s*borderRadius: theme\.radius\.xs,\s*backgroundColor: active \? theme\.colors\.warning : theme\.colors\.surface,\s*borderWidth: 1,\s*borderColor: active \? theme\.colors\.warning : theme\.colors\.borderSubtle,\s*\}\);/,
    `const demoChipStyle = (active: boolean): ViewStyle => ({
    minHeight: theme.layout.minTouchTarget,
    minWidth: theme.layout.minTouchTarget,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xxs,
    borderRadius: theme.radius.xs,
    backgroundColor: active ? theme.colors.warning : theme.colors.surface,
    borderWidth: 1,
    borderColor: active ? theme.colors.warning : theme.colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  });`
  );

  // Add Theme Toggle button into demo bar
  if (!content.includes('toggleTheme')) {
    const targetAnchor = `<TouchableOpacity\n            accessibilityRole="button"\n            accessibilityLabel="Mô phỏng lỗi khi kéo làm mới để kiểm tra bảo toàn cache"`;
    const targetAnchorCRLF = `<TouchableOpacity\r\n            accessibilityRole="button"\r\n            accessibilityLabel="Mô phỏng lỗi khi kéo làm mới để kiểm tra bảo toàn cache"`;

    const themeToggleBtn = `          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={\`Chuyển đổi giao diện sang chế độ \${theme.mode === 'dark' ? 'Sáng' : 'Tối'}\`}
            style={demoChipStyle(false)}
            onPress={toggleTheme}
          >
            <Text style={demoChipTextStyle(false)}>
              {theme.mode === 'dark' ? '☀️ Giao diện Sáng' : '🌙 Giao diện Tối'}
            </Text>
          </TouchableOpacity>\n\n`;

    if (content.includes(targetAnchorCRLF)) {
      content = content.replace(targetAnchorCRLF, themeToggleBtn.replace(/\n/g, '\r\n') + targetAnchorCRLF);
    } else if (content.includes(targetAnchor)) {
      content = content.replace(targetAnchor, themeToggleBtn + targetAnchor);
    }
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('[PATCH] Successfully patched index.tsx');
}

// 2. PATCH listing/[id].tsx
{
  const filePath = path.join(rootDir, 'app', '(app)', 'listing', '[id].tsx');
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace roleChipStyle: minHeight: 32 -> minHeight: theme.layout.minTouchTarget
  content = content.replace(
    /const roleChipStyle = \(active: boolean\): ViewStyle => \(\{\s*minHeight: 32,/,
    `const roleChipStyle = (active: boolean): ViewStyle => ({
    minHeight: theme.layout.minTouchTarget,
    minWidth: theme.layout.minTouchTarget,`
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('[PATCH] Successfully patched listing/[id].tsx');
}

// 3. PATCH CatalogueHeaderFreshness.tsx
{
  const filePath = path.join(rootDir, 'features', 'catalogue', 'components', 'CatalogueHeaderFreshness.tsx');
  let content = fs.readFileSync(filePath, 'utf8');

  content = content.replace(
    /const dismissBtnStyle: ViewStyle = \{\s*minWidth: 32,\s*minHeight: 32,/,
    `const dismissBtnStyle: ViewStyle = {
    minWidth: theme.layout.minTouchTarget,
    minHeight: theme.layout.minTouchTarget,`
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('[PATCH] Successfully patched CatalogueHeaderFreshness.tsx');
}

// 4. PATCH modal/create-listing.tsx
{
  const filePath = path.join(rootDir, 'app', '(app)', 'modal', 'create-listing.tsx');
  let content = fs.readFileSync(filePath, 'utf8');

  // Add demoStateOverride state
  if (!content.includes('demoStateOverride')) {
    content = content.replace(
      "const [viewState, setViewState] = useState<ScreenViewState>('content');",
      "const [viewState, setViewState] = useState<ScreenViewState>('content');\n  const [demoStateOverride, setDemoStateOverride] = useState<ScreenViewState | null>(null);"
    );

    content = content.replace(
      `<ScreenState
        state={viewState}
        onRetry={handleRetry}
        loadingMessage="Đang nén ảnh & tải tin đăng lên chợ..."
        errorMessage={errorMessage || 'Có lỗi xảy ra khi tạo tin đăng mới.'}
      >`,
      `<ScreenState
        state={demoStateOverride || viewState}
        showStateSwitcher={true}
        onStateChange={setDemoStateOverride}
        onRetry={handleRetry}
        retryLabel="Thử lại"
        loadingMessage="Đang nén ảnh & tải tin đăng lên chợ..."
        emptyTitle="Chưa có thông tin tin đăng"
        emptyMessage="Mẫu đăng tin đang để trống. Bạn có thể nhấn nút bên dưới để quay lại biểu mẫu nhập liệu."
        emptyActionLabel="Nhập thông tin"
        onEmptyAction={() => {
          setDemoStateOverride(null);
          setViewState('content');
        }}
        errorMessage={errorMessage || 'Có lỗi xảy ra khi tạo tin đăng mới.'}
      >`
    );
  }

  // Keyboard avoidance improvement
  content = content.replace(
    "behavior={Platform.OS === 'ios' ? 'padding' : undefined}",
    "behavior={Platform.OS === 'ios' ? 'padding' : undefined}\n      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}"
  );

  content = content.replace(
    "<ScrollView contentContainerStyle={scrollContentStyle}>",
    "<ScrollView contentContainerStyle={scrollContentStyle} keyboardShouldPersistTaps=\"handled\">"
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('[PATCH] Successfully patched create-listing.tsx');
}
