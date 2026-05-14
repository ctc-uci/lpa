import express, { Router } from "express";
import { db } from "../db/db-pgp";
import { keysToCamel } from "../common/utils";
import { loadEventAllocationMaps } from "./utils/invoicePaymentAllocation.js";

const invoicesAssignments = Router();
invoicesAssignments.use(express.json());

const EPS = 0.005;

/** Per invoice: latest paid-comment on another period (prefer later billing period, else earlier). */
async function loadCoveragePaymentMetaByInvoice(db, eventId) {
  const rows = await db.query(
    `SELECT i.id AS invoice_id,
      (SELECT MAX(c.datetime)
       FROM comments c
       INNER JOIN invoices i2 ON i2.id = c.invoice_id
       WHERE c.adjustment_type = 'paid'
         AND i2.event_id = i.event_id
         AND i2.id <> i.id
         AND i2.start_date > i.start_date) AS from_later,
      (SELECT MAX(c.datetime)
       FROM comments c
       INNER JOIN invoices i2 ON i2.id = c.invoice_id
       WHERE c.adjustment_type = 'paid'
         AND i2.event_id = i.event_id
         AND i2.id <> i.id
         AND i2.start_date < i.start_date) AS from_earlier
     FROM invoices i
     WHERE i.event_id = $1`,
    [eventId]
  );
  return new Map(
    rows.map((r) => {
      let meta = null;
      if (r.from_later) {
        meta = { date: r.from_later, source: "later" };
      } else if (r.from_earlier) {
        meta = { date: r.from_earlier, source: "earlier" };
      }
      return [r.invoice_id, meta];
    })
  );
}

invoicesAssignments.get("/", async (req, res) => {
  try {
    const invoices = await db.query(
      `SELECT invoices.id as id, events.name as event_name, invoices.is_sent, invoices.payment_status, clients.name, invoices.end_date, invoices.start_date, invoices.event_id, assignments.role,
              lp.last_payment_date, lp.last_payment_amount
       FROM events
       JOIN invoices ON events.id = invoices.event_id
       LEFT JOIN assignments ON assignments.event_id = events.id
       LEFT JOIN clients ON clients.id = assignments.client_id
       LEFT JOIN LATERAL (
         SELECT datetime AS last_payment_date, adjustment_value AS last_payment_amount
         FROM comments
         WHERE invoice_id = invoices.id AND adjustment_type = 'paid'
         ORDER BY datetime DESC
         LIMIT 1
       ) lp ON true
       WHERE events.archived = false;`,
    );

    const eventIds = [
      ...new Set(invoices.map((r) => r.event_id).filter((eid) => eid !== null && eid !== undefined)),
    ];

    const perEvent = await Promise.all(
      eventIds.map(async (eventId) => {
        const [maps, coverageMap] = await Promise.all([
          loadEventAllocationMaps(db, eventId),
          loadCoveragePaymentMetaByInvoice(db, eventId),
        ]);
        return [eventId, { maps, coverageMap }];
      })
    );
    const byEvent = new Map(perEvent);

    const enriched = invoices.map((row) => {
      let covered_by_payment_date = null;
      let covered_by_payment_source = null;
      const bundle = byEvent.get(row.event_id);
      if (bundle && !row.last_payment_date) {
        const raw = Number(bundle.maps.rawPaidById[row.id]) || 0;
        const alloc = Number(bundle.maps.allocatedById[row.id]) || 0;
        if (alloc > raw + EPS) {
          const meta = bundle.coverageMap.get(row.id);
          if (meta) {
            covered_by_payment_date = meta.date;
            covered_by_payment_source = meta.source;
          }
        }
      }
      return { ...row, covered_by_payment_date, covered_by_payment_source };
    });

    res.status(200).json(keysToCamel(enriched));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

export { invoicesAssignments };
