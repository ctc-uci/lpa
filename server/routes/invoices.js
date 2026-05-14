import express, { Router } from "express";
import multer from "multer";



import { uploadPDF } from "../common/s3";
import { keysToCamel } from "../common/utils";
import { db } from "../db/db-pgp";
import { calculateInvoiceTotal } from "./utils/invoiceTotal.js";
import { getAllocatedPaidBreakdownForInvoice, getSingleInvoiceBalanceFigures } from "./utils/invoicePaymentAllocation.js";


const invoicesRouter = Router();
invoicesRouter.use(express.json());
const upload = multer();


const NEARDUE_INVOICES_WHERE_CLAUSE = `
  is_sent = false
  AND payment_status != 'full'
  AND end_date <= CURRENT_DATE + INTERVAL '1 week'
  AND end_date + INTERVAL '5 days' > CURRENT_DATE
  AND events.archived = false`;

const OVERDUE_INVOICES_WHERE_CLAUSE = `
  CURRENT_DATE >= end_date + INTERVAL '5 days'
  AND is_sent = true
  AND payment_status != 'full'
  AND events.archived = false`;

const HIGHPRIORITY_INVOICES_WHERE_CLAUSE = `
  CURRENT_DATE >= end_date + INTERVAL '5 days'
  AND is_sent = false
  AND payment_status != 'full'
  AND events.archived = false`;


// Get all invoices
invoicesRouter.get("/", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (startDate && endDate) {
      const invoices = await db.any(
        `SELECT * FROM invoices WHERE start_date >= $1::date AND end_date <= $2::date`,
        [startDate, endDate]
      );
      res.status(200).json(keysToCamel(invoices));
    } else {
      const invoices = await db.any(`SELECT * FROM invoices ORDER BY id ASC`);

      if (invoices.length === 0) {
        return res.status(404).json({ error: "No invoices found." });
      }

      res.status(200).json(keysToCamel(invoices));
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
});

