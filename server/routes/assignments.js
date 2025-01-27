import express, { Router } from "express";
import { keysToCamel } from "../common/utils";
import { db } from "../db/db-pgp";

const assignmentsRouter = Router();
assignmentsRouter.use(express.json());

// Get all assignments
assignmentsRouter.get("/", async (req, res) => {
  try {
    const users = await db.query(`SELECT * FROM assignments`);

    res.status(200).json(keysToCamel(users));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Get an assignment by ID
assignmentsRouter.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const user = await db.query("SELECT * FROM assignments WHERE id = $1", [
      id,
    ]);

    res.status(200).json(keysToCamel(user));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

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

    res.status(200).json(keysToCamel(assignments));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

assignmentsRouter.post("/", async (req, res) => {
    try {
      const { eventId, clientId, role } = req.body;

      console.log('Values:', { eventId, clientId, role }); // Add this line
      const query = {
        text: 'INSERT INTO assignments (event_id, client_id, role) VALUES ($1, $2, $3) RETURNING *',
        values: [eventId, clientId, role],
      };
  
      const result = await db.query(query);
      console.log('Query result:', result);  // Add this line
      res.status(201).json({id: result[0].id });
    } catch (err) {
      res.status(500).send(err.message);
    }
  });
  
assignmentsRouter.get("/client/:client_id", async (req, res) => {
    try {
        const { client_id } = req.params;
        const data = await db.query(`SELECT * FROM assignments WHERE client_id = $1`, [client_id]);
        res.status(200).json(keysToCamel(data));
    } catch (err) {
        res.status(500).send(err.message);
    }
})

assignmentsRouter.get("/search", async (req, res) => {
    const {event, client} = req.query;
    try {
        const data = await db.query(`SELECT * FROM assignments WHERE event_id = $1 AND client_id = $2`, [event, client]);
        res.status(200).json(keysToCamel(data));
    } catch (err) {
        res.status(500).send(err.message);
    }
})

assignmentsRouter.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { eventId, clientId, role } = req.body;
        const data = await db.query(`UPDATE assignments SET event_id = $1, client_id = $2, role = $3 WHERE id = $4 RETURNING *`, [eventId, clientId, role, id]);
        res.status(200).json(keysToCamel(data));
    } catch (err) {
        res.status(500).send(err.message);
    }
})

assignmentsRouter.delete("/:id", async (req, res) => {
    try {
        const {id} = req.params;
        const data = await db.query("DELETE FROM assignments WHERE id = $1", [id]);
        if (data.length === 0) {
            return res.status(404).json({result: "error", message: "Assignment not found"});
        }
        res.status(200).json({result: "success"});
    } catch (err) {
        res.status(500).json({result: "error"});
    }
});

export { assignmentsRouter };
