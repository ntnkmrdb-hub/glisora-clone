import type { Metadata } from "next";
import { searchProducts } from "@/lib/shopify/products";
import { SearchView } from "@/components/products/search-view";

export const metadata: Metadata = {
  title: "Search Our Luxury Collections | NAVRANG CLOTHING",
  description: "Search NAVRANG CLOTHING's luxury Indian fashion collection of Cord Sets, Night Suits, and 3-Piece Sets.",
};

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const initialProducts = await searchProducts(q || "");

  return <SearchView initialProducts={initialProducts} initialQuery={q || ""} />;
}
