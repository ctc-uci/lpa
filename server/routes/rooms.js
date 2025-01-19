import express, { Router } from "express";
import { keysToCamel } from "../common/utils";
import { db } from "../db/db-pgp"; // TODO: replace this db with

const roomsRouter = Router();
roomsRouter.use(express.json());

roomsRouter.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = await db.query("SELECT * FROM rooms WHERE id = $1", [id]);

    res.status(200).json(keysToCamel(data));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

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
        [id, name, description, rate]
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