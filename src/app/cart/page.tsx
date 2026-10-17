import type { Metadata } from "next";
import { CartPageContent } from "@/components/cart/cart-page-content";

export const metadata: Metadata = {
  title: "Shopping Bag | NAVRANG CLOTHING",
  description: "Review your selected Indian fashion, cord sets, and attire in your NAVRANG CLOTHING shopping bag.",
};

export default function CartPage() {
  return <CartPageContent />;
}
