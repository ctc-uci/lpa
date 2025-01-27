import { Router } from "express";
import { db } from "../db/db-pgp";
import { keysToCamel } from "../common/utils";

const roomsRouter = Router();

roomsRouter.get("/", async (req, res) => {
  try {
    const data = await db.query(`SELECT * FROM rooms`);
    res.status(200).json(keysToCamel(data));
} catch (err) {
    res.status(500).send(err.message);
}
});

// Get room by ID
roomsRouter.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = await db.query(`SELECT * FROM rooms WHERE id = $1`, [id]);

    res.status(200).json(keysToCamel(data));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Add new room, returning ID of new room
roomsRouter.post("/", async (req, res) => {
  try {
    const { name, description, rate } = req.body;
    const data = await db.query(
      `INSERT INTO rooms (name, description, rate) VALUES ($1, $2, $3) RETURNING id`,
       [name, description || null, rate]
    );
    res.status(200).json(keysToCamel(data));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Update room data
roomsRouter.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, rate} = req.body;

    const fields = [];
    if (name) fields.push(`name = $(name)`);
    if (description) fields.push(`description = $(description)`);
    if (rate) fields.push(`rate = $(rate)`);

    // Join the fields to form the SET clause
    const setClause = fields.join(", ");

    // If no fields are set, return a 400 error
    if (!setClause) {
      return res.status(400).send("No fields provided to update");
    }

    const data = await db.query(
      `UPDATE rooms
        SET ` +
        setClause +
        `
        WHERE id = $(id)
        RETURNING *`,
        {id, name, description, rate}
    );

    // Verify the Room is valid
    if (data.length === 0) {
      return res.status(404).send("Room not found");
    }

    res.status(200).json(keysToCamel(data));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Delete room with ID
roomsRouter.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const data = await db.query(
      `DELETE FROM rooms WHERE id = $1 RETURNING *`,
      [id]
    );

    if (data.length === 0) {
      return res.status(404).json({ result: "error" });
    }
    res.status(200).json({ result: "success" });
  } catch (err) {
    res.status(500).json({ result: "error" });
  }
});

export { roomsRouter };
