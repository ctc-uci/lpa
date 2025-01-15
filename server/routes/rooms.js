import express from "express";
import { db } from "../db/db-pgp";
import { keysToCamel } from "../common/utils";

const roomsRouter = express.Router();
roomsRouter.use(express.json());

roomsRouter.get("/", async (req, res) => {
  try {
    const data = await db.query(`SELECT * FROM rooms`);
    res.status(200).json(keysToCamel(data));
} catch (err) {
    res.status(500).send(err.message);
}
});



export { roomsRouter };

