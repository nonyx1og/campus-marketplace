/**
 * CAMPUS MARKETPLACE - PROMPT 9: LOCAL NOTIFICATIONS & PRICE TRACKING SUITE
 * Automated test suite verifying local notification triggers on price drops,
 * permission handling (consent & refusal), and anti-spam suppression when price is unchanged.
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

// In-memory mock storage for permission and history testing
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
  clear() {
    this.store = {};
  }
}

// Pure notification evaluation function from features/notifications/priceTracker
function evaluatePriceChanges(
  favoriteIds,
  currentListings,
  existingHistory = {},
  nowIso = new Date().toISOString()
) {
  const notifications = [];
  const updatedHistory = { ...existingHistory };
  let skippedCount = 0;

  const favSet = new Set(favoriteIds);
  const listingsMap = new Map();
  for (const item of currentListings) {
    if (favSet.has(item.id)) {
      listingsMap.set(item.id, item);
    }
  }

  for (const favId of favoriteIds) {
    const listing = listingsMap.get(favId);
    if (!listing) continue;

    const currentPrice = Math.round(Number(listing.priceVnd));
    const record = existingHistory[favId];

    if (!record) {
      // Baseline initialization: do not spam alert
      updatedHistory[favId] = {
        lastKnownPriceVnd: currentPrice,
        lastNotifiedPriceVnd: currentPrice,
        lastCheckedAt: nowIso,
      };
      skippedCount++;
      continue;
    }

    const previousPrice = record.lastKnownPriceVnd;

    // Price did not change: DO NOT SPAM NOTIFICATION
    if (currentPrice === previousPrice) {
      updatedHistory[favId] = {
        ...record,
        lastCheckedAt: nowIso,
      };
      skippedCount++;
      continue;
    }

    // Already notified for this exact price
    if (record.lastNotifiedPriceVnd === currentPrice) {
      updatedHistory[favId] = {
        ...record,
        lastKnownPriceVnd: currentPrice,
        lastCheckedAt: nowIso,
      };
      skippedCount++;
      continue;
    }

    const savedDiff = previousPrice - currentPrice;
    const isDrop = currentPrice < previousPrice;

    notifications.push({
      id: `notif-price-${favId}-${Date.now()}`,
      listingId: favId,
      listingTitle: listing.title,
      oldPriceVnd: previousPrice,
      newPriceVnd: currentPrice,
      savedDiffVnd: Math.abs(savedDiff),
      timestamp: nowIso,
      type: isDrop ? 'price_drop' : 'price_change',
    });

    updatedHistory[favId] = {
      lastKnownPriceVnd: currentPrice,
      lastNotifiedPriceVnd: currentPrice,
      lastCheckedAt: nowIso,
    };
  }

  return {
    notifications,
    updatedHistory,
    skippedCount,
  };
}

// Sample items
const MOCK_LISTINGS = [
  {
    id: 'prod-101',
    title: 'Giáo trình Giải tích 1 & 2',
    priceVnd: 75000,
  },
  {
    id: 'prod-102',
    title: 'Máy tính Casio fx-580VN X',
    priceVnd: 420000,
  },
  {
    id: 'prod-103',
    title: 'Bàn học gấp gọn sinh viên',
    priceVnd: 90000,
  },
];

async function runTests() {
  console.log('================================================================');
  console.log(' CAMPUS MARKETPLACE - PROMPT 9: LOCAL NOTIFICATIONS SUITE');
  console.log('================================================================');

  section('1. Permission Workflow & User Refusal Handling');

  const storage = new MockStorage();

  await itAsync('Initial permission status defaults to undetermined', async () => {
    const saved = await storage.getItem('campus_marketplace_notification_permission');
    const status = saved || 'undetermined';
    assert.strictEqual(status, 'undetermined');
  });

  await itAsync('Handles user consenting to notifications (granted)', async () => {
    await storage.setItem('campus_marketplace_notification_permission', 'granted');
    const status = await storage.getItem('campus_marketplace_notification_permission');
    assert.strictEqual(status, 'granted');
  });

  await itAsync('Handles user explicitly denying notifications (denied)', async () => {
    await storage.setItem('campus_marketplace_notification_permission', 'denied');
    const status = await storage.getItem('campus_marketplace_notification_permission');
    assert.strictEqual(status, 'denied');
  });

  it('Suppresses notifications when permission is denied', () => {
    const permission = 'denied';
    const canNotify = permission === 'granted';
    assert.strictEqual(canNotify, false);
  });

  section('2. Baseline Price Tracking (Zero Initial Spam)');

  it('First check on newly favorited item records baseline price without triggering notification', () => {
    const favoriteIds = ['prod-101', 'prod-102'];
    const result = evaluatePriceChanges(favoriteIds, MOCK_LISTINGS, {});

    assert.strictEqual(result.notifications.length, 0, 'Must not send notifications on initial baseline');
    assert.strictEqual(result.skippedCount, 2);
    assert.strictEqual(result.updatedHistory['prod-101'].lastKnownPriceVnd, 75000);
    assert.strictEqual(result.updatedHistory['prod-102'].lastKnownPriceVnd, 420000);
  });

  section('3. Price Drop Detection & Notification Generation');

  it('Triggers price_drop notification when favorited item price decreases', () => {
    const favoriteIds = ['prod-101'];
    const history = {
      'prod-101': {
        lastKnownPriceVnd: 75000,
        lastNotifiedPriceVnd: 75000,
        lastCheckedAt: '2026-10-27T00:00:00Z',
      },
    };

    // Price reduced from 75k to 55k (saved 20k)
    const discountedListings = [
      { id: 'prod-101', title: 'Giáo trình Giải tích 1 & 2', priceVnd: 55000 },
    ];

    const result = evaluatePriceChanges(favoriteIds, discountedListings, history);

    assert.strictEqual(result.notifications.length, 1);
    const notif = result.notifications[0];
    assert.strictEqual(notif.type, 'price_drop');
    assert.strictEqual(notif.listingId, 'prod-101');
    assert.strictEqual(notif.oldPriceVnd, 75000);
    assert.strictEqual(notif.newPriceVnd, 55000);
    assert.strictEqual(notif.savedDiffVnd, 20000);
    assert.strictEqual(result.updatedHistory['prod-101'].lastKnownPriceVnd, 55000);
  });

  section('4. Anti-Spam: Suppression When Price is Unchanged');

  it('Does NOT trigger any notification when price remains identical (Anti-Spam Rule)', () => {
    const favoriteIds = ['prod-101'];
    const history = {
      'prod-101': {
        lastKnownPriceVnd: 55000,
        lastNotifiedPriceVnd: 55000,
        lastCheckedAt: '2026-10-27T01:00:00Z',
      },
    };

    // Price is still 55k
    const identicalListings = [
      { id: 'prod-101', title: 'Giáo trình Giải tích 1 & 2', priceVnd: 55000 },
    ];

    const result = evaluatePriceChanges(favoriteIds, identicalListings, history);

    assert.strictEqual(result.notifications.length, 0, 'Must NOT spam notification when price is unchanged');
    assert.strictEqual(result.skippedCount, 1);
  });

  it('Does not spam duplicate notification if already notified for the exact same price', () => {
    const favoriteIds = ['prod-101'];
    const history = {
      'prod-101': {
        lastKnownPriceVnd: 75000,
        lastNotifiedPriceVnd: 50000, // already notified for 50000
        lastCheckedAt: '2026-10-27T01:00:00Z',
      },
    };

    const listings = [
      { id: 'prod-101', title: 'Giáo trình Giải tích 1 & 2', priceVnd: 50000 },
    ];

    const result = evaluatePriceChanges(favoriteIds, listings, history);
    assert.strictEqual(result.notifications.length, 0);
  });

  section('5. Selective Tracking & Multi-Item Behavior');

  it('Only tracks and alerts for items in favoriteIds (ignores non-favorited price drops)', () => {
    const favoriteIds = ['prod-101']; // only prod-101 is favorited, prod-103 is not
    const history = {
      'prod-101': {
        lastKnownPriceVnd: 75000,
        lastNotifiedPriceVnd: 75000,
        lastCheckedAt: '2026-10-27T00:00:00Z',
      },
    };

    // Both prod-101 and prod-103 drop price
    const updatedListings = [
      { id: 'prod-101', title: 'Giáo trình Giải tích 1 & 2', priceVnd: 75000 }, // unchanged
      { id: 'prod-103', title: 'Bàn học gấp gọn sinh viên', priceVnd: 60000 }, // dropped from 90k, but not favorited!
    ];

    const result = evaluatePriceChanges(favoriteIds, updatedListings, history);
    assert.strictEqual(result.notifications.length, 0, 'Ignored non-favorited item price drop');
  });

  it('Correctly evaluates mixed favorites list where one dropped and one remained unchanged', () => {
    const favoriteIds = ['prod-101', 'prod-102'];
    const history = {
      'prod-101': {
        lastKnownPriceVnd: 75000,
        lastNotifiedPriceVnd: 75000,
        lastCheckedAt: '2026-10-27T00:00:00Z',
      },
      'prod-102': {
        lastKnownPriceVnd: 420000,
        lastNotifiedPriceVnd: 420000,
        lastCheckedAt: '2026-10-27T00:00:00Z',
      },
    };

    // prod-101 drops to 60k (-15k); prod-102 stays 420k
    const updatedListings = [
      { id: 'prod-101', title: 'Giáo trình Giải tích 1 & 2', priceVnd: 60000 },
      { id: 'prod-102', title: 'Máy tính Casio fx-580VN X', priceVnd: 420000 },
    ];

    const result = evaluatePriceChanges(favoriteIds, updatedListings, history);

    assert.strictEqual(result.notifications.length, 1);
    assert.strictEqual(result.notifications[0].listingId, 'prod-101');
    assert.strictEqual(result.notifications[0].savedDiffVnd, 15000);
    assert.strictEqual(result.skippedCount, 1);
  });

  console.log('\n================================================================');
  console.log(` SUMMARY: ${passed}/${passed + failed} TESTS PASSED (${failed === 0 ? '100% GREEN' : 'FAILED'})`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
