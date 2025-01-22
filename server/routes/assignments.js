import { Router } from "express";
import { keysToCamel } from "../common/utils";
import { db } from "../db/db-pgp"; // TODO: replace this db with

export const assignmentsRouter = Router();

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
