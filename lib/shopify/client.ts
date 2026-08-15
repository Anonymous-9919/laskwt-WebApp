import type { Customer, Order, OrderItem } from "@/types";

export type ShopifyEnv = {
  shopDomain: string;
  adminToken: string;
  apiVersion: string;
};

export function getShopifyEnv(): ShopifyEnv | null {
  const shopDomain = process.env.SHOPIFY_SHOP;
  const adminToken = process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN;
  if (!shopDomain || !adminToken) return null;
  const cleaned = shopDomain.replace(/^https?:\/\//, "").replace(/\/$/, "");
  return {
    shopDomain: cleaned,
    adminToken,
    apiVersion: process.env.SHOPIFY_API_VERSION ?? "2024-04",
  };
}

export function hasShopifyConfig(): boolean {
  return getShopifyEnv() !== null;
}

function stripKwd(value: number): string {
  return value.toFixed(3);
}

function buildCustomerBody(customer: Customer | null) {
  if (!customer) return undefined;
  const parts = customer.full_name.trim().split(/\s+/);
  const first = parts[0] ?? "";
  const last = parts.length > 1 ? parts.slice(1).join(" ") : "";
  return {
    first_name: first,
    last_name: last,
    phone: customer.phone || undefined,
    email: customer.email || undefined,
  };
}

function buildLineItem(item: OrderItem) {
  const title =
    item.product_type === "dascha"
      ? "Dascha (دراعة)"
      : "Thobe (ثوب)";
  const styleNote = Object.entries(item.styles)
    .map(([kind, key]) => `${kind}: ${key}`)
    .join(", ");
  return {
    title,
    quantity: item.quantity,
    price: stripKwd(item.line_total),
    product_type: item.product_type,
    variant_title: styleNote || undefined,
  };
}

export type PushOrderResult = {
  shopifyOrderId: string;
  adminUrl: string;
};

export async function pushOrderToShopify(
  order: Order,
  customer: Customer | null
): Promise<PushOrderResult> {
  const env = getShopifyEnv();
  if (!env) {
    throw new Error("Shopify is not configured");
  }

  const body: Record<string, unknown> = {
    order: {
      idempotency_key: order.id,
      line_items: order.items.map(buildLineItem),
      financial_status: "paid",
      tags: ["laskwt", order.number],
      note: order.notes ?? undefined,
      metafields: [
        {
          namespace: "laskwt",
          key: "local_order_id",
          value: order.id,
          type: "single_line_text_field",
        },
        {
          namespace: "laskwt",
          key: "local_order_number",
          value: order.number,
          type: "single_line_text_field",
        },
      ],
    },
  };

  const orderBody = body.order as Record<string, unknown>;
  const customerBody = buildCustomerBody(customer);
  if (customerBody) {
    orderBody.customer = customerBody;
  }

  if (order.due_date) {
    orderBody.note = `${orderBody.note ? `${orderBody.note}\n` : ""}Due: ${order.due_date}`;
  }

  const url = `https://${env.shopDomain}/admin/api/${env.apiVersion}/orders.json`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "X-Shopify-Access-Token": env.adminToken,
      "Content-Type": "application/json",
      "X-Shopify-Idempotency-Key": order.id,
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(
      `Shopify API ${res.status}: ${text.slice(0, 400)}`
    );
  }

  let json: any;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`Shopify returned invalid JSON: ${text.slice(0, 200)}`);
  }

  const shopifyOrderId = json?.order?.id;
  if (!shopifyOrderId) {
    throw new Error(`Shopify did not return an order id: ${text.slice(0, 200)}`);
  }

  return {
    shopifyOrderId: String(shopifyOrderId),
    adminUrl: `https://${env.shopDomain}/admin/orders/${shopifyOrderId}`,
  };
}
