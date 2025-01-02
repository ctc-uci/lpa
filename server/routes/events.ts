import express from "express";
import { db } from "../db/db-pgp";
import { keysToCamel } from "../common/utils";

export const eventsRouter = express.Router();
eventsRouter.use(express.json());

// eventsRouter.get("/", async (req, res) => {
//   try {
//     const data = await db.query(`SELECT * FROM events`);
//     res.status(200).json(keysToCamel(data));
//   } catch (err) {
//     res.status(500).send(err.message);
//   }
// });

eventsRouter.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = await db.query(`DELETE FROM events WHERE id = $1`, [id]);
    res.status(200).json(keysToCamel(data));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

