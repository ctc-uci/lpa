import { Router } from "express";

import { keysToCamel } from "../common/utils";
import { admin } from "../config/firebase";
import { db } from "../db/db-pgp";
import { verifyRole } from "../src/middleware";

export const eventRouter = Router();

// Return all events
eventRouter.get("/events", async (req, res) => {
  try {
    const event = await db.query(`SELECT * FROM events ORDER BY id ASC`);

    if(event.length == 0){
        return res.status(404).json({ error: "No events found." });
    }

    res.status(200).json(keysToCamel(event));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Return event by ID
eventRouter.get("/events/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const event = await db.query("SELECT * FROM events WHERE id = $1", [
      id,
    ]);
    
    if(event.length == 0){
        return res.status(404).json({ error: "Event does not exist." });
    }

    res.status(200).json(keysToCamel(event));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Create event, return event ID
eventRouter.post("/events", async (req, res) => {
  try {
    const eventData = req.body;

    if (!eventData){ 
        return res.status(404).json({ error: "Event data is required" });
    }

    const result = await db.query(
        "INSERT INTO events (name, description, archived) VALUES ($1, $2, $3) RETURNING id",
        [eventData.name, eventData.description, eventData.archived]
      );
    res.status(200).json(keysToCamel(result));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Return all data of updated event
eventRouter.put("/events/:id", async (req, res) => {
  try {
    const eventData = req.body;
    const { id } = req.params;

    if (!eventData){ 
        return res.status(404).json({ error: "Event data is required" });
    }

    const event = await db.query(
      "UPDATE events SET name = $1, description = $2, archived = $3 WHERE id = $4 RETURNING *",
      [eventData.name, eventData.description, eventData.archived, id]
    );

    res.status(200).json(keysToCamel(event));
  } catch (err) {
    res.status(500).send(err.message);
  }
});



