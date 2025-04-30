import express, { Router } from "express";
import multer from "multer";

import { uploadPDF } from "../common/s3";
import { keysToCamel } from "../common/utils";
import { db } from "../db/db-pgp";

const invoicesRouter = Router();
invoicesRouter.use(express.json());
const upload = multer();

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
    const { startDate, endDate } = req.query;
    const params = [];
    let dateFilter = "";

    if (startDate && endDate) {
      dateFilter = "AND start_date >= $1 AND end_date <= $2";
      params.push(startDate, endDate);
    }

    const query = `
      SELECT
          (SELECT COUNT(*) FROM invoices WHERE is_sent = true
            AND payment_status IN ('partial', 'none')
            AND end_date < CURRENT_DATE
            ${dateFilter})
          +
          (SELECT COUNT(*) FROM invoices WHERE is_sent = false
            AND payment_status IN ('partial', 'none')
            AND end_date < CURRENT_DATE
            ${dateFilter})
          +
          (SELECT COUNT(*) FROM invoices WHERE is_sent = false
            AND end_date BETWEEN CURRENT_DATE AND (CURRENT_DATE + INTERVAL '7 days')
            ${dateFilter}) AS notificationcount
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
      SELECT * FROM invoices
      WHERE is_sent = true
      AND payment_status IN ('partial', 'none')
      AND end_date < CURRENT_DATE`;

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
      SELECT * FROM invoices
      WHERE is_sent = false
      AND payment_status IN ('partial', 'none')
      AND end_date < CURRENT_DATE`;

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
      SELECT * FROM invoices
      WHERE is_sent = false
      AND end_date BETWEEN CURRENT_DATE AND (CURRENT_DATE + INTERVAL '7 days')`;

    const params = [];

    // Add date range filtering if both dates are provided
    if (startDate && endDate) {
      query = `
        SELECT * FROM invoices
        WHERE is_sent = false
        AND end_date BETWEEN CURRENT_DATE AND (CURRENT_DATE + INTERVAL '7 days')
        AND start_date >= $1
        AND end_date <= $2`;
      params.push(startDate, endDate);
    }

    const nearDueInvoices = await db.query(query, params);
    res.status(200).json(keysToCamel(nearDueInvoices));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Get invoice by id
invoicesRouter.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

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

    let result = await db.oneOrNone(
      `SELECT SUM(c.adjustment_value)
      FROM invoices i
      JOIN comments c ON c.invoice_id = i.id
      WHERE i.id = $1 AND c.adjustment_type = 'paid';
      `,
      [id]
    );

    if (!result) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    result = {
      total: result.sum,
    };

    res.status(200).json(keysToCamel(result));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

invoicesRouter.get("/total/:id", async (req, res) => {
  try {
    const { id } = req.params; //invoice id

    const invoiceRes = await db.query("SELECT * FROM invoices WHERE id = $1", [
      id,
    ]);
    const invoice = invoiceRes[0];

    // Use the event_id from the invoice record.
    const eventRes = await db.query("SELECT * FROM events WHERE id = $1", [
      invoice.event_id,
    ]);
    const event = eventRes[0];

    const comments = await db.query(
      "SELECT * FROM comments WHERE adjustment_type IN ('rate_flat', 'rate_percent') AND booking_id IS NULL"
    );

    const bookings = await db.query(
      "SELECT * FROM bookings WHERE event_id = $1 AND date BETWEEN $2 AND $3",
      [event.id, invoice.start_date, invoice.end_date]
    );

    const totalAdjustments = await db.query(
      "SELECT * FROM comments WHERE adjustment_type = 'total'"
    );

    const bookingCosts = await Promise.all(
      bookings.map(async (booking) => {
        const roomRateBooking = await db.query(
          "SELECT rooms.name, rooms.rate FROM rooms JOIN bookings ON rooms.id = bookings.room_id WHERE bookings.id = $1",
          [booking.id]
        );

        if (!roomRateBooking.length) return 0; // if room not found, cost is 0

        let totalRate = Number(roomRateBooking[0].rate);

        comments.forEach((adj) => {
          if (adj.adjustment_type === "rate_percent") {
            totalRate *= 1 + Number(adj.adjustment_value) / 100;
          } else if (adj.adjustment_type === "rate_flat") {
            totalRate += Number(adj.adjustment_value);
          }
        });

        const commentsBooking = await db.query(
          "SELECT * FROM comments WHERE adjustment_type IN ('rate_flat', 'rate_percent') AND booking_id = $1",
          [booking.id]
        );

        commentsBooking.forEach((adj) => {
          if (adj.adjustment_type === "rate_percent") {
            totalRate *= 1 + Number(adj.adjustment_value) / 100;
          } else if (adj.adjustment_type === "rate_flat") {
            totalRate += Number(adj.adjustment_value);
          }
        });

        // Calculate booking duration in hours.
        const startTime = new Date(
          `1970-01-01T${booking.start_time.substring(0, booking.start_time.length - 3)}Z`
        );
        const endTime = new Date(
          `1970-01-01T${booking.end_time.substring(0, booking.start_time.length - 3)}Z`
        );
        const durationHours = (endTime - startTime) / (1000 * 60 * 60);

        // Calculate booking cost.
        let bookingCost = totalRate * durationHours;

        // Apply 'total' adjustments specific to this booking
        totalAdjustments.forEach((comment) => {
          if (comment.booking_id === booking.id) {
            bookingCost += Number(comment.adjustment_value);
          }
        });

        return bookingCost;
      })
    );

    let totalCost = bookingCosts.reduce((acc, cost) => acc + cost, 0);

    // Apply 'total' adjustments that do not have a booking_id (global adjustments)
    totalAdjustments.forEach((comment) => {
      if (!comment.booking_id) {
        totalCost += Number(comment.adjustment_value);
      }
    });

    const result = {
      total: totalCost,
    };

    res.status(200).json(keysToCamel(result));
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
           payment_status = COALESCE($5, payment_status)
         WHERE id = $6
         RETURNING *`,
      [
        invoiceData.eventId,
        invoiceData.startDate,
        invoiceData.endDate,
        invoiceData.isSent,
        invoiceData.paymentStatus,
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

    // Delete booking from database
    const data = db.query("DELETE FROM invoices WHERE id = $1 RETURNING *", [
      id,
    ]);

    if (data.length === 0) {
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

export { invoicesRouter };
