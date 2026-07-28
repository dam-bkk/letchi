// MRA Electronic Billing System (EBS) — payload builder + IFP simulator.
//
// Field names follow the published MRA e-invoicing JSON structure (invoiceIdentifier,
// seller/buyer blocks, itemList, totals). In demo mode we POST to the built-in
// simulator below instead of the real Invoice Fiscalisation Platform; the real
// integration additionally requires EBS registration, signing/encryption and an
// MRA developer account (needs a locally registered BRN).
import { createHash } from "node:crypto";

export type MraParty = {
  name: string;
  brn: string | null;
  vatNo: string | null;
  address: string | null;
};

export type MraLine = {
  itemNo: number;
  itemDesc: string;
  nature: "GOODS" | "SERVICES";
  quantity: number;
  unitPrice: number; // rupees
  taxCode: "TC01" | "TC02" | "TC03"; // TC01 = VAT 15%, TC02 = zero-rated, TC03 = exempt
  amtWoVat: number;
  vatAmt: number;
  totalPrice: number;
};

// Field set follows the MRA "Data Structure of an e-Invoice" v1.0 (June 2023):
// invoiceCounter (tamper-resistant, non-resettable), previousNoteHash (hash chain),
// personType VATR/NVTR, transactionType B2B/B2G/B2C, invoiceTypeDesc STD/PRF/TRN/CRN/DRN,
// salesTransactions CASH/CREDIT, seller/buyer blocks, itemList with taxCode TC01/02/03.
export type MraInvoicePayload = {
  invoiceCounter: number;
  transactionType: "B2B" | "B2G" | "B2C";
  personType: "VATR" | "NVTR";
  invoiceTypeDesc: "STD" | "PRF" | "TRN" | "CRN" | "DRN";
  salesTransactions: "CASH" | "CREDIT";
  currency: "MUR";
  invoiceIdentifier: string;
  invoiceRefIdentifier?: string; // original invoice for CRN/DRN
  previousNoteHash: string; // hash chain across successive documents
  dateTimeInvoiceIssued: string; // yyyyMMdd HH:mm:ss
  seller: MraParty & { tradeName: string };
  buyer: MraParty & { buyerType: "VATR" | "NVTR" };
  itemList: MraLine[];
  totalVatAmount: number;
  totalAmtWoVatCur: number;
  totalAmtWoVatMur: number;
  totalAmtPaid: number;
  invoiceTotal: number;
};

// Mirrors the real Invoice Transmission API response: per-invoice uuid (the IRN
// role) + QR content + status. The real API returns qrCode as a Base64 PNG; the
// simulator returns the QR *content string* and the UI renders the PNG locally.
export type IfpResponse =
  | {
      status: "SUCCESS";
      irn: string; // uuid in the real API
      qrString: string;
      receivedAt: string;
      environment: "SIMULATED";
      message: string;
    }
  | { status: "REJECTED"; errors: string[]; receivedAt: string; environment: "SIMULATED" };

const r2 = (n: number) => Math.round(n * 100) / 100;

