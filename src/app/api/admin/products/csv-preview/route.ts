import { NextResponse } from "next/server";
import { isRequestAuthorized } from "@/lib/admin/auth";
import { parseCsvString, parseAndGroupProducts } from "@/lib/csv/parser";
import { validateParsedProducts } from "@/lib/csv/validator";
import { getDynamicProducts } from "@/lib/shopify/dynamic-store";

export const maxDuration = 60; // Allow sufficient time for 100+ items

export async function POST(req: Request) {
  if (!isRequestAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    let csvText = "";

    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json({ error: "No CSV file uploaded" }, { status: 400 });
      }

      // Check file size (15MB limit)
      if (file.size > 15 * 1024 * 1024) {
        return NextResponse.json(
          { error: "File exceeds 15MB size limit. Please upload a smaller file." },
          { status: 400 }
        );
      }

      csvText = await file.text();
    } else {
      const body = await req.json().catch(() => ({}));
      if (Array.isArray(body.csvText)) {
        csvText = body.csvText.join("\n");
      } else if (typeof body.csvText === "string") {
        csvText = body.csvText;
      } else {
        csvText = String(body.csvText || "");
      }
    }

    if (!csvText || csvText.trim().length === 0) {
      return NextResponse.json(
        { error: "CSV content is empty or unreadable" },
        { status: 400 }
      );
    }

    const rawRows = parseCsvString(csvText);
    if (rawRows.length === 0) {
      return NextResponse.json(
        { error: "No valid rows could be parsed from the provided CSV file." },
        { status: 400 }
      );
    }

    const parsedResults = parseAndGroupProducts(rawRows);
    const existingProducts = getDynamicProducts();
    const report = validateParsedProducts(parsedResults, existingProducts);

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (error) {
    console.error("[CSV Preview Error]:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to parse and validate CSV file" },
      { status: 500 }
    );
  }
}
