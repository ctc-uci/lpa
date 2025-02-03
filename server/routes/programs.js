import express, { Router } from "express";
import { db } from "../db/db-pgp";
import { keysToCamel } from "../common/utils";

const programsRouter = Router();
programsRouter.use(express.json());

programsRouter.get("/", async (req, res) => {
  try {
    const programs = await db.any(`
        SELECT DISTINCT ON (e.id) 
        e.name AS event_name,  
        b.date, 
        b.start_time, 
        b.end_time, 
        r.name AS room_name,
         MAX(CASE WHEN a.role = 'instructor' THEN c.name END) AS instructor_name,
         MAX(CASE WHEN a.role = 'payee' THEN c.name END) AS payee_name
        FROM events AS e
         JOIN assignments AS a ON e.id = a.event_id
         JOIN bookings AS b ON e.id = b.event_id
         JOIN rooms AS r ON r.id = b.room_id
         JOIN clients AS c ON a.client_id = c.id
        GROUP BY e.id, e.name, b.date, b.start_time, b.end_time, r.name
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
        SELECT e.id, e.name, b.date, b.start_time, b.end_time, r.name,
        MAX(CASE WHEN a.role = 'instructor' THEN c.name END) AS instructor_name,
        MAX(CASE WHEN a.role = 'payee' THEN c.name END) AS payee_name
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
  
export { programsRouter };

// Assignment (client_id, role), -DONE-
// Events (id, name), -DONE-
// Bookings (date, start_time, end_time, room_id), -DONE-
// Rooms (name), -DONE-
// Client (name)