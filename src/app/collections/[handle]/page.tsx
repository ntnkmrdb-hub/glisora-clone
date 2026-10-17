import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCollectionByHandle } from "@/lib/shopify/products";
import { CollectionView } from "@/components/products/collection-view";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ handle: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const { collection } = await getCollectionByHandle(handle);

  if (!collection) {
    return {
      title: "Collection Not Found | NAVRANG CLOTHING",
    };
  }

  return {
    title: `${collection.title} | NAVRANG CLOTHING`,
    description:
      collection.description ||
      `Explore NAVRANG CLOTHING's exclusive handcrafted ${collection.title} collection in comfortable fabrics, elegant silhouettes, and vibrant styles.`,
    openGraph: {
      title: `${collection.title} | NAVRANG CLOTHING`,
      description: collection.description,
      images: collection.image ? [{ url: collection.image.url }] : undefined,
    },
  };
}

export default async function CollectionPage({ params }: Props) {
  const { handle } = await params;
  const { collection, products } = await getCollectionByHandle(handle);

  if (!collection) {
    notFound();
  }

  const { products: allProducts } = await getCollectionByHandle("all");

  return (
    <CollectionView
      collection={collection}
      initialProducts={products}
      allProducts={allProducts}
    />
  );
}
