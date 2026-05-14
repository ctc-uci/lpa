/**
 * One-off: recompute and persist invoices.total_amount for every invoice.
 * Run from server directory: yarn backfill:invoice-totals
 */
import { db } from "../db/db-pgp.ts";
import { syncStoredInvoiceTotal } from "../routes/utils/invoiceTotalSync.js";

async function main() {
  const rows = await db.query(`SELECT id FROM invoices ORDER BY id ASC`);
  console.info(`Backfilling total_amount for ${rows.length} invoices…`);
  let n = 0;
  for (const r of rows) {
    await syncStoredInvoiceTotal(db, r.id);
    n += 1;
    if (n % 50 === 0) console.info(`  …${n}`);
  }
  console.info("Done.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
