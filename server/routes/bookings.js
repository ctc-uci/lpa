import express from "express";
import { db } from "../db/db-pgp";
import { keysToCamel } from "../common/utils";

const bookingsRouter = express.Router();
bookingsRouter.use(express.json());

bookingsRouter.get("/", async (req, res) => {
  try {
    const { start, end } = req.query;

    let query = `SELECT * FROM bookings`;
    const params = [];

    if (start) {
      const [startDate, startTime] = start.split("T");
      query += ` WHERE (date > $1 OR (date = $1 AND start_time >= $2))`;
      params.push(startDate, startTime);
    }

    if (end) {
      const [endDate, endTime] = end.split("T");
      if (params.length === 0) {
        query += ` WHERE (date < $1 OR (date = $1 AND end_time <= $2))`;
      } else {
        query += ` AND (date < $3 OR (date = $3 AND end_time <= $4))`;
      }
      params.push(endDate, endTime);
    }

    const data = await db.query(query, params);

    res.status(200).json(keysToCamel(data));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

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
      if (params.length === 1) {
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

bookingsRouter.post("/", async (req, res) => {
  try {
    // Get new booking data
    const { event_id, room_id, start_time, end_time, date, archived } = req.body;

    // Insert new booking into database
    const data = await db.query(
        `INSERT INTO bookings (event_id, room_id, start_time, end_time, date, archived) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
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

      const { event_id, room_id, start_time, end_time, date, archived } = req.body;
      
      // Update booking in database
      const data = await db.query(
        `
        UPDATE bookings
        SET 
            event_id = COALESCE($1, event_id), 
            room_id = COALESCE($2, room_id), 
            start_time = COALESCE($3, start_time), 
            end_time = COALESCE($4, end_time),
            date = COALESCE($5, date),
            archived = COALESCE($6, archived)
        WHERE id = $7
        RETURNING *;
        `,
        [event_id, room_id, start_time, end_time, date, archived, id]
    );
  
      res.status(200).json(keysToCamel(data));
    } catch (err) {
      res.status(500).send(err.message);
    }
  });

  
bookingsRouter.delete("/:id", async (req, res) => {
    try {
      const { id } = req.params;

      // Delete booking from database
      const data = db.query("DELETE FROM bookings WHERE id = $1 RETURNING *", 
        [ id ]);
      
      if (!data) {
        return res.status(404).json({result: 'error'});
      }
  
      res.status(200).json({result: 'success'});
    } catch (err) {
      res.status(500).send(err.message);
    }
  });
  
export { bookingsRouter };
