import { NextRequest, NextResponse } from "next/server";
import { getRepository } from "@/lib/data/repository";
import {
  getShopifyEnv,
  hasShopifyConfig,
  pushOrderToShopify,
} from "@/lib/shopify/client";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: { orderId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { orderId } = body;
  if (!orderId) {
    return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
  }

  const repo = await getRepository();
  const order = await repo.getOrder(orderId);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // Idempotency pre-check: already synced.
  if (order.shopify_sync_status === "synced" && order.shopify_order_id) {
    const env = getShopifyEnv();
    return NextResponse.json({
      alreadySynced: true,
      shopifyOrderId: order.shopify_order_id,
      adminUrl: env
        ? `https://${env.shopDomain}/admin/orders/${order.shopify_order_id}`
        : undefined,
    });
  }

  if (!hasShopifyConfig()) {
    return NextResponse.json({ notConfigured: true });
  }

  const customer = order.customer_id
    ? await repo.getCustomer(order.customer_id)
    : null;

  try {
    const result = await pushOrderToShopify(order, customer);
    await repo.setShopifySync(order.id, {
      status: "synced",
      shopify_order_id: result.shopifyOrderId,
    });
    return NextResponse.json({
      synced: true,
      shopifyOrderId: result.shopifyOrderId,
      adminUrl: result.adminUrl,
    });
  } catch (err) {
    await repo.setShopifySync(order.id, { status: "failed" });
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
