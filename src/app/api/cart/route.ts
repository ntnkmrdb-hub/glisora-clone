import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createCart, addToCart, updateCartLines, removeFromCart, getCart } from "@/lib/shopify/cart";

const cartActionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("create"),
    lines: z.array(z.object({ merchandiseId: z.string(), quantity: z.number().int().positive() })).optional(),
  }),
  z.object({
    action: z.literal("add"),
    cartId: z.string().min(1),
    lines: z.array(z.object({ merchandiseId: z.string(), quantity: z.number().int().positive() })),
  }),
  z.object({
    action: z.literal("update"),
    cartId: z.string().min(1),
    lines: z.array(z.object({ id: z.string(), quantity: z.number().int().nonnegative() })),
  }),
  z.object({
    action: z.literal("remove"),
    cartId: z.string().min(1),
    lineIds: z.array(z.string().min(1)),
  }),
]);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const cartId = searchParams.get("cartId");

  if (!cartId) {
    return NextResponse.json({ error: "Missing cartId" }, { status: 400 });
  }

  try {
    const cart = await getCart(cartId);
    return NextResponse.json({ cart });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || "Failed to fetch cart" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = cartActionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request payload", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const data = parsed.data;

    if (data.action === "create") {
      const cart = await createCart(data.lines || []);
      return NextResponse.json({ cart });
    }

    if (data.action === "add") {
      const cart = await addToCart(data.cartId, data.lines);
      return NextResponse.json({ cart });
    }

    if (data.action === "update") {
      const cart = await updateCartLines(data.cartId, data.lines);
      return NextResponse.json({ cart });
    }

    if (data.action === "remove") {
      const cart = await removeFromCart(data.cartId, data.lineIds);
      return NextResponse.json({ cart });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || "Cart operation failed" },
      { status: 500 }
    );
  }
}
