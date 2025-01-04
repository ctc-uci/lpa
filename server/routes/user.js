import { Router } from "express";
import { keysToCamel } from "../common/utils";
import { db } from "../db/db-pgp";

export const usersRouter = Router();

// Get a user by email
usersRouter.get("/email/:email", async (req, res) => {
  try {
    const { email } = req.params;

    const user = await db.query(
      `
        SELECT *
        FROM users
        WHERE email = $1
      `,
      [email,]);

    // User with email not found
    if (!(user.length)) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(keysToCamel(user[0]));

  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Get a user by ID
usersRouter.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const user = await db.query("SELECT * FROM users WHERE id = $1", [id,]);

    if (!(user.length)) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(keysToCamel(user[0]));

  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Create new user, returns new user ID
usersRouter.post("/", async (req, res) => {
  try {
    const { email, firebaseUid, firstName, lastName, editPerms } = req.body;
    const user = await db.query (
      `
        INSERT INTO users (email, firebase_uid, first_name, last_name, edit_perms)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id;
      `,
      [email, firebaseUid, firstName, lastName, editPerms]);
    res.status(200).json(keysToCamel(user[0]));

  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Update a user by ID
usersRouter.put('/:id', async (req, res) => {
  try {
      const { id } = req.params;
      const { email, firstName, lastName, editPerms } = req.body;
      const user = await db.query(
        `
        UPDATE users
        SET
          email = CASE
            WHEN $1 IS NOT NULL THEN $1
            ELSE email
            END,
          first_name = CASE
            WHEN $2 IS NOT NULL THEN $2
            ELSE first_name
            END,
          last_name = CASE
            WHEN $3 IS NOT NULL THEN $3
            ELSE last_name
            END,
          edit_perms = CASE
          WHEN $4 IS NOT NULL THEN $4
          ELSE edit_perms
          END
        WHERE id = $5
        RETURNING *;
        `,
        [email, firstName, lastName, editPerms, id]);
      res.status(200).json(keysToCamel(user[0]));

  } catch (err) {
    res.status(500).send(err.message);
  }
});
