import { calculateInvoiceTotal } from "./invoiceTotal.js";
import { syncPaymentStatusesForEvent } from "./invoicePaymentAllocation.js";

export function commentAdjustmentAffectsInvoiceTotal(adjustmentType) {
  return adjustmentType === "rate_flat" || adjustmentType === "rate_percent" || adjustmentType === "total";
}

export async function resolveEventIdForComment(db, invoiceId, bookingId) {
  if (invoiceId != null) {
    const r = await db.oneOrNone(`SELECT event_id FROM invoices WHERE id = $1`, [invoiceId]);
    return r?.event_id ?? null;
  }
  if (bookingId != null) {
    const r = await db.oneOrNone(`SELECT event_id FROM bookings WHERE id = $1`, [bookingId]);
    return r?.event_id ?? null;
  }
  return null;
}

export async function syncStoredInvoiceTotal(db, invoiceId) {
  const total = await calculateInvoiceTotal(db, invoiceId);
  await db.none(`UPDATE invoices SET total_amount = $1 WHERE id = $2`, [total, invoiceId]);
  return total;
}

export async function syncStoredInvoiceTotalsForEvent(db, eventId) {
  const rows = await db.query(
    `SELECT id FROM invoices WHERE event_id = $1 ORDER BY start_date ASC, id ASC`,
    [eventId]
  );
  for (const r of rows) {
    await syncStoredInvoiceTotal(db, r.id);
  }
}

export async function resyncInvoiceTotalsAndPaymentStatusesForEvent(db, eventId) {
  await syncStoredInvoiceTotalsForEvent(db, eventId);
  await syncPaymentStatusesForEvent(db, eventId);
}
