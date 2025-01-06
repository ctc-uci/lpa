import express from "express";
import { db } from "../db/db-pgp";
import { keysToCamel } from "../common/utils";

const bookingsRouter = express.Router();
bookingsRouter.use(express.json());

bookingsRouter.get("/", async (req, res) => {
  try {
    // Get bookings from database
    const { start, end } = req.query;

    let data;
    // If start and end are not provided, get bookings for whatever we have, or just return all bookings if no query params
    if (start && end) 
    {
        data = await db.query(`SELECT * FROM bookings WHERE start_time = $1 AND end_time = $2`, 
            [ start, end ]
          );
    }
    else if (start)
    {
        data = await db.query(`SELECT * FROM bookings WHERE start_time = $1`, 
            [ start ]
          );
    }
    else if (end)
    {
        data = await db.query(`SELECT * FROM bookings WHERE end_time = $1`, 
            [ end ]
        );
    }
    else
    {
        data = await db.query(`SELECT * FROM bookings`);
    }

    res.status(200).json(keysToCamel(data));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

bookingsRouter.post("/", async (req, res) => {
  try {
    // Get new booking data
    const { event_id, room_id, start_time, end_time, date, archived } = req.body;

    // Insert new booking into database
    const data = await db.query(
        `INSERT INTO bookings (event_id, room_id, start_time, end_time, date, archived) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [ event_id, room_id, start_time, end_time, date, archived ]
      );

    res.status(200).json(keysToCamel(data));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

bookingsRouter.put("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      // TODO: Update booking in database
      const data = {};
  
      res.status(200).json(keysToCamel(data));
    } catch (err) {
      res.status(500).send(err.message);
    }
  });

  
bookingsRouter.delete("/:id", async (req, res) => {
    try {
      const { id } = req.params;

      // Delete booking from database
      const data = db.query("DELETE FROM bookings WHERE id = $1", 
        [ id ]);
  
      res.status(200).json(keysToCamel(data));
    } catch (err) {
      res.status(500).send(err.message);
    }
  });
  
export { bookingsRouter };