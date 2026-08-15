import { renderToBuffer } from "@react-pdf/renderer";
import { NextRequest } from "next/server";
import { getRepository } from "@/lib/data/repository";
import {
  InvoiceDocument,
  registerInvoiceFonts,
} from "@/lib/invoice/invoice-document";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get("order");
  if (!orderId) {
    return new Response("Missing order id", { status: 400 });
  }

  const lang = req.nextUrl.searchParams.get("lang") === "en" ? "en" : "ar";

  const repo = await getRepository();
  const order = await repo.getOrder(orderId);
  if (!order) {
    return new Response("Order not found", { status: 404 });
  }
  const customer = order.customer_id
    ? await repo.getCustomer(order.customer_id)
    : null;

  try {
    await registerInvoiceFonts();
    const buffer = await renderToBuffer(
      <InvoiceDocument order={order} customer={customer} lang={lang} />
    );
    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${order.number}-invoice.pdf"`,
      },
    });
  } catch (err) {
    console.error("PDF render failed", err);
    if (err instanceof Error) {
      console.error((err.stack ?? "").split("\n").slice(0, 20).join("\n"));
    }
    return new Response("PDF generation failed", { status: 500 });
  }
}
