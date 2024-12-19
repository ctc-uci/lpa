import { Router } from "express";
import { keysToCamel } from "../common/utils";
import { db } from "../db/db-pgp"; // TODO: replace this db with

export const clientsRouter = Router();

// Get all comments
clientsRouter.get("/", async (req, res) => {
  try {
    const users = await db.query(`SELECT * FROM clients ORDER BY id ASC`);

    res.status(200).json(keysToCamel(users));
  } catch (err) {
    res.status(400).send(err.message);
  }
});
