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
            const startTimeDateArray = start.split("T");
            const endTimeDateArray = end.split("T");
            
            //if start and end dates are different days
            if(startTimeDateArray[0] !== endTimeDateArray[0]) {
                throw new Error("start and end dates are different");
            }

            const date = startTimeDateArray[0];
            const startTime = startTimeDateArray[1].substring(0, startTimeDateArray[1].length-1);
            const endTime = endTimeDateArray[1].substring(0, endTimeDateArray[1].length-1);

            data = await db.query(`SELECT * FROM bookings WHERE event_id = $1 AND date = $2 AND start_time = $3 AND end_time = $4`, [
                id,
                date,
                startTime,
                endTime,
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