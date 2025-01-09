import { Router } from "express";

import { keysToCamel } from "../common/utils";
import { admin } from "../config/firebase";
import { db } from "../db/db-pgp"; // TODO: replace this db with
import { verifyRole } from "../src/middleware";

export const usersRouter = Router();

// Get all users
// usersRouter.get("/", async (req, res) => {
//   try {
//     const users = await db.query(`SELECT * FROM users ORDER BY id ASC`);

//     res.status(200).json(keysToCamel(users));
//   } catch (err) {
//     res.status(400).send(err.message);
//   }
// });

// Get a user by ID
// usersRouter.get("/:firebaseUid", async (req, res) => {
//   try {
//     const { firebaseUid } = req.params;

//     const user = await db.query("SELECT * FROM users WHERE firebase_uid = $1", [
//       firebaseUid,
//     ]);

//     res.status(200).json(keysToCamel(user));
//   } catch (err) {
//     res.status(400).send(err.message);
//   }
// });

// Delete a user by ID, both in Firebase and NPO DB

// IGNORE THIS FOR NOW

// usersRouter.delete("/users/:firebaseUid", async (req, res) => {
//   try {
//     const { firebaseUid } = req.params;

//     if (firebaseUid) {
//       await admin.auth().deleteUser(firebaseUid);
//     } else {
//       throw new Error("firebaseUid is undefined");
//     }
    
//     const user = await db.query("DELETE FROM users WHERE firebase_uid = $1", [
//       firebaseUid,
//     ]);

//     res.status(200).json(keysToCamel(user));
//   } catch (err) {
//     res.status(400).send(err.message);
//   }
// });

// Delete a user by their account ID (not based on Firebase Uid)
usersRouter.delete("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await db.query("DELETE FROM users WHERE id = $1", [id]);

    res.status(200).send(`ID ${id} deleted from the users table`);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Create user
// usersRouter.post("/create", async (req, res) => {
//   try {
//     const { email, firebaseUid } = req.body;

//     const user = await db.query(
//       "INSERT INTO users (email, firebase_uid) VALUES ($1, $2) RETURNING *",
//       [email, firebaseUid]
//     );

//     res.status(200).json(keysToCamel(user));
//   } catch (err) {
//     res.status(500).send(err.message);
//   }
// });

// Update a user by ID
// usersRouter.put("/update", async (req, res) => {
//   try {
//     const { email, firebaseUid } = req.body;

//     const user = await db.query(
//       "UPDATE users SET email = $1 WHERE firebase_uid = $2 RETURNING *",
//       [email, firebaseUid]
//     );

//     res.status(200).json(keysToCamel(user));
//   } catch (err) {
//     res.status(400).send(err.message);
//   }
// });

// Get all users (as admin)
// usersRouter.get("/admin/all", verifyRole("admin"), async (req, res) => {
//   try {
//     const users = await db.query(`SELECT * FROM users`);

//     res.status(200).json(keysToCamel(users));
//   } catch (err) {
//     res.status(400).send(err.message);
//   }
// });

// Update a user's role
// usersRouter.put("/update/set-role", verifyRole("admin"), async (req, res) => {
//   try {
//     const { role, firebaseUid } = req.body;

//     const user = await db.query(
//       "UPDATE users SET role = $1 WHERE firebase_uid = $2 RETURNING *",
//       [role, firebaseUid]
//     );

//     res.status(200).json(keysToCamel(user));
//   } catch (err) {
//     res.status(400).send(err.message);
//   }
// });
