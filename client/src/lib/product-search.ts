/**
 * Search helpers for product names entered by people using different
 * transliterations and common spellings.
 */

export const normalizeSearchText = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\u0400-\u04ff\s]+/gi, " ")
    .trim()
    .replace(/\s+/g, " ");

type ProductSearchFamily = {
  id: string;
  aliases: string[];
};

// These names all refer to the same dumpling family. Keep the aliases here
// so new spellings can be added without changing the map components.
const PRODUCT_SEARCH_FAMILIES: ProductSearchFamily[] = [
  {
    id: "pierogi",
    aliases: [
      "pierogi",
      "pierogies",
      "perogi",
      "perogy",
      "perogies",
      "vareniki",
      "variniki",
      "varenyky",
      "varenyki",
      "vareniky",
    ],
  },
];

const getSearchTokens = (value: string): string[] => normalizeSearchText(value).split(" ").filter(Boolean);

const getProductFamilies = (value: string): Set<string> => {
  const tokens = new Set(getSearchTokens(value));

  return new Set(
    PRODUCT_SEARCH_FAMILIES
      .filter((family) => family.aliases.some((alias) => tokens.has(alias)))
      .map((family) => family.id),
  );
};

/**
 * Matches a user's search against product names using both the literal text
 * and known product families. The family check also works when a product is
 * stored as a longer label such as "Frozen Varenyky".
 */
export const matchesProductSearch = (query: string, products: string[]): boolean => {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return true;

  const normalizedProducts = products.map(normalizeSearchText);
  if (normalizedProducts.some((product) => product.includes(normalizedQuery))) {
    return true;
  }

  const queryFamilies = getProductFamilies(normalizedQuery);
  if (queryFamilies.size === 0) return false;

  return normalizedProducts.some((product) => {
    const productFamilies = getProductFamilies(product);
    return Array.from(queryFamilies).some((family) => productFamilies.has(family));
  });
};
