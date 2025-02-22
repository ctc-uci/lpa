import express, { Router } from "express";
import { invoicesRouter } from "./invoices";
import { keysToCamel } from "../common/utils";
import { db } from "../db/db-pgp";

const eventsRouter = Router();
eventsRouter.use(express.json());

// Return all events
eventsRouter.get("/", async (req, res) => {
  try {
    const events = await db.any(`SELECT * FROM events ORDER BY id ASC`);

    if (events.length === 0) {
      return res.status(404).json({ error: "No events found." });
    }

    res.status(200).json(keysToCamel(events));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Return event by ID
eventsRouter.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const event = await db.query("SELECT * FROM events WHERE id = $1", [
      id,
    ]);

    if (event.length === 0) {
      return res.status(404).json({ error: "Event does not exist." });
    }

    res.status(200).json(keysToCamel(event));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Return all event info for event by ID
eventsRouter.get("/allInfo/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const event = await db.query(`SELECT *, events.name as eventName, events.description as eventDescription, rooms.name as roomName, rooms.description as roomDescription, assignments.role as clientRole, clients.name as clientName
        FROM events
        JOIN bookings ON events.id = bookings.event_id
        JOIN rooms ON bookings.room_id = rooms.id
        LEFT JOIN assignments ON bookings.event_id = assignments.event_id
        LEFT JOIN clients ON assignments.client_id = clients.id
        WHERE events.id = $1`, [
          id
      ]);

    if (event.length === 0) {
      return res.status(404).json({ error: "Event does not exist." });
    }

    res.status(200).json(keysToCamel(event));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Create event, return event ID
eventsRouter.post("/", async (req, res) => {
  try {
    const eventData = req.body;

    if (!eventData) {
      return res.status(404).json({ error: "Event data is required" });
    }

    const result = await db.query(
      "INSERT INTO events (name, description, archived) VALUES ($1, $2, $3) RETURNING id",
      [eventData.name, eventData.description || null, eventData.archived ?? false]
    );
    res.status(201).json({ id: result[0].id });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Return all data of updated event
eventsRouter.put("/:id", async (req, res) => {
  try {
    const eventData = req.body;
    const { id } = req.params;

    if (!eventData) {
      return res.status(404).json({ error: "Event data is required" });
    }

    const event = await db.query(
      `UPDATE events
      SET
      name = COALESCE($1, name),
      description = COALESCE($2, description),
      archived = COALESCE($3, archived)
      WHERE id = $4
      RETURNING *`,
      [eventData.name, eventData.description, eventData.archived, id]
    );

    res.status(200).json(keysToCamel(event));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

eventsRouter.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const data = await db.query(`DELETE FROM events WHERE id = $1 RETURNING *`, [id]);

    if (data.length > 0)
      res.status(200).json({ "result": "success", "deletedData": keysToCamel(data) });
    else
      res.status(404).json({ "result": "error" });
  } catch (err) {
      res.status(500).send(err.message);
  }
});

eventsRouter.get("/remaining/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const currentMonth = (new Date()).toISOString().split('T')[0] + "T00:00:00Z";

    const unpaidInvoices = await db.query(
      `SELECT * FROM invoices
      WHERE invoices.event_id = $1 AND payment_status <> 'full' AND end_date < $2;`, [
      id, currentMonth])
    res.status(200).json(keysToCamel(unpaidInvoices));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

export { eventsRouter };
