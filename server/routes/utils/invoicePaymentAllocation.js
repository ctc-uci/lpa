/**
 * Event-scoped payment rollover (credit-style pool).
 *
 * Source of truth for cash remains `comments` rows with adjustment_type = 'paid'
 * (each row is tied to one invoice_id where the payment was recorded).
 *
 * Allocation rules:
 * - Pool: sum of all paid adjustment_values on every invoice for the same event_id.
 * - Billing order: invoices sorted by start_date ascending, then id ascending.
 * - Greedy allocation (partial amounts allowed): walk in billing order; for each invoice,
 *   allocated = min(remaining_pool, invoice_total). Decrement the pool. This applies
 *   pooled cash to the oldest periods first.
 * - Forward rollover: surplus on earlier periods (after they are fully covered) stays in
 *   the pool and covers later invoices in order.
 * - Backward / "pay later invoice first": those payments join the same pool; because
 *   allocation always serves older invoices first, money recorded on a later invoice
 *   can satisfy earlier unpaid invoices without duplicating payment rows.
 * - No cross-event leakage: only invoices sharing event_id are included.
 *
 * Effective "paid toward" an invoice for UI and payment_status is `allocated[id]`, not
 * the raw sum of payments on that invoice_id alone.
 */


/**
 * @param {Array<{ id: number, start_date?: string }>} invoicesOrdered
 * @param {Record<number, number>} rawPaidById
 * @param {Record<number, number>} totalById
 */
export function computeRolledAllocations(invoicesOrdered, rawPaidById, totalById) {
  const allocatedById = {};
  let pool = 0;
  for (const inv of invoicesOrdered) {
    pool += Number(rawPaidById[inv.id]) || 0;
  }
  for (const inv of invoicesOrdered) {
    const tid = inv.id;
    const total = Number(totalById[tid]) || 0;
    const alloc = Math.min(Math.max(pool, 0), total);
    allocatedById[tid] = alloc;
    pool -= alloc;
  }
  return { allocatedById, poolRemainder: pool };
}

export function paymentStatusFromAllocated(allocated, total) {
  const a = Number(allocated) || 0;
  const t = Number(total) || 0;
  if (t <= 0) {
    return a > 0 ? "full" : "none";
  }
  if (a >= t) return "full";
  if (a > 0) return "partial";
  return "none";
}

export async function loadEventAllocationMaps(db, eventId) {
  const invoices = await db.query(
    `SELECT id, event_id, start_date, total_amount FROM invoices
     WHERE event_id = $1
     ORDER BY start_date ASC, id ASC`,
    [eventId]
  );

  if (!invoices.length) {
    return { invoices: [], rawPaidById: {}, totalById: {}, allocatedById: {} };
  }

  const ids = invoices.map((i) => i.id);

  const paidRows = await db.query(
    `SELECT invoice_id, COALESCE(SUM(adjustment_value), 0) AS sum
     FROM comments
     WHERE adjustment_type = 'paid' AND invoice_id = ANY($1::int[])
     GROUP BY invoice_id`,
    [ids]
  );

  const rawPaidById = {};
  for (const id of ids) {
    rawPaidById[id] = 0;
  }
  for (const row of paidRows) {
    rawPaidById[row.invoice_id] = Number(row.sum) || 0;
  }

  const totalById = {};
  for (const inv of invoices) {
    totalById[inv.id] = Number(inv.total_amount) || 0;
  }

  const { allocatedById } = computeRolledAllocations(invoices, rawPaidById, totalById);

  return { invoices, rawPaidById, totalById, allocatedById };
}

/**
 * Recompute payment_status for every invoice in the event (call after any paid comment change).
 */
export async function syncPaymentStatusesForEvent(db, eventId) {
  const { invoices, totalById, allocatedById } = await loadEventAllocationMaps(db, eventId);
  for (const inv of invoices) {
    const st = paymentStatusFromAllocated(allocatedById[inv.id], totalById[inv.id]);
    await db.query(`UPDATE invoices SET payment_status = $1 WHERE id = $2`, [st, inv.id]);
  }
}

export async function syncPaymentStatusesForInvoice(db, invoiceId) {
  const row = await db.oneOrNone(`SELECT event_id FROM invoices WHERE id = $1`, [invoiceId]);
  if (!row) return;
  await syncPaymentStatusesForEvent(db, row.event_id);
}

/**
 * Effective paid amount toward an invoice after event-level rollover (for GET /invoices/paid/:id).
 */
export async function getAllocatedPaidBreakdownForInvoice(db, invoiceId) {
  const inv = await db.oneOrNone(`SELECT id, event_id FROM invoices WHERE id = $1`, [invoiceId]);
  if (!inv) return null;

  const { rawPaidById, allocatedById } = await loadEventAllocationMaps(db, inv.event_id);

  return {
    allocated: allocatedById[invoiceId] ?? 0,
    rawOnInvoice: rawPaidById[invoiceId] ?? 0,
  };
}

/**
 * One-shot figures for the single-invoice UI: matches getPastDue / getAllDue client math
 * using the same event allocation, plus current row payment_status (after server sync).
 */
export async function getSingleInvoiceBalanceFigures(db, invoiceId) {
  const current = await db.oneOrNone(
    `SELECT id, event_id, start_date, payment_status FROM invoices WHERE id = $1`,
    [invoiceId]
  );
  if (!current) return null;

  const previous = await db.query(
    `SELECT id FROM invoices
     WHERE event_id = $1 AND start_date < $2
     ORDER BY start_date ASC, id ASC`,
    [current.event_id, current.start_date]
  );

  const { totalById, allocatedById } = await loadEventAllocationMaps(db, current.event_id);

  let previousTotal = 0;
  let previousAllocated = 0;
  for (const row of previous) {
    previousTotal += Number(totalById[row.id]) || 0;
    previousAllocated += Number(allocatedById[row.id]) || 0;
  }

  const currentTotal = Number(totalById[current.id]) || 0;
  const currentAllocated = Number(allocatedById[current.id]) || 0;

  const pastDue = Math.max(0, previousTotal - previousAllocated);
  const remainingBalance = Math.max(
    0,
    previousTotal + currentTotal - previousAllocated - currentAllocated
  );

  return {
    pastDue,
    remainingBalance,
    paymentStatus: current.payment_status,
  };
}
