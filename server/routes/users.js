import { Router } from "express";

import { keysToCamel } from "../common/utils";
import { admin } from "../config/firebase";
import { db } from "../db/db-pgp"; // TODO: replace this db with
import { verifyRole } from "../src/middleware";

export const usersRouter = Router();

// Get all users
usersRouter.get("/", async (req, res) => {
  try {
    const users = await db.query(`SELECT * FROM users ORDER BY id ASC`);

    res.status(200).json(keysToCamel(users));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Get a user by ID
usersRouter.get("/:firebaseUid", async (req, res) => {
  try {
    const { firebaseUid } = req.params;

    const user = await db.query("SELECT * FROM users WHERE firebase_uid = $1", [
      firebaseUid,
    ]);

    res.status(200).json(keysToCamel(user));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Delete a user by ID, both in Firebase and NPO DB
usersRouter.delete("/:firebaseUid", async (req, res) => {
  try {
    const { firebaseUid } = req.params;

    await admin.auth().deleteUser(firebaseUid);
    const user = await db.query("DELETE FROM users WHERE firebase_uid = $1", [
      firebaseUid,
    ]);

    res.status(200).json(keysToCamel(user));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Delete a user by their account ID (not based on Firebase Uid)
usersRouter.delete("/id/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // first delete all associated comments
    await db.query("DELETE FROM comments WHERE user_id = $1", [id]); // theres a foreign key constraint, comments requires a user_id to exist, so must delete all comments associated first
    // then delete the user
    await db.query("DELETE FROM users WHERE id = $1", [id]);

    res.status(200).json({ result: "success" });
  } catch (err) {
    res.status(400).json({ result: "error" });
  }
});

// Create user
usersRouter.post("/create", async (req, res) => {
  try {
    const { email, firebaseUid } = req.body;

    const user = await db.query(
      "INSERT INTO users (email, firebase_uid) VALUES ($1, $2) RETURNING *",
      [email, firebaseUid]
    );

    res.status(200).json(keysToCamel(user));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Update a user by ID
usersRouter.put("/update", async (req, res) => {
  try {
    const { email, firebaseUid } = req.body;

    const user = await db.query(
      "UPDATE users SET email = $1 WHERE firebase_uid = $2 RETURNING *",
      [email, firebaseUid]
    );

    res.status(200).json(keysToCamel(user));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Get all users (as admin)
usersRouter.get("/admin/all", verifyRole("admin"), async (req, res) => {
  try {
    const users = await db.query(`SELECT * FROM users`);

    res.status(200).json(keysToCamel(users));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Update a user's role
usersRouter.put("/update/set-role", verifyRole("admin"), async (req, res) => {
  try {
    const { role, firebaseUid } = req.body;

    const user = await db.query(
      "UPDATE users SET role = $1 WHERE firebase_uid = $2 RETURNING *",
      [role, firebaseUid]
    );

    res.status(200).json(keysToCamel(user));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

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
usersRouter.get("/id/:id", async (req, res) => {
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
      [email, firebaseUid, firstName, lastName, editPerms ?? false]);
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