export function buildMraPayload(args: {
  counter: number;
  number: string;
  type: string; // INVOICE | CREDIT_NOTE | DEBIT_NOTE
  issueDate: Date;
  seller: MraParty & { tradeName: string };
  buyer: MraParty;
  relatedNumber?: string | null;
  previousNoteHash?: string;
  amountPaid?: number; // rupees
  lines: { description: string; quantity: number; unitPriceCents: number; vatRate: number }[];
}): MraInvoicePayload {
  const itemList: MraLine[] = args.lines.map((l, i) => {
    const amtWoVat = r2((l.quantity * l.unitPriceCents) / 100);
    const vatAmt = r2((amtWoVat * l.vatRate) / 100);
    return {
      itemNo: i + 1,
      itemDesc: l.description,
      nature: /service|consult|rental|storage|delivery/i.test(l.description)
        ? "SERVICES"
        : "GOODS",
      quantity: l.quantity,
      unitPrice: r2(l.unitPriceCents / 100),
      taxCode: l.vatRate > 0 ? "TC01" : "TC02",
      amtWoVat,
      vatAmt,
      totalPrice: r2(amtWoVat + vatAmt),
    };
  });
  const totalAmtWoVat = r2(itemList.reduce((s, l) => s + l.amtWoVat, 0));
  const totalVat = r2(itemList.reduce((s, l) => s + l.vatAmt, 0));
  const d = args.issueDate;
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    invoiceCounter: args.counter,
    transactionType: args.buyer.brn ? "B2B" : "B2C",
    personType: "VATR",
    invoiceTypeDesc:
      args.type === "CREDIT_NOTE" ? "CRN" : args.type === "DEBIT_NOTE" ? "DRN" : "STD",
    salesTransactions: (args.amountPaid ?? 0) >= r2(totalAmtWoVat + totalVat) ? "CASH" : "CREDIT",
    currency: "MUR",
    invoiceIdentifier: args.number,
    ...(args.relatedNumber ? { invoiceRefIdentifier: args.relatedNumber } : {}),
    previousNoteHash: args.previousNoteHash ?? "0",
    dateTimeInvoiceIssued: `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())} ${pad(
      d.getHours(),
    )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`,
    seller: args.seller,
    buyer: { ...args.buyer, buyerType: args.buyer.vatNo ? "VATR" : "NVTR" },
    itemList,
    totalVatAmount: totalVat,
    totalAmtWoVatCur: totalAmtWoVat,
    totalAmtWoVatMur: totalAmtWoVat,
    totalAmtPaid: r2(args.amountPaid ?? 0),
    invoiceTotal: r2(totalAmtWoVat + totalVat),
  };
}

// Hash of a fiscalised document, chained into the NEXT document's previousNoteHash
// (per MRA spec: previous invoice's date-time + amount + BRN + invoice number).
export function documentHash(p: MraInvoicePayload): string {
  return createHash("sha256")
    .update(`${p.dateTimeInvoiceIssued}|${p.invoiceTotal}|${p.seller.brn}|${p.invoiceIdentifier}`)
    .digest("hex");
}

// ---- IFP simulator (stands in for the MRA platform in demo mode) ----

export function simulateIfp(payload: MraInvoicePayload): IfpResponse {
  const receivedAt = new Date().toISOString();
  const errors: string[] = [];

  if (!payload.seller?.brn) errors.push("E101: seller BRN is required");
  else if (!/^[A-Z]\d{8}$/.test(payload.seller.brn))
    errors.push("E102: seller BRN format invalid (expected letter + 8 digits)");
  if (!payload.seller?.vatNo) errors.push("E103: seller VAT registration number is required");
  if (!payload.invoiceIdentifier) errors.push("E110: invoiceIdentifier is required");
  if (!payload.itemList?.length) errors.push("E120: itemList must contain at least one item");
  if (
    (payload.invoiceTypeDesc === "CRN" || payload.invoiceTypeDesc === "DRN") &&
    !payload.invoiceRefIdentifier
  )
    errors.push("E115: credit/debit note requires invoiceRefIdentifier");

  const sumVat = r2(payload.itemList.reduce((s, l) => s + l.vatAmt, 0));
  if (Math.abs(sumVat - payload.totalVatAmount) > 0.01)
    errors.push("E130: totalVatAmount does not match sum of item VAT");
  const sumTotal = r2(payload.itemList.reduce((s, l) => s + l.totalPrice, 0));
  if (Math.abs(sumTotal - payload.invoiceTotal) > 0.01)
    errors.push("E131: invoiceTotal does not match sum of item totals");

  if (errors.length)
    return { status: "REJECTED", errors, receivedAt, environment: "SIMULATED" };

  const hash = createHash("sha256")
    .update(JSON.stringify(payload))
    .digest("hex")
    .slice(0, 12)
    .toUpperCase();
  const irn = `MRA${payload.seller.brn}${payload.invoiceCounter
    .toString()
    .padStart(6, "0")}${hash.slice(0, 6)}`;
  // QR payload mirrors what verification apps read: who, what, when, how much, proof.
  const qrString = JSON.stringify({
    irn,
    sn: payload.seller.name,
    sbrn: payload.seller.brn,
    inv: payload.invoiceIdentifier,
    dt: payload.dateTimeInvoiceIssued,
    amt: payload.invoiceTotal,
    vat: payload.totalVatAmount,
    h: hash,
  });
  return {
    status: "SUCCESS",
    irn,
    qrString,
    receivedAt,
    environment: "SIMULATED",
    message: "Invoice fiscalised (SIMULATED — not transmitted to the MRA)",
  };
}
