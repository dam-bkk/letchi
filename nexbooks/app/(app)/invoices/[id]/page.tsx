import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { MessageCircle, QrCode as QrIcon, Send } from "lucide-react";
import { db } from "@/lib/db";
import { formatMUR } from "@/lib/money";
import { issueAndFiscalise, recordPayment } from "@/lib/actions";
import { StatusBadge } from "@/components/status-badge";

function waLink(phone: string | null, text: string) {
  const digits = (phone ?? "").replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

export default async function InvoiceDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invoice = await db.invoice.findUnique({
    where: { id },
    include: { customer: true, lines: true, payments: true, fiscal: true },
  });
  if (!invoice) notFound();
  const company = await db.company.findFirst();

  const paid = invoice.payments.reduce((s, p) => s + p.amountCents, 0);
  const balance = invoice.totalCents - paid;
  const now = new Date();
  const displayStatus =
    invoice.status === "ISSUED" && invoice.dueDate < now ? "OVERDUE" : invoice.status;

  const qrDataUrl =
    invoice.fiscal?.status === "FISCALISED"
      ? await QRCode.toDataURL(invoice.fiscal.qrPayload, { margin: 1, width: 160 })
      : null;

  const amount = formatMUR(balance);
  const reminders = [
    {
      label: "EN",
      text: `Hello ${invoice.customer.name}, a friendly reminder from ${company?.name}: invoice ${invoice.number} (${amount}) is ${displayStatus === "OVERDUE" ? "overdue" : "awaiting payment"}. Thank you!`,
    },
    {
      label: "FR",
      text: `Bonjour ${invoice.customer.name}, petit rappel de ${company?.name} : la facture ${invoice.number} (${amount}) est ${displayStatus === "OVERDUE" ? "échue" : "en attente de paiement"}. Merci !`,
    },
    {
      label: "KR",
      text: `Bonzour ${invoice.customer.name}, enn ti rapel depi ${company?.name} : fakir ${invoice.number} (${amount}) ankor pou peye. Mersi boukou!`,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">{invoice.number}</h1>
          <StatusBadge status={displayStatus} />
          {invoice.type !== "INVOICE" ? (
            <span className="text-xs font-semibold" style={{ color: "var(--muted)" }}>
              {invoice.type === "CREDIT_NOTE" ? "Credit note" : "Debit note"}
              {invoice.relatedNumber ? ` · ref ${invoice.relatedNumber}` : ""}
            </span>
          ) : null}
        </div>
        {!invoice.fiscal ? (
          <form action={issueAndFiscalise.bind(null, invoice.id)}>
            <button type="submit" className="btn-primary">
              <Send size={15} /> Issue &amp; fiscalise (MRA)
            </button>
          </form>
        ) : null}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="card p-4 grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs font-semibold uppercase" style={{ color: "var(--muted)" }}>Billed to</p>
              <p className="font-semibold mt-1">{invoice.customer.name}</p>
              <p style={{ color: "var(--muted)" }}>
                {invoice.customer.address ?? ""} {invoice.customer.city ?? ""}
              </p>
              {invoice.customer.brn ? <p style={{ color: "var(--muted)" }}>BRN {invoice.customer.brn}</p> : null}
              {invoice.customer.vatNo ? <p style={{ color: "var(--muted)" }}>{invoice.customer.vatNo}</p> : null}
            </div>
            <div className="sm:text-right">
              <p style={{ color: "var(--muted)" }}>Issued {invoice.issueDate.toLocaleDateString("en-GB")}</p>
              <p style={{ color: "var(--muted)" }}>Due {invoice.dueDate.toLocaleDateString("en-GB")}</p>
              <p className="mt-2 text-lg font-bold">{formatMUR(invoice.totalCents)}</p>
              {balance > 0 && paid > 0 ? (
                <p className="text-xs" style={{ color: "var(--muted)" }}>Balance {formatMUR(balance)}</p>
              ) : null}
            </div>
          </div>

          <div className="card overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="th">Description</th>
                  <th className="th">Qty</th>
                  <th className="th">Unit price</th>
                  <th className="th">VAT</th>
                  <th className="th">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.lines.map((l) => (
                  <tr key={l.id}>
                    <td className="td">{l.description}</td>
                    <td className="td">{l.quantity} {l.unit}</td>
                    <td className="td">{formatMUR(l.unitPriceCents)}</td>
                    <td className="td">{l.vatRate}%</td>
                    <td className="td font-semibold">{formatMUR(l.totalCents)}</td>
                  </tr>
                ))}
                <tr>
                  <td className="td" colSpan={4} style={{ color: "var(--muted)" }}>Subtotal (excl. VAT)</td>
                  <td className="td font-semibold">{formatMUR(invoice.subtotalCents)}</td>
                </tr>
                <tr>
                  <td className="td" colSpan={4} style={{ color: "var(--muted)" }}>VAT</td>
                  <td className="td font-semibold">{formatMUR(invoice.vatCents)}</td>
                </tr>
                <tr>
                  <td className="td font-bold" colSpan={4}>Total MUR</td>
                  <td className="td font-bold">{formatMUR(invoice.totalCents)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="card p-4">
            <h2 className="text-sm font-semibold mb-3">Payments</h2>
            {invoice.payments.length ? (
              <ul className="text-sm flex flex-col gap-1 mb-3">
                {invoice.payments.map((p) => (
                  <li key={p.id} className="flex justify-between">
                    <span style={{ color: "var(--muted)" }}>
                      {p.paidAt.toLocaleDateString("en-GB")} · {p.method.replace("_", " ")}
                      {p.reference ? ` · ${p.reference}` : ""}
                    </span>
                    <span className="font-semibold">{formatMUR(p.amountCents)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm mb-3" style={{ color: "var(--muted)" }}>No payments recorded.</p>
            )}
            {balance > 0 && invoice.status !== "DRAFT" ? (
              <form action={recordPayment} className="grid sm:grid-cols-4 gap-2">
                <input type="hidden" name="invoiceId" value={invoice.id} />
                <input name="amount" className="input" placeholder={`Amount (Rs) — ${(balance / 100).toFixed(2)}`} />
                <select name="method" className="input" defaultValue="bank_transfer">
                  <option value="bank_transfer">Bank transfer</option>
                  <option value="mcb_juice">MCB Juice</option>
                  <option value="myt_money">my.t money</option>
                  <option value="card">Card</option>
                  <option value="cheque">Cheque</option>
                  <option value="cash">Cash</option>
                </select>
                <input name="reference" className="input" placeholder="Reference" />
                <button type="submit" className="btn-primary justify-center">Record payment</button>
              </form>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="card p-4">
            <h2 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <QrIcon size={15} /> MRA fiscalisation
            </h2>
            {invoice.fiscal ? (
              <div className="text-sm flex flex-col gap-2">
                <StatusBadge status={invoice.fiscal.status} />
                {qrDataUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={qrDataUrl} alt={`Fiscalisation QR for ${invoice.number}`} width={160} height={160} className="rounded" style={{ background: "#fff", padding: 4 }} />
                ) : null}
                {invoice.fiscal.irn ? (
                  <p className="text-xs break-all">
                    <span style={{ color: "var(--muted)" }}>IRN </span>
                    <span className="font-mono font-semibold">{invoice.fiscal.irn}</span>
                  </p>
                ) : null}
                <p className="text-xs" style={{ color: "var(--muted)" }}>
                  Submitted {invoice.fiscal.submittedAt.toLocaleString("en-GB")} · retained 5 years
                </p>
                <details>
                  <summary className="text-xs font-semibold cursor-pointer" style={{ color: "var(--primary)" }}>
                    View MRA JSON exchange
                  </summary>
                  <pre className="text-[10px] mt-2 p-2 rounded overflow-x-auto" style={{ background: "var(--bg)", maxHeight: 260, overflowY: "auto" }}>
{invoice.fiscal.requestJson}

{invoice.fiscal.responseJson}
                  </pre>
                </details>
              </div>
            ) : (
              <p className="text-sm" style={{ color: "var(--muted)" }}>
                Draft — not yet transmitted. Issuing will send the prescribed JSON to the
                IFP and return the IRN + QR code before the invoice reaches the customer.
              </p>
            )}
          </div>

          {balance > 0 && invoice.status !== "DRAFT" && invoice.customer.phone ? (
            <div className="card p-4">
              <h2 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <MessageCircle size={15} /> WhatsApp reminder
              </h2>
              <p className="text-xs mb-3" style={{ color: "var(--muted)" }}>
                One tap, in your customer&apos;s language:
              </p>
              <div className="flex gap-2">
                {reminders.map((r) => (
                  <a key={r.label} href={waLink(invoice.customer.phone, r.text)} target="_blank" rel="noopener noreferrer" className="btn-ghost">
                    {r.label === "KR" ? "Kreol" : r.label === "FR" ? "Français" : "English"}
                  </a>
                ))}
              </div>
            </div>
          ) : null}

          {invoice.notes ? (
            <div className="card p-4 text-sm">
              <h2 className="text-sm font-semibold mb-1">Notes</h2>
              <p style={{ color: "var(--muted)" }}>{invoice.notes}</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
