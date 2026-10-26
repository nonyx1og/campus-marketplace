/**
 * Automated Test Suite: Campus Marketplace Search & Category Filter (Prompt 5)
 *
 * Verifies pure function filterListings across:
 * - Empty search (search rỗng)
 * - Empty category (category rỗng)
 * - Both search & category active (cả hai cùng dùng)
 * - No matching results (không có kết quả)
 * - Safe handling of missing/null title and category (dữ liệu thiếu title/category an toàn)
 * - Case-insensitivity & whitespace handling (không phân biệt hoa thường, xử lý khoảng trắng)
 * - Pure function immutability & determinism
 */

const assert = require('assert');

// Implement standard CommonJS wrapper around pure filterListings for node runner
function filterListings(listings, searchText, selectedCategory) {
  if (!Array.isArray(listings)) {
    return [];
  }

  const trimmedSearch = typeof searchText === 'string' ? searchText.trim() : '';
  const normalizedSearch = trimmedSearch.toLowerCase();
  const isSearchActive = normalizedSearch.length > 0;

  const trimmedCategory = typeof selectedCategory === 'string' ? selectedCategory.trim() : '';
  const normalizedCategory = trimmedCategory.toLowerCase();
  const isCategoryActive =
    normalizedCategory.length > 0 &&
    normalizedCategory !== 'tất cả' &&
    normalizedCategory !== 'all';

  if (!isSearchActive && !isCategoryActive) {
    return listings.filter((item) => item != null && typeof item === 'object');
  }

  return listings.filter((item) => {
    if (item == null || typeof item !== 'object') {
      return false;
    }

    // 1. Category check (safe against missing/null category)
    if (isCategoryActive) {
      const itemCategory =
        typeof item.category === 'string' ? item.category.trim().toLowerCase() : '';
      if (itemCategory !== normalizedCategory) {
        return false;
      }
    }

    // 2. Search check (safe against missing/null title, description, category)
    if (isSearchActive) {
      const itemTitle = typeof item.title === 'string' ? item.title.toLowerCase() : '';
      const itemDesc = typeof item.description === 'string' ? item.description.toLowerCase() : '';
      const itemCat = typeof item.category === 'string' ? item.category.toLowerCase() : '';

      const isMatch =
        itemTitle.includes(normalizedSearch) ||
        itemDesc.includes(normalizedSearch) ||
        itemCat.includes(normalizedSearch);

      if (!isMatch) {
        return false;
      }
    }

    return true;
  });
}

// Sample dataset adhering to Campus Marketplace ListingItem contract
const SAMPLE_LISTINGS = [
  {
    id: 'item-1',
    title: 'Giáo trình Giải tích 1 & 2 (Kèm bài tập)',
    category: 'Sách giáo trình',
    description: 'Sách còn mới 95%, có ghi chú các dạng đề thi cuối kỳ.',
    priceVnd: 75000,
  },
  {
    id: 'item-2',
    title: 'Máy tính Casio fx-580VN X chính hãng',
    category: 'Thiết bị học tập',
    description: 'Máy nguyên tem Bitex, dùng cho tân sinh viên.',
    priceVnd: 420000,
  },
  {
    id: 'item-3',
    title: 'Bàn học gấp gọn sinh viên chân sắt mặt gỗ',
    category: 'Đồ dùng phòng trọ',
    description: 'Bàn chân sắt chịu lực tốt, mặt gỗ chống nước.',
    priceVnd: 90000,
  },
  {
    id: 'item-4',
    title: 'Bộ vợt cầu lông Yonex Carbon',
    category: 'Thể thao & Giải trí',
    description: 'Đã căng cước 10.5kg, kèm bao đựng.',
    priceVnd: 280000,
  },
  {
    id: 'item-5',
    title: 'Giáo trình Kinh tế vi mô & vĩ mô',
    category: 'Sách giáo trình',
    description: 'Bộ 2 cuốn nhập môn kinh tế kèm slide.',
    priceVnd: 60000,
  },
];

let totalTests = 0;
let passedTests = 0;

