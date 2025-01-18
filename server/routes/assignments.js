import { Router } from "express";
import { keysToCamel } from "../common/utils";
import { db } from "../db/db-pgp";

export const assignmentsRouter = Router();

// Get assignments for a specific event
assignmentsRouter.get("/event/:event_id", async (req, res) => {
  try {
    const { event_id } = req.params;

    const assignments = await db.query(
      `SELECT a.id, a.event_id, a.client_id, a.role, c.name as client_name, e.name as event_name
       FROM assignments a, clients c, events e
       WHERE a.client_id = c.id AND a.event_id = e.id AND a.event_id = $1
       ORDER BY a.id ASC`,
      [event_id]
    );

    // Check if assignments exist
    if (assignments.length === 0) {
      return res.status(404).json(keysToCamel({error: "No assignments found for this event"}));
    }

    res.status(200).json(keysToCamel(assignments));
  } catch (err) {
    res.status(500).send(err.message);
  }
});