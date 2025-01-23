import { Router } from "express";
import { keysToCamel } from "../common/utils";
import { db } from "../db/db-pgp";

const invoicesRouter = Router();

// GET /invoices/event/:event_id?date=[val]
invoicesRouter.get("/event/:event_id", async (req, res) => {
    try {
      const { event_id } = req.params;
      const { date } = req.query;
      console.log("invoices");
      let query = "SELECT * FROM invoices WHERE event_id = $1";
      const params = [event_id];
      
      if (date) {
        query += " AND start_date = $2";  // Changed from date to start_date
        params.push(date);
      }
      
      
      const invoices = await db.any(query, params);
      console.log(invoices);
      res.status(200).json(keysToCamel(invoices));
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

export { invoicesRouter };