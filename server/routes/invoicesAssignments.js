import express, { Router } from "express";
import { db } from "../db/db-pgp";
import { keysToCamel } from "../common/utils";

const invoicesAssignments = Router();
invoicesAssignments.use(express.json());

invoicesAssignments.get("/", async (req, res) => {
  try {
    const invoices = await db.query(
      `SELECT invoices.id as id, events.name as event_name, invoices.is_sent, invoices.payment_status, clients.name, invoices.end_date, assignments.role,
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

    res.status(200).json(keysToCamel(invoices)); // Ensure you return `data.rows`
  }
  catch (err) {
    res.status(500).send(err.message); // Fixed error response
  }
});

export { invoicesAssignments };
