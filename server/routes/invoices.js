import { Router } from "express";
import { keysToCamel } from "../common/utils";
import { db } from "../db/db-pgp"; // TODO: replace this db with

const invoicesRouter = Router();

// Get all invoices
invoicesRouter.get("/", async (req, res) => {
  try {
    const users = await db.query(`SELECT * FROM invoices`);

    res.status(200).json(keysToCamel(users));
  } catch (err) {
    res.status(400).send(err.message);
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

// Get invoice for an event by the event id optionally between a start and end date
invoicesRouter.get("/event/:event_id", async (req, res) => {
  try {
    const { event_id } = req.params;
    const { start, end } = req.query;

    let query = `SELECT * FROM invoices WHERE event_id = $1`;
    const params = [event_id];

    if (start) {
      query += ` AND (start_date >= $2)`;
      params.push(start);
    }

    if (end) {
      if (params.length === 1) {
        query += ` AND (end_date <= $2)`;
      } else {
        query += ` AND (end_date <= $3)`;
      }
      params.push(end);
    }

    const data = await db.query(query, params);

    res.status(200).json(keysToCamel(data));
} catch (err) {
    res.status(500).send(err.message);
  }
});

export { invoicesRouter };
