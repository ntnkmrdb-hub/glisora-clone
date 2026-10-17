export * from "./shopify";

export interface NavItem {
  label: string;
  href: string;
  isSpecial?: boolean;
}

export interface BreadcrumbItem {
  label: string;
  href: string;
}

export interface FilterState {
  category?: string;
  size?: string;
  color?: string;
  priceMin?: number;
  priceMax?: number;
  inStockOnly?: boolean;
  sortBy?: "featured" | "price-asc" | "price-desc" | "newest";
  searchQuery?: string;
}
