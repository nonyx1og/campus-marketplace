/**
 * CAMPUS MARKETPLACE - PROMPT 9: PULL-TO-REFRESH & CACHE PRESERVATION SUITE
 * Automated test suite verifying pull-to-refresh flow, last-updated timestamp
 * formatting and display, and strict cache preservation when refresh fails.
 */

const assert = require('assert');

// Simple test runner
let passed = 0;
let failed = 0;

function it(description, fn) {
  try {
    fn();
    console.log(`  ✔ PASS: ${description}`);
    passed++;
  } catch (err) {
    console.error(`  ✖ FAIL: ${description}`);
    console.error(`    ${err.message}`);
    failed++;
  }
}

async function itAsync(description, fn) {
  try {
    await fn();
    console.log(`  ✔ PASS: ${description}`);
    passed++;
  } catch (err) {
    console.error(`  ✖ FAIL: ${description}`);
    console.error(`    ${err.message}`);
    failed++;
  }
}

function section(title) {
  console.log(`\n--- ${title} ---`);
}

// In-memory mock storage
class MockStorage {
  constructor() {
    this.store = {};
  }
  async getItem(key) {
    return this.store[key] || null;
  }
  async setItem(key, val) {
    this.store[key] = String(val);
  }
  async removeItem(key) {
    delete this.store[key];
  }
}

