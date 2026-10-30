import { Search } from "lucide-react";
import type { Category } from "../../lib/types";

export type SortOption = "featured" | "newest" | "price-asc" | "price-desc";

type ProductToolbarProps = {
  query: string;
  onQueryChange: (value: string) => void;
  categories: Category[];
  activeCategory: string | "all";
  onCategoryChange: (categoryId: string | "all") => void;
  sort: SortOption;
  onSortChange: (sort: SortOption) => void;
  resultCount: number;
};

export function ProductToolbar({
  query,
  onQueryChange,
  categories,
  activeCategory,
  onCategoryChange,
  sort,
  onSortChange,
  resultCount,
}: ProductToolbarProps) {
  return (
    <div className="product-toolbar">
      <div className="toolbar-row">
        <label className="search-field">
          <Search size={15} strokeWidth={1.6} />
          <input
            type="search"
            placeholder="Search jewellery..."
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            aria-label="Search products"
          />
        </label>
        <label className="sort-field">
          <span>Sort</span>
          <select value={sort} onChange={(event) => onSortChange(event.target.value as SortOption)}>
            <option value="featured">Featured</option>
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </label>
      </div>

      <div className="category-chips" role="tablist" aria-label="Filter by category">
        <button
          type="button"
          className={activeCategory === "all" ? "is-active" : ""}
          onClick={() => onCategoryChange("all")}
          role="tab"
          aria-selected={activeCategory === "all"}
        >
          All
        </button>
        {categories.map((category) => (
          <button
            type="button"
            key={category.id}
            className={activeCategory === category.id ? "is-active" : ""}
            onClick={() => onCategoryChange(category.id)}
            role="tab"
            aria-selected={activeCategory === category.id}
          >
            {category.name}
          </button>
        ))}
      </div>

      <p className="toolbar-result-count">
        {resultCount} {resultCount === 1 ? "piece" : "pieces"} found
      </p>
    </div>
  );
}
