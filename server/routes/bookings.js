import express, { Router } from "express";
import { db } from "../db/db-pgp";
import { keysToCamel } from "../common/utils";

const bookingsRouter = Router();
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

bookingsRouter.get("/displayData/:id", async (req, res) => {
  try {
      const { id } = req.params;
      const data = await db.query(`SELECT *, events.name as eventName, events.description as eventDescription, rooms.name as roomName, rooms.description as roomDescription, assignments.role as clientRole, clients.name as clientName
        FROM bookings
        JOIN events ON events.id = bookings.event_id
        JOIN rooms ON bookings.room_id = rooms.id
        JOIN assignments ON bookings.event_id = assignments.event_id
        JOIN clients ON assignments.client_id = clients.id
        WHERE bookings.id = $1`, [
          id
      ]);
      res.status(200).json(keysToCamel(data));
  } catch (err) {
      res.status(500).send(err.message);
  }
});

bookingsRouter.get("/byEvent/:id", async (req, res) => {
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

bookingsRouter.get("/rooms/event/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { start, end } = req.query;

    let query = `SELECT b.id AS booking_id, r.id as room_id, * FROM bookings b, rooms r WHERE r.id = b.room_id AND event_id = $1`;
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

    query += " ORDER BY date ASC";

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
        `INSERT INTO bookings (event_id, room_id, start_time, end_time, date, archived) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
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

bookingsRouter.put("/event/:id", async (req, res) => {
    try {
      const { id } = req.params;

      const { event_id, room_id, start_time, end_time, date, archived, description } = req.body;
      console.log("description: " + description);
      const data2 = await db.query( `
        UPDATE events
        SET description = COALESCE($2, description)
        WHERE id = $1
        RETURNING *;
        `,
        [event_id, description]
    );

      // Update booking in database
      const data = await db.query(
        `
        UPDATE bookings
        SET
            room_id = COALESCE($1, room_id),
            start_time = COALESCE($2, start_time),
            end_time = COALESCE($3, end_time),
            date = COALESCE($4, date),
            archived = COALESCE($5, archived)
        WHERE id = $6
        RETURNING *;
        `,
        [room_id, start_time, end_time, date, archived, id]
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
      const data = await db.query("DELETE FROM bookings WHERE id = $1 RETURNING *",
        [ id ]);

      if (!data) {
        return res.status(404).json({result: 'error'});
      }

      res.status(200).json({result: 'success'});
    } catch (err) {
      res.status(500).send(err.message);
    }
  });

bookingsRouter.delete("/event/:id", async (req, res) => {
    try {
      const { id } = req.params;

      // Delete all bookings from database for a given event
      const data = await db.query("DELETE FROM bookings WHERE event_id = $1 RETURNING *",
        [ id ]);

      if (!data) {
        return res.status(404).json({result: 'error'});
      }

      res.status(200).json({result: 'success'});
    } catch (err) {
      res.status(500).send(err.message);
    }
  });

// Batch archive endpoint
bookingsRouter.post("/batch/archive", async (req, res) => {
  try {
    const { sessionIds } = req.body;

    if (!sessionIds || !Array.isArray(sessionIds) || sessionIds.length === 0) {
      return res.status(400).json({
        result: 'error',
        message: 'Invalid or empty sessionIds array'
      });
    }

    // Create a parameterized query with multiple placeholders
    const placeholders = sessionIds.map((_, index) => `$${index + 1}`).join(',');

    // Update all specified bookings in a single query
    const query = `UPDATE bookings SET archived = TRUE WHERE id IN (${placeholders}) RETURNING *`;

    const data = await db.query(query, sessionIds);

    res.status(200).json({
      result: 'success',
      message: `${data.length} sessions archived successfully`,
      data: keysToCamel(data)
    });
  } catch (err) {
    res.status(500).json({
      result: 'error',
      message: err.message
    });
  }
});

// Batch delete endpoint
bookingsRouter.delete("/batch/delete", async (req, res) => {
  try {
    const { sessionIds } = req.body;

    console.log("session IDS from bookings router", sessionIds);

    if (!sessionIds || !Array.isArray(sessionIds) || sessionIds.length === 0) {
      return res.status(400).json({
        result: 'error',
        message: 'Invalid or empty sessionIds array'
      });
    }

    // Create a parameterized query with multiple placeholders
    const placeholders = sessionIds.map((_, index) => `$${index + 1}`).join(',');

    // Delete all specified bookings in a single query
    const query = `DELETE FROM bookings WHERE id IN (${placeholders}) RETURNING *`;

    const data = await db.query(query, sessionIds);

    res.status(200).json({
      result: 'success',
      message: `${data.length} sessions deleted successfully`,
      data: keysToCamel(data)
    });
  } catch (err) {
    res.status(500).json({
      result: 'error',
      message: err.message
    });
  }
});

// Batch operation for a specific event's bookings
bookingsRouter.post("/event/:eventId/batch/archive", async (req, res) => {
  try {
    const { eventId } = req.params;

    // Archive all bookings for a specific event
    const query = `UPDATE bookings SET archived = TRUE WHERE event_id = $1 RETURNING *`;

    const data = await db.query(query, [eventId]);

    res.status(200).json({
      result: 'success',
      message: `${data.length} sessions archived for event ${eventId}`,
      data: keysToCamel(data)
    });
  } catch (err) {
    res.status(500).json({
      result: 'error',
      message: err.message
    });
  }
});

export { bookingsRouter };
