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

        let query = `SELECT * FROM bookings WHERE event_id = $1`;
        const params = [id];

        if (start) {
            const [startDate, startTime] = start.split("T");
            query += ` AND (date > $2 OR (date = $2 AND start_time >= $3))`;
            params.push(startDate, startTime);
        }

        if (end) {
            const [endDate, endTime] = end.split("T");
            if (params.length === 0) {
                query += ` AND (date < $2 OR (date = $2 AND end_time <= $3))`;
            } else {
                query += ` AND (date < $4 OR (date = $4 AND end_time <= $5))`;
            }
            params.push(endDate, endTime);
        }

        const data = await db.query(query, params);
        
        res.status(200).json(keysToCamel(data));
    } catch (err) {
        res.status(500).send(err.message);
    }
});