import { Router } from "express";
import { keysToCamel } from "../common/utils";
import { db } from "../db/db-pgp"; // TODO: replace this db with

const commentsRouter = Router();

commentsRouter.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = await db.query("SELECT * FROM comments WHERE id = $1", [id]);

    res.status(200).json(keysToCamel(data));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

commentsRouter.get("/invoice/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = await db.query(
      "SELECT * FROM comments WHERE invoice_id = $1",
      [id]
    );

    res.status(200).json(keysToCamel(data));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

commentsRouter.get("/booking/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = await db.query(
      "SELECT * FROM comments WHERE booking_id = $1",
      [id]
    );

    res.status(200).json(keysToCamel(data));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Delete comment with ID
commentsRouter.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await db.query(
      `DELETE FROM comments WHERE id = $1 RETURNING *`,
      [id]
    );

    if (comment.length === 0) {
      return res.status(404).json({ result: "error" });
    }

    res.status(200).json({ result: "success", deletedComment: comment });
  } catch (err) {
    res.status(500).json({ result: "error", message: err.message });
  }
});

// Update a comment by ID
commentsRouter.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      user_id,
      booking_id,
      invoice_id,
      datetime,
      comment,
      adjustment_type,
      adjustment_value,
    } = req.body;

    const fields = [];
    if (user_id) fields.push(`user_id = $(user_id)`);
    if (booking_id) fields.push(`booking_id = $(booking_id)`);
    if (invoice_id) fields.push(`invoice_id = $(invoice_id)`);
    if (datetime) fields.push(`datetime = $(datetime)`);
    if (comment) fields.push(`comment = $(comment)`);
    if (adjustment_type) fields.push(`adjustment_type = $(adjustment_type)`);
    if (adjustment_value) fields.push(`adjustment_value = $(adjustment_value)`);

    // Join the fields to form the SET clause
    const setClause = fields.join(", ");

    // If no fields are set, return a 400 error
    if (!setClause) {
      return res.status(400).send("No fields provided to update");
    }

    const data = await db.query(
      `UPDATE comments
        SET ` +
        setClause +
        `
        WHERE id = $(id)
        RETURNING *`,
      {
        id,
        user_id,
        booking_id,
        invoice_id,
        datetime,
        comment,
        adjustment_type,
        adjustment_value,
      }
    );

    // Verify the comment is valid
    if (data.length === 0) {
      return res.status(404).send("Comment not found");
    }

    res.status(200).json(keysToCamel(data));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Create comment
commentsRouter.post("/", async (req, res) => {
  try {
    const {
      user_id,
      booking_id,
      invoice_id,
      datetime,
      comment,
      adjustment_type,
      adjustment_value,
    } = req.body;

    // Insertnew
    const inserted_row = await db.query(
      `INSERT INTO comments (user_id, booking_id, invoice_id, datetime, comment, adjustment_type, adjustment_value) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id;`,
      [
        user_id,
        booking_id ?? null,
        invoice_id,
        datetime,
        comment,
        adjustment_type,
        adjustment_value,
      ]
    );

    res.status(200).json(keysToCamel(inserted_row));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

export { commentsRouter };
