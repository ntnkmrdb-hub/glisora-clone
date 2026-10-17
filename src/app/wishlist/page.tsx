import type { Metadata } from "next";
import { WishlistPageContent } from "@/components/wishlist/wishlist-page-content";

export const metadata: Metadata = {
  title: "Your Wishlist | NAVRANG CLOTHING",
  description: "View and manage your saved Indian luxury garments, Cord Sets, Night Suits, and 3-Piece Sets at NAVRANG CLOTHING.",
};

export default function WishlistPage() {
  return <WishlistPageContent />;
}
