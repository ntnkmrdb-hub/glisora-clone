import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { isRequestAuthorized } from "@/lib/admin/auth";
import { isShopifyAdminConfigured } from "@/lib/validation/env";
import {
  adminShopifyFetch,
  ADMIN_STAGED_UPLOADS_CREATE_MUTATION,
  ADMIN_FILE_CREATE_MUTATION,
} from "@/lib/shopify/admin-client";

export const maxDuration = 60;

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB limit

export async function POST(req: Request) {
  if (!isRequestAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const altText = (formData.get("altText") as string) || "";

    if (!file) {
      return NextResponse.json({ error: "No image file provided." }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error: `Unsupported image format (${file.type}). Allowed formats: JPEG, PNG, WebP, AVIF, GIF.`,
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        {
          error: `File size exceeds the 10MB limit (uploaded: ${(file.size / (1024 * 1024)).toFixed(2)} MB).`,
        },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const sanitizedBase = file.name
      .toLowerCase()
      .replace(/[^a-z0-9.]+/g, "-")
      .replace(/^-|-$/g, "");
    const uniqueFilename = `navrang-${Date.now()}-${sanitizedBase}`;

    // 1. If Shopify Admin API is configured, use official staged uploads & files API
    if (isShopifyAdminConfigured()) {
      try {
        const stagedRes = await adminShopifyFetch<{
          stagedUploadsCreate: {
            stagedTargets: Array<{
              url: string;
              resourceUrl: string;
              parameters: Array<{ name: string; value: string }>;
            }>;
            userErrors: Array<{ field: string; message: string }>;
          };
        }>(ADMIN_STAGED_UPLOADS_CREATE_MUTATION, {
          input: [
            {
              resource: "IMAGE",
              filename: uniqueFilename,
              mimeType: file.type,
              fileSize: file.size.toString(),
              httpMethod: "POST",
            },
          ],
        });

        const target = stagedRes.stagedUploadsCreate?.stagedTargets?.[0];
        if (target) {
          // Upload to staged URL
          const uploadFormData = new FormData();
          target.parameters.forEach((param) => {
            uploadFormData.append(param.name, param.value);
          });
          const blob = new Blob([buffer], { type: file.type });
          uploadFormData.append("file", blob, uniqueFilename);

          const uploadRes = await fetch(target.url, {
            method: "POST",
            body: uploadFormData,
          });

          if (uploadRes.ok) {
            // Create file in Shopify
            const fileCreateRes = await adminShopifyFetch<{
              fileCreate: {
                files: Array<{
                  id: string;
                  fileStatus: string;
                  alt?: string;
                  image?: { url: string; width: number; height: number };
                }>;
                userErrors: Array<{ field: string; message: string }>;
              };
            }>(ADMIN_FILE_CREATE_MUTATION, {
              files: [
                {
                  originalSource: target.resourceUrl,
                  contentType: "IMAGE",
                  alt: altText || sanitizedBase,
                },
              ],
            });

            const createdFile = fileCreateRes.fileCreate?.files?.[0];
            const cdnUrl = createdFile?.image?.url || target.resourceUrl;

            return NextResponse.json({
              success: true,
              url: cdnUrl,
              altText: altText || sanitizedBase,
              width: createdFile?.image?.width || 1200,
              height: createdFile?.image?.height || 1600,
              storage: "shopify_cdn",
            });
          }
        }
      } catch (err) {
        console.warn("Shopify Admin staged upload failed, using local storage fallback:", err);
      }
    }

    // 2. Local Storage Fallback
    const uploadDir = path.join(process.cwd(), "public", "uploads", "products");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, uniqueFilename);
    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/products/${uniqueFilename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      altText: altText || sanitizedBase.replace(/\.[^/.]+$/, ""),
      width: 1200,
      height: 1600,
      storage: "local",
    });
  } catch (error) {
    console.error("[Image Upload Error]:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to process image upload" },
      { status: 500 }
    );
  }
}
