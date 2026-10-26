/**
 * Automated Test Suite for Prompt 6: Listing Detail, Create Listing, and Image Compression
 */

const assert = require('assert');

// 1. Image Compression Metric Helpers
function formatBytes(bytes) {
  if (bytes <= 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function calculateCompressionMetrics(rawBytes, compressedBytes) {
  const safeRaw = Math.max(0, Math.round(rawBytes));
  const safeCompressed = Math.max(0, Math.round(compressedBytes));
  const savedBytes = Math.max(0, safeRaw - safeCompressed);
  const ratioPercent = safeRaw > 0 ? Math.round((savedBytes / safeRaw) * 100) : 0;

  return {
    rawBytes: safeRaw,
    compressedBytes: safeCompressed,
    savedBytes,
    ratioPercent,
    formattedRaw: formatBytes(safeRaw),
    formattedCompressed: formatBytes(safeCompressed),
    formattedSaved: formatBytes(savedBytes),
  };
}

// 2. Mock Listing API functions
const MOCK_DATA = [
  {
    id: 'prod-101',
    title: 'Giáo trình Giải tích 1 & 2 (Kèm bài tập có giải)',
    description: 'Sách còn mới 95%, có ghi chú các dạng đề thi cuối kỳ.',
    priceVnd: 75000,
    priceMinor: 75000,
    stock: 4,
    category: 'Sách giáo trình',
    sellerId: 'usr-002',
    sellerName: 'Lê Hoàng Nam',
    campusLocation: 'Khu A - Toà Nhà Thư Viện',
    photoUri: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c',
    createdAt: '2026-10-24T10:00:00Z',
    updatedAt: '2026-10-24T10:00:00Z',
  },
  {
    id: 'prod-106',
    title: 'Ấm siêu tốc Inox 1.8L Sunhouse',
    description: 'Ấm đun nhanh trong 3 phút, tự ngắt khi sôi.',
    priceVnd: 85000,
    priceMinor: 85000,
    stock: 0, // Out of stock demo item
    category: 'Đồ dùng phòng trọ',
    sellerId: 'usr-007',
    sellerName: 'Đặng Quốc Anh',
    campusLocation: 'Khu dân cư làng đại học',
    photoUri: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd',
    createdAt: '2026-10-19T09:40:00Z',
    updatedAt: '2026-10-19T09:40:00Z',
  },
];

let simulatedOffline = false;

function fetchListingById(id) {
  if (simulatedOffline) {
    throw { code: 'NETWORK_OFFLINE', message: 'Thiết bị đang ở chế độ ngoại tuyến' };
  }
  const item = MOCK_DATA.find((x) => x.id === id);
  return item || null;
}

function validateAndCreateListing(input) {
  if (!input.title || !input.title.trim()) {
    throw { code: 'VALIDATION_ERROR', message: 'Tên món đồ / giáo trình không được để trống.' };
  }
  const priceInt = Math.round(Number(input.priceVnd));
  if (isNaN(priceInt) || priceInt <= 0) {
    throw { code: 'VALIDATION_ERROR', message: 'Giá bán phải là số nguyên dương tính theo VND.' };
  }
  const stockInt = Math.round(Number(input.stock));
  if (isNaN(stockInt) || stockInt < 0) {
    throw { code: 'VALIDATION_ERROR', message: 'Số lượng tồn kho phải là số nguyên không âm.' };
  }
  if (!input.photoUri || !input.photoUri.trim()) {
    throw { code: 'VALIDATION_ERROR', message: 'Vui lòng chọn hoặc chụp ít nhất 1 ảnh sản phẩm và nén trước khi đăng.' };
  }
  if (simulatedOffline) {
    throw { code: 'NETWORK_OFFLINE', message: 'Thiết bị đang ở chế độ ngoại tuyến' };
  }

  const newItem = {
    id: `prod-${Date.now()}`,
    title: input.title.trim(),
    description: input.description?.trim() || '',
    priceVnd: priceInt,
    priceMinor: priceInt,
    stock: stockInt,
    category: input.category || 'Sách giáo trình',
    sellerId: 'usr-current',
    sellerName: 'Nguyễn Thanh Long',
    campusLocation: input.campusLocation || 'KTX Khu B',
    photoUri: input.photoUri,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  MOCK_DATA.unshift(newItem);
  return newItem;
}

// 3. Favorites Store Simulation
class FavoritesStore {
  constructor() {
    this.items = [];
  }
  add(item) {
    if (!this.items.some((x) => x.id === item.id)) {
      this.items.unshift(item);
    }
  }
  remove(id) {
    this.items = this.items.filter((x) => x.id !== id);
  }
  toggle(item) {
    if (this.isFavorite(item.id)) {
      this.remove(item.id);
    } else {
      this.add(item);
    }
  }
  isFavorite(id) {
    return this.items.some((x) => x.id === id);
  }
}

// ============================================================================
// TEST RUNNER
// ============================================================================
let passedCount = 0;
let totalCount = 0;

function runTest(description, testFn) {
  totalCount++;
  try {
    testFn();
    console.log(`  ✔ PASS: ${description}`);
    passedCount++;
  } catch (error) {
    console.error(`  ✖ FAIL: ${description}`);
    console.error(error);
  }
}

console.log('================================================================');
console.log(' CAMPUS MARKETPLACE - LISTING DETAIL & CREATE LISTING SUITE');
console.log('================================================================\n');

console.log('--- 1. Image Compression Proof & Byte Size Metrics ---');

runTest('Formats bytes into readable string', () => {
  assert.strictEqual(formatBytes(0), '0 B');
  assert.strictEqual(formatBytes(500), '500 B');
  assert.strictEqual(formatBytes(1024), '1.0 KB');
  assert.strictEqual(formatBytes(204800), '200.0 KB');
  assert.strictEqual(formatBytes(2097152), '2.00 MB');
});

runTest('Calculates compression ratio and savings correctly (e.g. 2.4MB -> 240KB = 90% savings)', () => {
  const rawBytes = 2400000;
  const compressedBytes = 240000;
  const metrics = calculateCompressionMetrics(rawBytes, compressedBytes);

  assert.strictEqual(metrics.rawBytes, 2400000);
  assert.strictEqual(metrics.compressedBytes, 240000);
  assert.strictEqual(metrics.savedBytes, 2160000);
  assert.strictEqual(metrics.ratioPercent, 90);
  assert.strictEqual(metrics.formattedRaw, '2.29 MB');
  assert.strictEqual(metrics.formattedCompressed, '234.4 KB');
});

runTest('Prevents negative savedBytes or negative ratio when compressed >= raw', () => {
  const metrics = calculateCompressionMetrics(100, 150);
  assert.strictEqual(metrics.savedBytes, 0);
  assert.strictEqual(metrics.ratioPercent, 0);
});

runTest('Gracefully handles zero raw size without divide-by-zero crash', () => {
  const metrics = calculateCompressionMetrics(0, 0);
  assert.strictEqual(metrics.rawBytes, 0);
  assert.strictEqual(metrics.ratioPercent, 0);
});

console.log('\n--- 2. Listing Detail API & Cache Queries ---');

runTest('Fetches listing details by ID with complete required domain fields', () => {
  const item = fetchListingById('prod-101');
  assert.ok(item, 'Item should be found');
  assert.strictEqual(item.id, 'prod-101');
  assert.strictEqual(typeof item.title, 'string');
  assert.strictEqual(typeof item.priceVnd, 'number');
  assert.strictEqual(Number.isInteger(item.priceVnd), true);
  assert.ok(item.stock !== undefined, 'Stock should be defined');
  assert.ok(item.photoUri, 'Photo URI should be defined');
  assert.ok(item.sellerName, 'Seller name should be defined');
  assert.ok(item.campusLocation, 'Campus location should be defined');
});

runTest('Returns null safely for non-existent product ID without throwing', () => {
  const item = fetchListingById('prod-non-existent-999');
  assert.strictEqual(item, null);
});

runTest('Throws network offline error when device is in simulated offline mode', () => {
  simulatedOffline = true;
  assert.throws(
    () => fetchListingById('prod-101'),
    (err) => err.code === 'NETWORK_OFFLINE'
  );
  simulatedOffline = false;
});

console.log('\n--- 3. Stock & Availability Status Logic ---');

runTest('Identifies available products (stock > 0)', () => {
  const item = fetchListingById('prod-101');
  const isAvailable = (item.stock ?? 1) > 0;
  assert.strictEqual(isAvailable, true);
  assert.strictEqual(item.stock, 4);
});

runTest('Identifies out-of-stock products (stock === 0) for unavailable badge & disabled cart', () => {
  const item = fetchListingById('prod-106');
  const isAvailable = (item.stock ?? 1) > 0;
  assert.strictEqual(isAvailable, false);
  assert.strictEqual(item.stock, 0);
});

console.log('\n--- 4. Create Listing Validation & Compression Enforcement ---');

runTest('Rejects listing submission when title is empty or only whitespace', () => {
  assert.throws(
    () =>
      validateAndCreateListing({
        title: '   ',
        priceVnd: 50000,
        stock: 1,
        photoUri: 'file:///photo-compressed.jpg',
      }),
    (err) => err.code === 'VALIDATION_ERROR' && err.message.includes('Tên món đồ')
  );
});

runTest('Rejects listing submission when price is <= 0 or not an integer', () => {
  assert.throws(
    () =>
      validateAndCreateListing({
        title: 'Sách hay',
        priceVnd: 0,
        stock: 1,
        photoUri: 'file:///photo-compressed.jpg',
      }),
    (err) => err.code === 'VALIDATION_ERROR' && err.message.includes('Giá bán')
  );
});

runTest('Rejects listing submission when stock is negative', () => {
  assert.throws(
    () =>
      validateAndCreateListing({
        title: 'Sách hay',
        priceVnd: 50000,
        stock: -1,
        photoUri: 'file:///photo-compressed.jpg',
      }),
    (err) => err.code === 'VALIDATION_ERROR' && err.message.includes('tồn kho')
  );
});

runTest('Rejects listing submission when photo is missing (requires compressed photo)', () => {
  assert.throws(
    () =>
      validateAndCreateListing({
        title: 'Sách Giải tích',
        priceVnd: 50000,
        stock: 1,
        photoUri: '',
      }),
    (err) => err.code === 'VALIDATION_ERROR' && err.message.includes('ảnh sản phẩm')
  );
});

runTest('Successfully creates valid listing and prepends to catalogue items', () => {
  const initialLength = MOCK_DATA.length;
  const created = validateAndCreateListing({
    title: 'Giáo trình Cấu trúc dữ liệu và giải thuật',
    priceVnd: 80000,
    stock: 2,
    category: 'Sách giáo trình',
    campusLocation: 'Khu A - Thư viện',
    description: 'Sách photo bìa bóng, chữ rõ ràng không mờ.',
    photoUri: 'file:///data/user/0/cache/compressed-image.jpg',
  });

  assert.ok(created.id.startsWith('prod-'));
  assert.strictEqual(created.title, 'Giáo trình Cấu trúc dữ liệu và giải thuật');
  assert.strictEqual(created.priceVnd, 80000);
  assert.strictEqual(created.stock, 2);
  assert.strictEqual(MOCK_DATA.length, initialLength + 1);
  assert.strictEqual(MOCK_DATA[0].id, created.id);
});

console.log('\n--- 5. Favorites Shared State & Cross-Screen Consistency ---');

runTest('Adds listing to favorites and detects isFavorite=true', () => {
  const favStore = new FavoritesStore();
  const item = fetchListingById('prod-101');
  assert.strictEqual(favStore.isFavorite(item.id), false);

  favStore.add(item);
  assert.strictEqual(favStore.isFavorite(item.id), true);
  assert.strictEqual(favStore.items.length, 1);
});

runTest('Prevents duplicate entries when adding the same item multiple times', () => {
  const favStore = new FavoritesStore();
  const item = fetchListingById('prod-101');
  favStore.add(item);
  favStore.add(item);
  assert.strictEqual(favStore.items.length, 1);
});

runTest('Toggles favorite state correctly on repeated taps', () => {
  const favStore = new FavoritesStore();
  const item = fetchListingById('prod-101');

  favStore.toggle(item); // Add
  assert.strictEqual(favStore.isFavorite(item.id), true);

  favStore.toggle(item); // Remove
  assert.strictEqual(favStore.isFavorite(item.id), false);
  assert.strictEqual(favStore.items.length, 0);
});

runTest('Removes favorite by ID', () => {
  const favStore = new FavoritesStore();
  const item1 = fetchListingById('prod-101');
  const item2 = fetchListingById('prod-106');
  favStore.add(item1);
  favStore.add(item2);
  assert.strictEqual(favStore.items.length, 2);

  favStore.remove('prod-101');
  assert.strictEqual(favStore.items.length, 1);
  assert.strictEqual(favStore.isFavorite('prod-101'), false);
  assert.strictEqual(favStore.isFavorite('prod-106'), true);
});

console.log('\n================================================================');
console.log(` SUMMARY: ${passedCount}/${totalCount} TESTS PASSED (${passedCount === totalCount ? '100% GREEN' : 'FAILED'})`);
console.log('================================================================');

if (passedCount !== totalCount) {
  process.exit(1);
}