function it(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✔ PASS: ${name}`);
    passedTests++;
  } catch (error) {
    console.error(`  ✖ FAIL: ${name}`);
    console.error(`    ${error.message}`);
  }
}

console.log('================================================================');
console.log(' CAMPUS MARKETPLACE - SEARCH & CATEGORY FILTER TEST SUITE');
console.log('================================================================');

// ----------------------------------------------------------------------------
// 1. Search rỗng (Empty Search Keyword)
// ----------------------------------------------------------------------------
console.log('\n--- 1. Search rỗng ---');

it('Empty search string ("") with category "Tất cả" returns all listings', () => {
  const result = filterListings(SAMPLE_LISTINGS, '', 'Tất cả');
  assert.strictEqual(result.length, 5);
});

it('Search with only spaces ("   ") is trimmed and returns all listings', () => {
  const result = filterListings(SAMPLE_LISTINGS, '   ', 'Tất cả');
  assert.strictEqual(result.length, 5);
});

it('Null search returns all listings', () => {
  const result = filterListings(SAMPLE_LISTINGS, null, 'Tất cả');
  assert.strictEqual(result.length, 5);
});

it('Undefined search returns all listings', () => {
  const result = filterListings(SAMPLE_LISTINGS, undefined, 'Tất cả');
  assert.strictEqual(result.length, 5);
});

it('Empty search with active category returns all items of that category', () => {
  const result = filterListings(SAMPLE_LISTINGS, '', 'Sách giáo trình');
  assert.strictEqual(result.length, 2);
  assert(result.every((item) => item.category === 'Sách giáo trình'));
});

// ----------------------------------------------------------------------------
// 2. Category rỗng (Empty / All Categories)
// ----------------------------------------------------------------------------
console.log('\n--- 2. Category rỗng ---');

it('Empty category string ("") with search query filters across all categories', () => {
  const result = filterListings(SAMPLE_LISTINGS, 'Casio', '');
  assert.strictEqual(result.length, 1);
  assert.strictEqual(result[0].id, 'item-2');
});

it('Category with only spaces ("   ") is treated as empty', () => {
  const result = filterListings(SAMPLE_LISTINGS, 'Giáo trình', '   ');
  assert.strictEqual(result.length, 2);
});

it('Null category is treated as empty', () => {
  const result = filterListings(SAMPLE_LISTINGS, 'Bàn học', null);
  assert.strictEqual(result.length, 1);
  assert.strictEqual(result[0].id, 'item-3');
});

it('Undefined category is treated as empty', () => {
  const result = filterListings(SAMPLE_LISTINGS, 'Yonex', undefined);
  assert.strictEqual(result.length, 1);
  assert.strictEqual(result[0].id, 'item-4');
});

it('Category "Tất cả" (case-insensitive) matches all categories', () => {
  const result1 = filterListings(SAMPLE_LISTINGS, '', 'Tất cả');
  const result2 = filterListings(SAMPLE_LISTINGS, '', 'tất cả');
  const result3 = filterListings(SAMPLE_LISTINGS, '', 'All');
  assert.strictEqual(result1.length, 5);
  assert.strictEqual(result2.length, 5);
  assert.strictEqual(result3.length, 5);
});

it('Both search rỗng and category rỗng returns all listings', () => {
  const result = filterListings(SAMPLE_LISTINGS, '', '');
  assert.strictEqual(result.length, 5);
});

// ----------------------------------------------------------------------------
// 3. Cả hai cùng dùng (Both Search and Category Active)
// ----------------------------------------------------------------------------
console.log('\n--- 3. Cả hai cùng dùng (Both Search and Category Active) ---');

it('Matches items satisfying BOTH search query and category', () => {
  const result = filterListings(SAMPLE_LISTINGS, 'kinh tế', 'Sách giáo trình');
  assert.strictEqual(result.length, 1);
  assert.strictEqual(result[0].id, 'item-5');
});

it('Returns empty array when search matches title but category does not match', () => {
  // Title contains "Giáo trình" but category is "Đồ dùng phòng trọ"
  const result = filterListings(SAMPLE_LISTINGS, 'Giáo trình', 'Đồ dùng phòng trọ');
  assert.strictEqual(result.length, 0);
});

it('Returns empty array when category matches but search query does not match', () => {
  const result = filterListings(SAMPLE_LISTINGS, 'Xe đạp', 'Sách giáo trình');
  assert.strictEqual(result.length, 0);
});

// ----------------------------------------------------------------------------
// 4. Không có kết quả (No Matching Results)
// ----------------------------------------------------------------------------
console.log('\n--- 4. Không có kết quả (No Matches) ---');

it('Returns empty array for nonexistent search query', () => {
  const result = filterListings(SAMPLE_LISTINGS, 'iPhone 16 Pro Max Không Có Ở Đây', 'Tất cả');
  assert.strictEqual(result.length, 0);
  assert(Array.isArray(result));
});

it('Returns empty array for category with no listings', () => {
  const result = filterListings(SAMPLE_LISTINGS, '', 'Thời trang & Quần áo');
  assert.strictEqual(result.length, 0);
});

it('Returns empty array when filtering an empty input array', () => {
  const result = filterListings([], 'Casio', 'Thiết bị học tập');
  assert.strictEqual(result.length, 0);
});

// ----------------------------------------------------------------------------
// 5. Dữ liệu thiếu title/category an toàn (Safe Handling of Missing Fields)
// ----------------------------------------------------------------------------
console.log('\n--- 5. Dữ liệu thiếu title/category an toàn ---');

const INCOMPLETE_LISTINGS = [
  { id: 'inc-1', category: 'Sách giáo trình' }, // Missing title
  { id: 'inc-2', title: 'Máy tính Casio', category: null }, // Null category
  { id: 'inc-3', title: null, category: 'Thiết bị học tập' }, // Null title
  { id: 'inc-4', title: undefined, category: undefined }, // Missing both
  { id: 'inc-5' }, // Empty item
  null, // Null item in array
  undefined, // Undefined item in array
  { id: 'inc-6', title: 'Đèn học LED', category: 'Thiết bị học tập', description: 'Đèn chống cận' },
];

it('Safely filters items when title is missing or null without throwing TypeError', () => {
  let result = null;
  assert.doesNotThrow(() => {
    result = filterListings(INCOMPLETE_LISTINGS, 'Đèn học', 'Tất cả');
  });
  assert(Array.isArray(result));
  assert.strictEqual(result.length, 1);
  assert.strictEqual(result[0].id, 'inc-6');
});

it('Safely filters by category when items have missing/null category without throwing', () => {
  let result = null;
  assert.doesNotThrow(() => {
    result = filterListings(INCOMPLETE_LISTINGS, '', 'Sách giáo trình');
  });
  assert(Array.isArray(result));
  assert.strictEqual(result.length, 1);
  assert.strictEqual(result[0].id, 'inc-1');
});

it('Safely handles null and undefined items inside the array', () => {
  let result = null;
  assert.doesNotThrow(() => {
    result = filterListings(INCOMPLETE_LISTINGS, '', 'Tất cả');
  });
  assert(Array.isArray(result));
  // Filtered of null/undefined primitives, keeping valid objects
  assert(result.every((item) => item != null && typeof item === 'object'));
});

it('Safely handles null/undefined/non-array as listings parameter', () => {
  assert.deepStrictEqual(filterListings(null, 'test', 'cat'), []);
  assert.deepStrictEqual(filterListings(undefined, 'test', 'cat'), []);
  assert.deepStrictEqual(filterListings(12345, 'test', 'cat'), []);
  assert.deepStrictEqual(filterListings('not an array', 'test', 'cat'), []);
  assert.deepStrictEqual(filterListings({}, 'test', 'cat'), []);
});

// ----------------------------------------------------------------------------
// 6. Case-insensitivity & Whitespace Handling
// ----------------------------------------------------------------------------
console.log('\n--- 6. Case-insensitivity & Whitespace Handling ---');

it('Search is case-insensitive (UPPERCASE keyword matches title)', () => {
  const result = filterListings(SAMPLE_LISTINGS, 'CASIO', 'Tất cả');
  assert.strictEqual(result.length, 1);
  assert.strictEqual(result[0].id, 'item-2');
});

it('Search is case-insensitive with Vietnamese unicode characters ("GIÁO TRÌNH")', () => {
  const result = filterListings(SAMPLE_LISTINGS, 'GIÁO TRÌNH', 'Tất cả');
  assert.strictEqual(result.length, 2);
});

it('Search trims leading and trailing whitespace ("   casio   ")', () => {
  const result = filterListings(SAMPLE_LISTINGS, '   casio   ', 'Tất cả');
  assert.strictEqual(result.length, 1);
  assert.strictEqual(result[0].id, 'item-2');
});

it('Category matching trims whitespace and is case-insensitive', () => {
  const result = filterListings(SAMPLE_LISTINGS, '', '   sÁcH giÁo tRình   ');
  assert.strictEqual(result.length, 2);
});

// ----------------------------------------------------------------------------
// 7. Pure Function Verification (Immutability & Determinism)
// ----------------------------------------------------------------------------
console.log('\n--- 7. Pure Function: Immutability & Determinism ---');

it('Does NOT mutate the original listings array', () => {
  const originalCopy = JSON.parse(JSON.stringify(SAMPLE_LISTINGS));
  const result = filterListings(SAMPLE_LISTINGS, 'casio', 'Thiết bị học tập');
  assert.notStrictEqual(result, SAMPLE_LISTINGS);
  assert.deepStrictEqual(SAMPLE_LISTINGS, originalCopy);
});

it('Does NOT mutate item objects within the array', () => {
  const firstItemBefore = { ...SAMPLE_LISTINGS[0] };
  filterListings(SAMPLE_LISTINGS, 'giải tích', 'Sách giáo trình');
  assert.deepStrictEqual(SAMPLE_LISTINGS[0], firstItemBefore);
});

it('Is completely deterministic (returns identical results on repeated calls)', () => {
  const run1 = filterListings(SAMPLE_LISTINGS, 'bàn học', 'Đồ dùng phòng trọ');
  const run2 = filterListings(SAMPLE_LISTINGS, 'bàn học', 'Đồ dùng phòng trọ');
  assert.deepStrictEqual(run1, run2);
});

// ----------------------------------------------------------------------------
// Summary
// ----------------------------------------------------------------------------
console.log('================================================================');
console.log(` SUMMARY: ${passedTests}/${totalTests} TESTS PASSED (${passedTests === totalTests ? '100% GREEN' : 'FAILED'})`);
console.log('================================================================');

if (passedTests !== totalTests) {
  process.exit(1);
}
