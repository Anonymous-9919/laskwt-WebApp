import { pdf } from "@react-pdf/renderer";
import type { Customer, Order } from "@/types";
import { InvoiceDocument, registerInvoiceFonts } from "./invoice-document";

export type InvoiceLang = "ar" | "en";

export async function generateInvoiceBlob(
  order: Order,
  customer: Customer | null,
  lang: InvoiceLang
): Promise<Blob> {
  await registerInvoiceFonts();
  const doc = pdf(
    <InvoiceDocument order={order} customer={customer} lang={lang} />
  );
  return doc.toBlob();
}

export async function downloadInvoice(
  order: Order,
  customer: Customer | null,
  lang: InvoiceLang
): Promise<void> {
  const blob = await generateInvoiceBlob(order, customer, lang);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${order.number}-invoice.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
