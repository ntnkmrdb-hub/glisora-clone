import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { isRequestAuthorized } from "@/lib/admin/auth";

export async function GET(req: Request) {
  if (!isRequestAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");

  const fileName =
    type === "master_100"
      ? "navrang_clothing_100_products_master_editable.csv"
      : "navrang_clothing_100_products_shopify_import.csv";

  const filePath = path.join(/*turbopackIgnore: true*/ process.cwd(), fileName);

  try {
    if (fs.existsSync(filePath)) {
      const csvText = fs.readFileSync(filePath, "utf8");
      return NextResponse.json({ success: true, fileName, csvText });
    } else {
      return NextResponse.json(
        { error: `File ${fileName} not found on server.` },
        { status: 404 }
      );
    }
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
