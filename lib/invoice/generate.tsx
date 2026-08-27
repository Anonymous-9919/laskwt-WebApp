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

export async function printInvoice(
  order: Order,
  customer: Customer | null,
  lang: InvoiceLang
): Promise<void> {
  const blob = await generateInvoiceBlob(order, customer, lang);
  const url = URL.createObjectURL(blob);
  const printWindow = window.open(url, "_blank");
  if (!printWindow) {
    URL.revokeObjectURL(url);
    throw new Error("Unable to open invoice for printing");
  }
  printWindow.addEventListener("load", () => printWindow.print(), { once: true });
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export async function shareInvoiceViaWhatsApp(
  order: Order,
  customer: Customer | null,
  lang: InvoiceLang
): Promise<"shared" | "fallback"> {
  const blob = await generateInvoiceBlob(order, customer, lang);
  const fileName = `${order.number}-invoice.pdf`;
  const file = new File([blob], fileName, { type: "application/pdf" });

  const nav = navigator as Navigator & {
    canShare?: (data: { files: File[] }) => boolean;
  };

  if (nav.share && typeof nav.canShare === "function" && nav.canShare({ files: [file] })) {
    try {
      await nav.share({
        files: [file],
        title: `${order.number} — Invoice`,
        text: `Invoice ${order.number}${customer ? ` · ${customer.full_name}` : ""}`,
      });
      return "shared";
    } catch (err) {
      if ((err as Error).name === "AbortError") return "fallback";
    }
  }

  const url = `/api/pdf?order=${encodeURIComponent(order.id)}&lang=${lang}`;
  const phone = (customer?.phone ?? "").replace(/\D/g, "");
  const message = encodeURIComponent(`Invoice ${order.number}: ${window.location.origin}${url}`);
  window.open(`https://wa.me/${phone}?text=${message}`, "_blank", "noopener");
  return "fallback";
}
