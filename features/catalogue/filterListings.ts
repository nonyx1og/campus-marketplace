export interface FilterableListing {
  id?: string;
  title?: string | null;
  category?: string | null;
  description?: string | null;
}

/**
 * Pure function to filter catalogue listings based on search text and selected category.
 *
 * Rules:
 * - Search is case-insensitive and trims leading/trailing whitespace.
 * - Category filter matches against item category (case-insensitive & trimmed).
 * - Empty category ('', '   ', null, undefined, 'Tất cả', 'All') matches all categories.
 * - Safely handles missing/null/undefined title, category, description, or malformed items.
 * - Pure: Never mutates the source array or items. Always returns a new array.
 *
 * @param listings Array of listing items to filter
 * @param searchText Free text search keyword
 * @param selectedCategory Selected category name or 'Tất cả'
 * @returns Filtered array of listings
 */
export function filterListings<T extends FilterableListing = FilterableListing>(
  listings: T[] | null | undefined,
  searchText?: string | null,
  selectedCategory?: string | null
): T[] {
  // Safe guard against non-array inputs
  if (!Array.isArray(listings)) {
    return [];
  }

  // Normalize search keyword
  const trimmedSearch = typeof searchText === 'string' ? searchText.trim() : '';
  const normalizedSearch = trimmedSearch.toLowerCase();
  const isSearchActive = normalizedSearch.length > 0;

  // Normalize category
  const trimmedCategory = typeof selectedCategory === 'string' ? selectedCategory.trim() : '';
  const normalizedCategory = trimmedCategory.toLowerCase();
  const isCategoryActive =
    normalizedCategory.length > 0 &&
    normalizedCategory !== 'tất cả' &&
    normalizedCategory !== 'all';

  // If both filters are inactive, return clean shallow copy of valid items
  if (!isSearchActive && !isCategoryActive) {
    return listings.filter((item): item is T => item != null && typeof item === 'object');
  }

  return listings.filter((item): item is T => {
    // Safely skip null, undefined, or non-object entries
    if (item == null || typeof item !== 'object') {
      return false;
    }

    // 1. Category Filter Check (Safe against missing/null category)
    if (isCategoryActive) {
      const itemCategory =
        typeof item.category === 'string' ? item.category.trim().toLowerCase() : '';
      if (itemCategory !== normalizedCategory) {
        return false;
      }
    }

    // 2. Search Text Filter Check (Safe against missing/null title or description)
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
