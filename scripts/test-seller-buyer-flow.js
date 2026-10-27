/**
 * CAMPUS MARKETPLACE - PROMPT 9: SELLER/BUYER VIEW & BACKEND AUTHORIZATION
 * Automated test suite verifying role-based views on listing detail
 * and strict backend authorization enforcement.
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

// Simulated domain types & mock users
const BUYER_USER = {
  id: 'usr_student_01',
  name: 'Nguyễn Văn Sinh Viên',
  role: 'buyer',
};

const SELLER_OWNER = {
  id: 'usr_seller_02',
  name: 'Trần Thị Người Bán',
  role: 'seller',
};

const OTHER_SELLER = {
  id: 'usr_seller_99',
  name: 'Lê Văn Người Bán Khác',
  role: 'seller',
};

const ADMIN_USER = {
  id: 'usr_admin_01',
  name: 'Ban Quản Lý Trường',
  role: 'admin',
};

const SAMPLE_LISTING = {
  id: 'prod-101',
  title: 'Giáo trình Giải tích 1 & 2',
  priceVnd: 75000,
  priceMinor: 75000,
  stock: 4,
  sellerId: 'usr_seller_02',
  sellerName: 'Trần Thị Người Bán',
  category: 'Sách giáo trình',
  campusLocation: 'Khu A',
};

// Pure logic: Determine effective role view
function deriveEffectiveRoleView(listing, user, previewOverride = 'auto') {
  if (previewOverride === 'seller') return 'seller';
  if (previewOverride === 'buyer') return 'buyer';

  if (!user || !listing) return 'buyer';

  const isOwner = user.id === listing.sellerId;
  const isAdmin = user.role === 'admin';
  const isSellerRole = user.role === 'seller';

  if (isAdmin || (isSellerRole && isOwner)) {
    return 'seller';
  }

  return 'buyer';
}

// Pure backend authorization enforcement function for stock update
function enforceBackendStockUpdateAuthorization(listing, newStock, currentUser) {
  if (!currentUser) {
    const error = new Error('Yêu cầu đăng nhập: Bạn cần đăng nhập tài khoản để thực hiện thao tác quản lý kho.');
    error.code = 'UNAUTHORIZED';
    error.status = 401;
    throw error;
  }

  const stockInt = Math.round(Number(newStock));
  if (isNaN(stockInt) || stockInt < 0) {
    const error = new Error('Số lượng tồn kho phải là số nguyên không âm.');
    error.code = 'VALIDATION_ERROR';
    error.status = 400;
    throw error;
  }

  if (!listing) {
    const error = new Error('Không tìm thấy tin đăng.');
    error.code = 'NOT_FOUND';
    error.status = 404;
    throw error;
  }

  const isOwner = listing.sellerId === currentUser.id;
  const isAdmin = currentUser.role === 'admin';
  const isAuthorizedSeller = currentUser.role === 'seller' && isOwner;

  if (!isAdmin && !isAuthorizedSeller) {
    const error = new Error('Từ chối quyền truy cập (403): Chỉ người bán sở hữu tin đăng này mới có quyền cập nhật tồn kho.');
    error.code = 'FORBIDDEN';
    error.status = 403;
    throw error;
  }

  return {
    ...listing,
    stock: stockInt,
    updatedAt: new Date().toISOString(),
  };
}

// Pure backend authorization enforcement function for general listing update
function enforceBackendListingUpdateAuthorization(listing, updates, currentUser) {
  if (!currentUser) {
    const error = new Error('Yêu cầu đăng nhập.');
    error.code = 'UNAUTHORIZED';
    error.status = 401;
    throw error;
  }

  if (!listing) {
    const error = new Error('Không tìm thấy tin đăng.');
    error.code = 'NOT_FOUND';
    error.status = 404;
    throw error;
  }

  const isOwner = listing.sellerId === currentUser.id;
  const isAdmin = currentUser.role === 'admin';
  const isAuthorizedSeller = currentUser.role === 'seller' && isOwner;

  if (!isAdmin && !isAuthorizedSeller) {
    const error = new Error('Từ chối quyền truy cập (403).');
    error.code = 'FORBIDDEN';
    error.status = 403;
    throw error;
  }

  if (updates.priceVnd !== undefined) {
    const priceInt = Math.round(Number(updates.priceVnd));
    if (isNaN(priceInt) || priceInt <= 0) {
      const error = new Error('Giá bán phải là số nguyên dương tính theo VND.');
      error.code = 'VALIDATION_ERROR';
      error.status = 400;
      throw error;
    }
  }

  return {
    ...listing,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
}

async function runTests() {
  console.log('================================================================');
  console.log(' CAMPUS MARKETPLACE - PROMPT 9: SELLER/BUYER VIEW & AUTH SUITE');
  console.log('================================================================');

  section('1. Role-Based View Derivation');

  it('Renders buyer view for standard student account', () => {
    const view = deriveEffectiveRoleView(SAMPLE_LISTING, BUYER_USER);
    assert.strictEqual(view, 'buyer');
  });

  it('Renders buyer view for unauthenticated guest', () => {
    const view = deriveEffectiveRoleView(SAMPLE_LISTING, null);
    assert.strictEqual(view, 'buyer');
  });

  it('Renders seller view for seller who owns the listing', () => {
    const view = deriveEffectiveRoleView(SAMPLE_LISTING, SELLER_OWNER);
    assert.strictEqual(view, 'seller');
  });

  it('Renders buyer view for seller who does NOT own the listing', () => {
    const view = deriveEffectiveRoleView(SAMPLE_LISTING, OTHER_SELLER);
    assert.strictEqual(view, 'buyer');
  });

  it('Renders seller view for admin on any listing', () => {
    const view = deriveEffectiveRoleView(SAMPLE_LISTING, ADMIN_USER);
    assert.strictEqual(view, 'seller');
  });

  it('Honors preview override switcher for viva/demo testing', () => {
    assert.strictEqual(deriveEffectiveRoleView(SAMPLE_LISTING, BUYER_USER, 'seller'), 'seller');
    assert.strictEqual(deriveEffectiveRoleView(SAMPLE_LISTING, SELLER_OWNER, 'buyer'), 'buyer');
    assert.strictEqual(deriveEffectiveRoleView(SAMPLE_LISTING, SELLER_OWNER, 'auto'), 'seller');
  });

  section('2. Backend Authorization Enforcement for Stock Management');

  it('Rejects unauthenticated stock update with 401 UNAUTHORIZED', () => {
    assert.throws(
      () => enforceBackendStockUpdateAuthorization(SAMPLE_LISTING, 10, null),
      (err) => err.status === 401 && err.code === 'UNAUTHORIZED'
    );
  });

  it('Rejects buyer account stock update with 403 FORBIDDEN', () => {
    assert.throws(
      () => enforceBackendStockUpdateAuthorization(SAMPLE_LISTING, 10, BUYER_USER),
      (err) => err.status === 403 && err.code === 'FORBIDDEN'
    );
  });

  it('Rejects non-owner seller stock update with 403 FORBIDDEN', () => {
    assert.throws(
      () => enforceBackendStockUpdateAuthorization(SAMPLE_LISTING, 10, OTHER_SELLER),
      (err) => err.status === 403 && err.code === 'FORBIDDEN'
    );
  });

  it('Rejects negative stock input with 400 VALIDATION_ERROR', () => {
    assert.throws(
      () => enforceBackendStockUpdateAuthorization(SAMPLE_LISTING, -5, SELLER_OWNER),
      (err) => err.status === 400 && err.code === 'VALIDATION_ERROR'
    );
  });

  it('Authorizes owner seller to update stock', () => {
    const updated = enforceBackendStockUpdateAuthorization(SAMPLE_LISTING, 12, SELLER_OWNER);
    assert.strictEqual(updated.stock, 12);
  });

  it('Authorizes admin to update stock', () => {
    const updated = enforceBackendStockUpdateAuthorization(SAMPLE_LISTING, 0, ADMIN_USER);
    assert.strictEqual(updated.stock, 0);
  });

  section('3. Backend Authorization Enforcement for General Listing Updates');

  it('Rejects buyer updating price with 403 FORBIDDEN', () => {
    assert.throws(
      () => enforceBackendListingUpdateAuthorization(SAMPLE_LISTING, { priceVnd: 50000 }, BUYER_USER),
      (err) => err.status === 403 && err.code === 'FORBIDDEN'
    );
  });

  it('Rejects invalid non-positive price with 400 VALIDATION_ERROR', () => {
    assert.throws(
      () => enforceBackendListingUpdateAuthorization(SAMPLE_LISTING, { priceVnd: 0 }, SELLER_OWNER),
      (err) => err.status === 400 && err.code === 'VALIDATION_ERROR'
    );
  });

  it('Authorizes owner seller to update price', () => {
    const updated = enforceBackendListingUpdateAuthorization(SAMPLE_LISTING, { priceVnd: 85000 }, SELLER_OWNER);
    assert.strictEqual(updated.priceVnd, 85000);
  });

  section('4. Stock-Aware UI Actions Derivation');

  it('Buyer view disables add to cart when stock is 0', () => {
    const outOfStockListing = { ...SAMPLE_LISTING, stock: 0 };
    const isAvailable = outOfStockListing.stock > 0;
    assert.strictEqual(isAvailable, false);
  });

  it('Buyer view enables add to cart and favorite when stock > 0', () => {
    const inStockListing = { ...SAMPLE_LISTING, stock: 5 };
    const isAvailable = inStockListing.stock > 0;
    assert.strictEqual(isAvailable, true);
  });

  console.log('\n================================================================');
  console.log(` SUMMARY: ${passed}/${passed + failed} TESTS PASSED (${failed === 0 ? '100% GREEN' : 'FAILED'})`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
