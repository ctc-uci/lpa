import express, { Router } from "express";
import axios from "axios";

import { keysToCamel } from "../common/utils";
import { db } from "../db/db-pgp";

const programsRouter = Router();
programsRouter.use(express.json());

programsRouter.get("/", async (req, res) => {
  try {
    const programs = await db.any(`
        SELECT DISTINCT ON (e.id)
          e.id,
          e.name AS event_name,
          e.archived,
          b.date,
          b.start_time,
          b.end_time,
          r.name AS room_name,
          -- Use string_agg to get all instructors concatenated, and trim extra commas if needed
          COALESCE(string_agg(DISTINCT CASE WHEN a.role = 'instructor' THEN c.name END, ', '), 'N/A') AS instructor_name,
          COALESCE(string_agg(DISTINCT CASE WHEN a.role = 'payee' THEN c.name END, ', '), 'N/A') AS payee_name
        FROM events AS e
         LEFT JOIN assignments AS a ON e.id = a.event_id
         LEFT JOIN bookings AS b ON e.id = b.event_id
         LEFT JOIN rooms AS r ON r.id = b.room_id
         LEFT JOIN clients AS c ON a.client_id = c.id
        GROUP BY e.id, e.name, e.archived, b.date, b.start_time, b.end_time, r.name
        ORDER BY e.id, b.date DESC, b.start_time DESC;
    `);

    if (programs.length === 0) {
      return res.status(404).json({ error: "No programs found." });
    }

    res.status(200).json(keysToCamel(programs));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

programsRouter.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
        SELECT e.id, e.name, b.date, b.start_time, b.end_time, r.name AS room_name,
          COALESCE(string_agg(DISTINCT CASE WHEN a.role = 'instructor' THEN c.name END, ', '), 'N/A') AS instructor_name,
          COALESCE(string_agg(DISTINCT CASE WHEN a.role = 'payee' THEN c.name END, ', '), 'N/A') AS payee_name
        FROM events AS e
         JOIN bookings AS b ON e.id = b.event_id
         JOIN rooms AS r ON b.room_id = r.id
         JOIN assignments AS a ON e.id = a.event_id
         JOIN clients AS c ON a.client_id = c.id
        WHERE e.id = $1
        GROUP BY e.id, e.name, b.date, b.start_time, b.end_time, r.name;
      `;

    const program = await db.any(query, [id]);

    if (program.length === 0) {
      return res.status(404).json({ error: "Program not found." });
    }

    res.status(200).json(keysToCamel(program));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

programsRouter.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { archived } = req.body;

    const data = await db.query(
      `
      UPDATE events
      SET
        archived = COALESCE($2, archived)
      WHERE id = $1
      RETURNING *;
      `,
      [id, archived]
  );
    res.status(200).json(keysToCamel(data));
   } catch (err) {
    res.status(500).send(err.message);
  }
});

// update archived status of programs based on a given event id
programsRouter.put("/updateSessionArchive/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { archived } = req.body;

    const data = await db.query(
      `
      UPDATE bookings
      SET
        archived = COALESCE($2, archived)
      WHERE event_id = $1
      RETURNING *;
      `,
      [id, archived]
  );
    res.status(200).json(keysToCamel(data));
   } catch (err) {
    res.status(500).send(err.message);
  }
});

programsRouter.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Delete booking from database
    const data = await db.query("DELETE FROM events WHERE id = $1 RETURNING *",
      [ id ]);

    if (!data) {
      return res.status(404).json({result: 'error'});
    }

    res.status(200).json({result: 'success'});
  } catch (err) {
    res.status(500).send(err.message);
  }
});

programsRouter.post("/archive/:eventId", async (req, res) => {
  // Archives a program, all of its sessions, and adds a fee to the current invoice

  try {
    const { eventId } = req.params;
    const { reason, firebaseUid } = req.body;

    // Find all sessions within 2 weeks
    // WRITE FUNCTION TO GET THE COST OF SESSIONS WITHIN 2 WEEKS IN FUTURE 
    const totalCost = 100;

    // Add the total cost to the current invoice
    const invoice = await db.query(`
      SELECT id FROM invoices
      WHERE event_id = $1
      ORDER BY start_date DESC
      LIMIT 1
      `, [eventId]);
    const invoiceId = invoice[0].id;
    if (invoiceId === undefined) {
      res.status(500).json({result: "error while finding invoice"});
    }

    // Get the user id from the firebase uid
    const user = await db.query(`
      SELECT id FROM users
      WHERE firebase_uid = $1
      `, [firebaseUid]);
    const userId = user[0].id;
    if (userId === undefined) {
      res.status(500).json({result: "error while finding user"});
    }

    // THE FOLLOWING IS NOT A GOOD WAY TO DO THIS.
    // I will fix this later if there is time...

    // Make HTTP request to comments endpoint
    // This handles updating invoice status to paid or partial
    console.log(`${req.protocol}://${req.get('host')}/comments`);
    const commentResponse = await axios.post(`${req.protocol}://${req.get('host')}/comments`, {
      user_id: userId,
      invoice_id: invoiceId,
      datetime: new Date().toISOString().slice(0, 19).replace('T', ' '),
      comment: reason,
      adjustment_type: "total",
      adjustment_value: totalCost
    });
    
    if (commentResponse.status !== 200) {
      console.log(commentResponse.data, commentResponse.status);
      return res.status(500).json({result: "error while creating comment"});
    }
    console.log(commentResponse.data);

    // Archive the program
    const program = await db.query(`
      UPDATE events
      SET
        archived = true
      WHERE id = $1
      RETURNING *;
      `, [eventId]);
    if (program.length === 0) {
      res.status(500).json({result: "error while archiving program"});
    }

    // Archive the bookings
    await db.query(`
      UPDATE bookings
      SET
        archived = true
      WHERE event_id = $1;
      `, [eventId]);

    res.status(200).json({result: "success"});
  } catch (err) {
    res.status(500).send(err.message);
  }
});

export { programsRouter };
