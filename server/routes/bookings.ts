import express from "express";

import { db } from "../db/db-pgp";
import { keysToCamel } from "../common/utils";

export const bookingsRouter = express.Router();
bookingsRouter.use(express.json());

bookingsRouter.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const data = await db.query(`SELECT * FROM bookings WHERE id = $1`, [
            id
        ]);
        res.status(200).json(keysToCamel(data));
    } catch (err) {
        res.status(500).send(err.message);
    }
});

bookingsRouter.get("/event/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { start, end } = req.query;

        let data;
        if (start && end) 
        {
            data = await db.query(`SELECT * FROM bookings WHERE event_id = $1 AND start_time = $2 AND end_time = $3`, [
                id,
                start,
                end
            ]);
        }
        else if (!(start && end))
        {
            data = await db.query(`SELECT * FROM bookings WHERE event_id = $1`, [
                id
            ]);
        } 
        res.status(200).json(keysToCamel(data));
    } catch (err) {
        res.status(500).send(err.message);
    }
});