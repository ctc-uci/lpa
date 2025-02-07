import express, { Router } from "express";
import { db } from "../db/db-pgp";
import { keysToCamel } from "../common/utils";

const invoicesRouter = Router();
invoicesRouter.use(express.json());

// Get all invoices
invoicesRouter.get("/", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    console.log("Query params:", startDate, endDate);
    
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

// Get all overdue invoices with optional date range filtering
invoicesRouter.get("/overdue", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Base query for overdue invoices
    let query = `
      SELECT * FROM invoices 
      WHERE is_sent = false 
      AND payment_status IN ('partial', 'none') 
      AND end_date < CURRENT_DATE`;
    
    const params = [];
    
    // Add date range filtering if both dates are provided
    if (startDate && endDate) {
      query = `
        SELECT * FROM invoices 
        WHERE is_sent = false 
        AND payment_status IN ('partial', 'none') 
        AND end_date < CURRENT_DATE
        AND start_date >= $1 
        AND end_date <= $2`;
      params.push(startDate, endDate);
    }

    const overdueInvoices = await db.query(query, params);
    res.status(200).json(keysToCamel(overdueInvoices));
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

    if(invoice.length === 0){
      return res.status(404).json({ error: "Invoice does not exist." });
    }

    res.status(200).json(keysToCamel(invoice));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

invoicesRouter.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Delete booking from database
    const data = db.query("DELETE FROM invoices WHERE id = $1 RETURNING *", 
      [ id ]);
    
    if (data.length === 0) {
      return res.status(404).json({result: 'error'});
    }

    res.status(200).json({result: 'success'});
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// GET /invoices/event/:event_id?date=[val]
invoicesRouter.get("/event/:event_id", async (req, res) => {
    try {
      const { event_id } = req.params;
      const { date } = req.query;

      let query = "SELECT * FROM invoices WHERE event_id = $1";
      const params = [event_id];
      
      if (date) {
        query += " AND start_date >= $2 AND end_date <= $3";  // Changed from date to start_date
        const parsedDate = new Date(date);

        if (isNaN(parsedDate.getTime())) {
          res.status(400).send("Invalid date format. Please use ISO 8601 (YYYY-MM-DD) format.");
          return;
        }

        const startOfMonth = new Date(parsedDate.getFullYear(), parsedDate.getMonth(), 1);
        const endOfMonth = new Date(parsedDate.getFullYear(), parsedDate.getMonth() + 1, 0);

        params.push(startOfMonth.toISOString().split("T")[0], endOfMonth.toISOString().split("T")[0]);
      }

      const invoices = await db.any(query, params);

      console.log(invoices);
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

// POST /invoices
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
          invoiceData.paymentStatus ?? 'none'
        ]
      );
      
      res.status(201).json(result.id);
    } catch (err) {
      res.status(500).send(err.message);
    }
  });

// PUT /invoices/:id
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
          id
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

invoicesRouter.get("/total/:id", async (req, res) => {
  // DUMMY ENDPONT for testing
  try {
    const { id } = req.params;

    const result = {
      total: 100
    }
    
    res.status(200).json(keysToCamel(result));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

invoicesRouter.get("/paid/:id", async (req, res) => {
  // DUMMY ENDPONT for testing
  try {
    const { id } = req.params;

    const result = {
      paid: 50
    }
    
    res.status(200).json(keysToCamel(result));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

export { invoicesRouter };
