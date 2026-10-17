import { env, isShopifyAdminConfigured } from "@/lib/validation/env";

export interface AdminGraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string; locations?: unknown; path?: string[] }>;
  extensions?: {
    cost?: {
      requestedQueryCost: number;
      actualQueryCost: number;
      throttleStatus: {
        maximumAvailable: number;
        currentlyAvailable: number;
        restoreRate: number;
      };
    };
  };
}

/**
 * Execute an authenticated GraphQL mutation or query against the Shopify Admin API.
 * STRICTLY SERVER-SIDE.
 */
export async function adminShopifyFetch<T>(
  query: string,
  variables: Record<string, unknown> = {},
  retries = 2
): Promise<T> {
  if (!isShopifyAdminConfigured()) {
    throw new Error("SHOPIFY_ADMIN_NOT_CONFIGURED");
  }

  const endpoint = `https://${env.SHOPIFY_STORE_DOMAIN}/admin/api/${env.SHOPIFY_ADMIN_API_VERSION}/graphql.json`;

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": env.SHOPIFY_ADMIN_ACCESS_TOKEN,
      },
      body: JSON.stringify({ query, variables }),
      cache: "no-store",
    });

    if (res.status === 429 && retries > 0) {
      const retryAfter = parseFloat(res.headers.get("Retry-After") || "1");
      await new Promise((r) => setTimeout(r, retryAfter * 1000));
      return adminShopifyFetch<T>(query, variables, retries - 1);
    }

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Shopify Admin API HTTP error ${res.status}: ${text}`);
    }

    const json: AdminGraphQLResponse<T> = await res.json();

    if (json.errors && json.errors.length > 0) {
      const msg = json.errors.map((e) => e.message).join("; ");
      throw new Error(`Shopify Admin GraphQL error: ${msg}`);
    }

    if (!json.data) {
      throw new Error("Shopify Admin API returned no data payload");
    }

    return json.data;
  } catch (error) {
    if (retries > 0 && !(error instanceof Error && error.message === "SHOPIFY_ADMIN_NOT_CONFIGURED")) {
      await new Promise((r) => setTimeout(r, 600));
      return adminShopifyFetch<T>(query, variables, retries - 1);
    }
    throw error;
  }
}

// -----------------------------------------------------------------------------
// Admin GraphQL Mutations
// -----------------------------------------------------------------------------

export const ADMIN_PRODUCT_CREATE_MUTATION = /* GraphQL */ `
  mutation ProductCreate($input: ProductInput!, $media: [CreateMediaInput!]) {
    productCreate(input: $input, media: $media) {
      product {
        id
        handle
        title
        status
        totalVariants
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const ADMIN_PRODUCT_UPDATE_MUTATION = /* GraphQL */ `
  mutation ProductUpdate($input: ProductInput!) {
    productUpdate(input: $input) {
      product {
        id
        handle
        title
        descriptionHtml
        status
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const ADMIN_PRODUCT_DELETE_MUTATION = /* GraphQL */ `
  mutation ProductDelete($input: ProductDeleteInput!) {
    productDelete(input: $input) {
      deletedProductId
      userErrors {
        field
        message
      }
    }
  }
`;

export const ADMIN_PRODUCT_MEDIA_CREATE_MUTATION = /* GraphQL */ `
  mutation ProductCreateMedia($productId: ID!, $media: [CreateMediaInput!]!) {
    productCreateMedia(productId: $productId, media: $media) {
      media {
        id
        alt
        status
        mediaContentType
      }
      mediaUserErrors {
        field
        message
      }
    }
  }
`;

export const ADMIN_PRODUCT_MEDIA_DELETE_MUTATION = /* GraphQL */ `
  mutation ProductDeleteMedia($productId: ID!, $mediaIds: [ID!]!) {
    productDeleteMedia(productId: $productId, mediaIds: $mediaIds) {
      deletedMediaIds
      mediaUserErrors {
        field
        message
      }
    }
  }
`;

export const ADMIN_PRODUCT_MEDIA_REORDER_MUTATION = /* GraphQL */ `
  mutation ProductReorderMedia($productId: ID!, $moves: [MoveInput!]!) {
    productReorderMedia(productId: $productId, moves: $moves) {
      job {
        id
        done
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const ADMIN_STAGED_UPLOADS_CREATE_MUTATION = /* GraphQL */ `
  mutation StagedUploadsCreate($input: [StagedUploadInput!]!) {
    stagedUploadsCreate(input: $input) {
      stagedTargets {
        url
        resourceUrl
        parameters {
          name
          value
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const ADMIN_FILE_CREATE_MUTATION = /* GraphQL */ `
  mutation FileCreate($files: [FileCreateInput!]!) {
    fileCreate(files: $files) {
      files {
        id
        fileStatus
        alt
        ... on MediaImage {
          image {
            url
            width
            height
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const ADMIN_DISCOUNT_AUTOMATIC_BASIC_CREATE = /* GraphQL */ `
  mutation DiscountAutomaticBasicCreate($automaticBasicDiscount: DiscountAutomaticBasicInput!) {
    discountAutomaticBasicCreate(automaticBasicDiscount: $automaticBasicDiscount) {
      automaticDiscountNode {
        id
        automaticDiscount {
          ... on DiscountAutomaticBasic {
            title
            status
            startsAt
            endsAt
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;