invoicesRouter.get("/notificationCount", async (req, res) => {
  try {
    const params = [];

    const query = `
      SELECT
          (SELECT COUNT(*) 
          FROM invoices 
          JOIN events ON invoices.event_id = events.id
          WHERE ${OVERDUE_INVOICES_WHERE_CLAUSE})
          +
          (SELECT COUNT(*) 
          FROM invoices 
          JOIN events ON invoices.event_id = events.id
          WHERE ${NEARDUE_INVOICES_WHERE_CLAUSE})
          +
          (SELECT COUNT(*) 
          FROM invoices 
          JOIN events ON invoices.event_id = events.id
          WHERE ${HIGHPRIORITY_INVOICES_WHERE_CLAUSE}) AS notificationcount
    `;

    const result = await db.query(query, params);

    res.status(200).json(keysToCamel(result));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Get all overdue invoices with optional date range filtering
invoicesRouter.get("/overdue", async (req, res) => {
  try {
    // Base query for overdue invoices
    const query = `
      SELECT invoices.*, events.archived FROM invoices 
      JOIN events ON invoices.event_id = events.id
      WHERE
      ${OVERDUE_INVOICES_WHERE_CLAUSE}`;

    const params = [];

    const overdueInvoices = await db.query(query, params);
    res.status(200).json(keysToCamel(overdueInvoices));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

invoicesRouter.get("/highpriority", async (req, res) => {
  try {
    // Base query for overdue invoices
    const query = `
      SELECT invoices.*, events.archived FROM invoices 
      JOIN events ON invoices.event_id = events.id
      WHERE
      ${HIGHPRIORITY_INVOICES_WHERE_CLAUSE}`;

    const highPriorityInvoices = await db.query(query);
    res.status(200).json(keysToCamel(highPriorityInvoices));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Get all invoices due within the next week with optional date range filtering
invoicesRouter.get("/neardue", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Base query for neardue invoices
    let query = `
      SELECT invoices.*, events.archived FROM invoices 
      JOIN events ON invoices.event_id = events.id
      WHERE
      ${NEARDUE_INVOICES_WHERE_CLAUSE}`;

    const params = [];

    // Add date range filtering if both dates are provided
    if (startDate && endDate) {
      query = `
        SELECT invoices.*, events.archived FROM invoices
        JOIN events ON invoices.event_id = events.id
        WHERE is_sent = false
        AND end_date BETWEEN CURRENT_DATE AND (CURRENT_DATE + INTERVAL '7 days')
        AND start_date >= $1
        AND end_date <= $2
        AND events.archived = false`;
      params.push(startDate, endDate);
    }

    const nearDueInvoices = await db.query(query, params);
    res.status(200).json(keysToCamel(nearDueInvoices));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Past due, remaining balance, and payment_status in one response (single-invoice page)
invoicesRouter.get("/singleInvoiceBalances/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || id === "null" || id === "undefined" || isNaN(parseInt(id, 10))) {
      return res.status(400).json({ error: "Invalid invoice ID" });
    }

    const data = await getSingleInvoiceBalanceFigures(db, id);
    if (!data) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    res.status(200).json(keysToCamel(data));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Get invoice by id
invoicesRouter.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate that id is a valid integer
    if (!id || id === 'null' || id === 'undefined' || isNaN(parseInt(id, 10))) {
      return res.status(400).json({ error: "Invalid invoice ID" });
    }

    const invoice = await db.query("SELECT * FROM invoices WHERE id = $1", [
      id,
    ]);

    if (invoice.length === 0) {
      return res.status(404).json({ error: "Invoice does not exist." });
    }

    res.status(200).json(keysToCamel(invoice));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Get historic invoice by id
invoicesRouter.get("/historicInvoices/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = await db.query(
      "SELECT * FROM historic_invoices WHERE original_invoice = $1",
      [id]
    );
    res.status(200).json(keysToCamel(data));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

invoicesRouter.get("/event/:event_id", async (req, res) => {
  try {
    const { event_id } = req.params;
    const { date } = req.query;

    let query = "SELECT * FROM invoices WHERE event_id = $1";
    const params = [event_id];

    if (date) {
      query += " AND start_date >= $2 AND end_date <= $3"; // Changed from date to start_date
      const parsedDate = new Date(date);

      if (isNaN(parsedDate.getTime())) {
        res
          .status(400)
          .send(
            "Invalid date format. Please use ISO 8601 (YYYY-MM-DD) format."
          );
        return;
      }

      const startOfMonth = new Date(
        parsedDate.getFullYear(),
        parsedDate.getMonth(),
        1
      );
      const endOfMonth = new Date(
        parsedDate.getFullYear(),
        parsedDate.getMonth() + 1,
        0
      );

      params.push(
        startOfMonth.toISOString().split("T")[0],
        endOfMonth.toISOString().split("T")[0]
      );
    }

    const invoices = await db.any(query, params);

    res.status(200).json(keysToCamel(invoices));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Get invoice for an event by the event id optionally between a start and end date
invoicesRouter.get("/event/:event_id", async (req, res) => {
  try {
    const { event_id } = req.params;
    const { start, end } = req.query;

    let query = `SELECT * FROM invoices WHERE event_id = $1`;
    const params = [event_id];

    if (start) {
      const [startDate, startTime] = start.split("T");
      query += ` AND (start_date >= $2)`;
      params.push(startDate);
    }

    if (end) {
      const [endDate, endTime] = end.split("T");
      if (params.length === 1) {
        query += ` AND (end_date <= $2)`;
      } else {
        query += ` AND (end_date <= $3)`;
      }
      params.push(endDate);
    }

    const data = await db.query(query, params);

    res.status(200).json(keysToCamel(data));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// GET payees for an invoice
invoicesRouter.get("/payees/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const data = await db.query(
      `SELECT clients.*
      FROM clients
      JOIN assignments ON assignments.client_id = clients.id
      JOIN invoices ON assignments.event_id = invoices.event_id
      WHERE invoices.id = $1 AND assignments.role = 'payee';`,
      [id]
    );

    res.status(200).json(keysToCamel(data));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

invoicesRouter.get("/payees/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const data = await db.query(
      `SELECT clients.*
      FROM clients
      JOIN assignments ON assignments.client_id = clients.id
      JOIN invoices ON assignments.event_id = invoices.event_id
      WHERE invoices.id = $1 AND assignments.role = 'payee';`,
      [id]
    );

    res.status(200).json(keysToCamel(data));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

invoicesRouter.get("/instructors/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const data = await db.query(
      `SELECT clients.*
      FROM clients
      JOIN assignments ON assignments.client_id = clients.id
      JOIN invoices ON assignments.event_id = invoices.event_id
      WHERE invoices.id = $1 AND assignments.role = 'instructor';`,
      [id]
    );

    res.status(200).json(keysToCamel(data));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// GET event that relates to an invoice
invoicesRouter.get("/invoiceEvent/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const event = await db.query(
      `SELECT events.*
      FROM events
      JOIN invoices ON events.id = invoices.event_id
      WHERE invoices.id = $1;`,
      [id]
    );

    if (event.length === 0) {
      return res.status(404).json({ result: "error" });
    }

    res.status(200).json(keysToCamel(event[0]));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

invoicesRouter.get("/paid/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const breakdown = await getAllocatedPaidBreakdownForInvoice(db, id);
    if (!breakdown) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    res.status(200).json(
      keysToCamel({
        total: breakdown.allocated,
        rawPaymentsOnInvoice: breakdown.rawOnInvoice,
      })
    );
  } catch (err) {
    res.status(500).send(err.message);
  }
});

invoicesRouter.get("/total/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const invoiceRes = await db.query("SELECT * FROM invoices WHERE id = $1", [id]);
    if (!invoiceRes || invoiceRes.length === 0) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    const totalCost = await calculateInvoiceTotal(db, id);

    res.status(200).json(keysToCamel({ total: totalCost }));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

invoicesRouter.get("/previousInvoices/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const previousInvoices = await db.query(`
      SELECT * FROM invoices
      WHERE start_date < (
        SELECT start_date FROM invoices
        WHERE id = $1
      )
      AND event_id = (
        SELECT event_id FROM invoices
        WHERE id = $1
      )`, [id]);

    res.status(200).json(keysToCamel(previousInvoices));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

invoicesRouter.post("/", async (req, res) => {
  try {
    const invoiceData = req.body;

    if (!invoiceData) {
      return res.status(400).json({ error: "Invoice data is required" });
    }

    const result = await db.one(
      `INSERT INTO invoices
         (event_id, start_date, end_date, is_sent, payment_status)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
      [
        invoiceData.eventId,
        invoiceData.startDate,
        invoiceData.endDate,
        invoiceData.isSent ?? false,
        invoiceData.paymentStatus ?? "none",
      ]
    );

    res.status(201).json(result.id);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

invoicesRouter.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const invoiceData = req.body;

    if (!invoiceData) {
      return res.status(400).json({ error: "Invoice data is required" });
    }

    const result = await db.oneOrNone(
      `UPDATE invoices
         SET
           event_id = COALESCE($1, event_id),
           start_date = COALESCE($2, start_date),
           end_date = COALESCE($3, end_date),
           is_sent = COALESCE($4, is_sent),
           payment_status = COALESCE($5, payment_status),
           custom_message = COALESCE($6, custom_message)
         WHERE id = $7
         RETURNING *`,
      [
        invoiceData.eventId,
        invoiceData.startDate,
        invoiceData.endDate,
        invoiceData.isSent,
        invoiceData.paymentStatus,
        invoiceData.customMessage ?? null,
        id,
      ]
    );

    if (!result) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    res.status(200).json(keysToCamel(result));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

invoicesRouter.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const data = await db.query("DELETE FROM invoices WHERE id = $1 RETURNING *", [
      id,
    ]);

    if (!data || data.length === 0) {
      return res.status(404).json({ result: "error" });
    }

    res.status(200).json({ result: "success" });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

invoicesRouter.post(
  "/backupInvoice/:id",
  upload.single("file"),
  async (req, res) => {
    // Backup a invoice PDF to S3 and store the URL in the database
    // Params:
    //  id - the invoice id
    // Body:
    //  file - the invoice PDF file
    //  comment - optional comment for the invoice
    // Returns:
    //  fileURL - the viewable URL of the uploaded PDF

    // Upload an invoice PDF to S3, returning the viewable URL
    try {
      const file = req.file;
      const { id } = req.params;
      const { comment } = req.body;

      if (!file) {
        return res.status(500).json({ error: "File is required" });
      }

      // Upload to S3
      const fileURL = await uploadPDF(file);

      // Store the file URL in the database
      await db.query(
        `INSERT INTO historic_invoices (original_invoice, datetime, file_reference, comment)
       VALUES ($1, $2, $3, $4)`,
        [id, "NOW()", fileURL, comment]
      );

      res.status(201).json(fileURL);
    } catch (err) {
      res.status(500).send(err.message);
    }
  }
);

invoicesRouter.get("/previousInvoices/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { event_id } = req.query;

    // Get previous invoices from database
    const data = await db.query("SELECT * FROM invoices WHERE event_id = $1 AND start_date < (SELECT start_date FROM invoices WHERE id = $2) AND payment_status <> 'full' ORDER BY start_date DESC", 
      [event_id, id]
    );

    res.status(200).json(keysToCamel(data));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Newer invoices for the same event (next billing period onward), ordered oldest-first
invoicesRouter.get("/followingInvoices/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const data = await db.query(
      `SELECT * FROM invoices
       WHERE event_id = (SELECT event_id FROM invoices WHERE id = $1)
       AND start_date > (SELECT start_date FROM invoices WHERE id = $1)
       ORDER BY start_date ASC`,
      [id]
    );

    res.status(200).json(keysToCamel(data));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Latest billing-period invoice for the same event as the given invoice
invoicesRouter.get("/latestInvoiceForEvent/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const data = await db.query(
      `SELECT * FROM invoices
       WHERE event_id = (SELECT event_id FROM invoices WHERE id = $1)
       ORDER BY start_date DESC
       LIMIT 1`,
      [id]
    );

    res.status(200).json(keysToCamel(data));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Invoice for the same event whose billing period overlaps the current calendar month (server date)
invoicesRouter.get("/currentMonthInvoiceForEvent/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const data = await db.query(
      `SELECT * FROM invoices
       WHERE event_id = (SELECT event_id FROM invoices WHERE id = $1)
         AND start_date <= (date_trunc('month', CURRENT_DATE) + interval '1 month' - interval '1 day')::date
         AND end_date >= date_trunc('month', CURRENT_DATE)::date
       ORDER BY start_date DESC
       LIMIT 1`,
      [id]
    );

    res.status(200).json(keysToCamel(data));
  } catch (err) {
    res.status(500).send(err.message);
  }
});


export { invoicesRouter };
