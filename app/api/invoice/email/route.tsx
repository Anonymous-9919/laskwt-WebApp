import { renderToBuffer } from "@react-pdf/renderer";
import { NextRequest, NextResponse } from "next/server";
import { getRepository } from "@/lib/data/repository";
import { InvoiceDocument, registerInvoiceFonts } from "@/lib/invoice/invoice-document";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const from = process.env.INVOICE_FROM_EMAIL;
  if (!resendApiKey || !from) {
    return NextResponse.json({ error: "Invoice email is not configured" }, { status: 503 });
  }

  const body = await req.json().catch(() => null);
  const orderId = body?.orderId;
  const lang = body?.lang === "ar" ? "ar" : "en";
  if (typeof orderId !== "string") {
    return NextResponse.json({ error: "Missing order id" }, { status: 400 });
  }

  const repo = await getRepository();
  const order = await repo.getOrder(orderId);
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const customer = await repo.getCustomer(order.customer_id);
  if (!customer?.email) {
    return NextResponse.json({ error: "Customer does not have an email address" }, { status: 400 });
  }

  try {
    const baseUrl = req.nextUrl.origin;
    await registerInvoiceFonts(baseUrl);
    const pdf = await renderToBuffer(
      <InvoiceDocument order={order} customer={customer} lang={lang} baseUrl={baseUrl} />
    );
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [customer.email],
        subject: `${order.number} - Invoice`,
        text: `Hello ${customer.full_name},\n\nYour invoice ${order.number} is attached.`,
        attachments: [{ filename: `${order.number}-invoice.pdf`, content: Buffer.from(pdf).toString("base64") }],
      }),
    });
    if (!response.ok) {
      console.error("Resend invoice email failed", await response.text());
      return NextResponse.json({ error: "Unable to send invoice email" }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Invoice email failed", err);
    return NextResponse.json({ error: "Unable to send invoice email" }, { status: 500 });
  }
}