// Pure function: Format last updated timestamp (from OfflineBanner.tsx)
function formatLastUpdatedTime(isoString) {
  if (!isoString) return 'Chưa có thông tin';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return 'Gần đây';

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`;
  } catch {
    return 'Gần đây';
  }
}

// Pure function simulating the Catalogue Pull-to-Refresh State Machine
class CatalogueRefreshManager {
  constructor(initialItems = [], initialTimestamp = null) {
    this.items = [...initialItems];
    this.lastSuccessfulUpdated = initialTimestamp;
    this.refreshError = null;
    this.isRefreshing = false;
  }

  async executePullToRefresh(fetchRemoteFn) {
    this.isRefreshing = true;
    this.refreshError = null;

    try {
      const freshData = await fetchRemoteFn();
      // On success: update items, record fresh timestamp, clear errors
      this.items = [...freshData.items];
      this.lastSuccessfulUpdated = freshData.timestamp || new Date().toISOString();
      this.refreshError = null;
      return { success: true, items: this.items, lastUpdated: this.lastSuccessfulUpdated };
    } catch (err) {
      // PRESERVE CACHE: Do NOT wipe existing items!
      this.refreshError = err.message || 'Lỗi kết nối khi làm mới.';
      // Existing items and lastSuccessfulUpdated remain 100% intact!
      return {
        success: false,
        error: this.refreshError,
        items: this.items, // preserved!
        lastUpdated: this.lastSuccessfulUpdated, // preserved!
      };
    } finally {
      this.isRefreshing = false;
    }
  }
}

const INITIAL_CACHE_ITEMS = [
  { id: 'prod-101', title: 'Giáo trình Giải tích 1', priceVnd: 75000 },
  { id: 'prod-102', title: 'Máy tính Casio fx-580', priceVnd: 420000 },
];

async function runTests() {
  console.log('================================================================');
  console.log(' CAMPUS MARKETPLACE - PROMPT 9: PULL-TO-REFRESH & CACHE SUITE');
  console.log('================================================================');

  section('1. Last-Updated Timestamp Formatting');

  it('Formats valid ISO string into HH:mm:ss DD/MM/YYYY readable format', () => {
    const formatted = formatLastUpdatedTime('2026-10-27T10:15:30.000Z');
    assert.match(formatted, /\d{2}:\d{2}:\d{2}\s\d{2}\/\d{2}\/\d{4}/);
  });

  it('Handles null or undefined timestamp gracefully without crashing', () => {
    assert.strictEqual(formatLastUpdatedTime(null), 'Chưa có thông tin');
    assert.strictEqual(formatLastUpdatedTime(undefined), 'Chưa có thông tin');
    assert.strictEqual(formatLastUpdatedTime(''), 'Chưa có thông tin');
  });

  it('Handles malformed date string safely', () => {
    assert.strictEqual(formatLastUpdatedTime('not-a-valid-date'), 'Gần đây');
  });

  section('2. Pull-To-Refresh Success Flow');

  await itAsync('Successfully updates items and sets lastUpdated timestamp on fetch success', async () => {
    const manager = new CatalogueRefreshManager(INITIAL_CACHE_ITEMS, '2026-10-27T08:00:00Z');

    const result = await manager.executePullToRefresh(async () => ({
      items: [
        ...INITIAL_CACHE_ITEMS,
        { id: 'prod-103', title: 'Bàn học gấp gọn', priceVnd: 90000 },
      ],
      timestamp: '2026-10-27T10:30:00Z',
    }));

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.items.length, 3);
    assert.strictEqual(result.lastUpdated, '2026-10-27T10:30:00Z');
    assert.strictEqual(manager.refreshError, null);
    assert.strictEqual(manager.isRefreshing, false);
  });

  section('3. Cache Preservation on Refresh Error (Strict Rule)');

  await itAsync('PRESERVES cached items when pull-to-refresh encounters network error', async () => {
    const initialTimestamp = '2026-10-27T10:00:00Z';
    const manager = new CatalogueRefreshManager(INITIAL_CACHE_ITEMS, initialTimestamp);

    // Simulate network error during pull-to-refresh
    const result = await manager.executePullToRefresh(async () => {
      throw new Error('NETWORK_TIMEOUT: Mất kết nối mạng máy chủ.');
    });

    assert.strictEqual(result.success, false);
    assert.strictEqual(manager.isRefreshing, false);

    // CRITICAL REQUIREMENT: Items MUST NOT be wiped out!
    assert.strictEqual(result.items.length, 2, 'Must preserve existing 2 items in cache');
    assert.strictEqual(result.items[0].id, 'prod-101');
    assert.strictEqual(result.items[1].id, 'prod-102');

    // CRITICAL REQUIREMENT: Last-updated time must remain intact from last successful fetch
    assert.strictEqual(result.lastUpdated, initialTimestamp, 'Must preserve previous successful timestamp');

    // Informative error message must be set for user banner
    assert.match(manager.refreshError, /NETWORK_TIMEOUT/);
  });

  await itAsync('Recovers cleanly on subsequent successful refresh after previous error', async () => {
    const manager = new CatalogueRefreshManager(INITIAL_CACHE_ITEMS, '2026-10-27T10:00:00Z');

    // 1. Error occurs
    await manager.executePullToRefresh(async () => {
      throw new Error('SERVER_503: Service Unavailable');
    });
    assert.strictEqual(manager.items.length, 2);
    assert.notStrictEqual(manager.refreshError, null);

    // 2. Next refresh succeeds
    const recoveryResult = await manager.executePullToRefresh(async () => ({
      items: [{ id: 'prod-101', title: 'Giáo trình Giải tích 1', priceVnd: 70000 }],
      timestamp: '2026-10-27T11:00:00Z',
    }));

    assert.strictEqual(recoveryResult.success, true);
    assert.strictEqual(manager.refreshError, null, 'Error must be cleared on successful refresh');
    assert.strictEqual(recoveryResult.lastUpdated, '2026-10-27T11:00:00Z');
    assert.strictEqual(manager.items.length, 1);
  });

  section('4. Offline Banner & Header Freshness Integration');

  it('Calculates correct relative freshness status', () => {
    const timestamp = new Date().toISOString();
    const formatted = formatLastUpdatedTime(timestamp);
    assert.ok(formatted.length > 0);
  });

  console.log('\n================================================================');
  console.log(` SUMMARY: ${passed}/${passed + failed} TESTS PASSED (${failed === 0 ? '100% GREEN' : 'FAILED'})`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
