import { describe, expect, it } from "vitest";
import { matchesProductSearch, normalizeSearchText } from "@/lib/product-search";

describe("product search", () => {
  it("normalizes punctuation, accents, and whitespace", () => {
    expect(normalizeSearchText("  Varenýky / Frozen  ")).toBe("varenyky frozen");
  });

  it.each(["perogies", "pierogies", "perogy", "perogi", "variniki"])(
    "matches %s with a store listing Varenyky",
    (query) => {
      expect(matchesProductSearch(query, ["Frozen Varenyky"])).toBe(true);
    },
  );

  it("does not match an unrelated product", () => {
    expect(matchesProductSearch("perogies", ["Honey", "Ceramics"])).toBe(false);
  });

  it("keeps literal matching for products outside the alias list", () => {
    expect(matchesProductSearch("honey", ["Raw Honey"])).toBe(true);
  });
});
