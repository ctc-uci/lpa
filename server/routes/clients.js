import { Router } from "express";
import { keysToCamel } from "../common/utils";
import { db } from "../db/db-pgp"; // TODO: replace this db with

export const clientsRouter = Router();

// Get all clients
clientsRouter.get("/", async (req, res) => {
  try {
    const users = await db.query(`SELECT * FROM clients ORDER BY id ASC`);

    res.status(200).json(keysToCamel(users));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Get client by id
clientsRouter.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await db.query(`SELECT * FROM clients WHERE id = $1`, [id]);

    // Case when client not found
    if (user.length === 0) {
      return res.status(404).json(keysToCamel("Client not found"));
    }

    res.status(200).json(keysToCamel(user[0]));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Put client by id
clientsRouter.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;
    const updatedClient = await db.query(
      `
      UPDATE clients 
      SET 
        name = $1, 
        email = $2 
      WHERE id = $3 
      RETURNING *
      `, 
      [name, email, id]);

    if (updatedClient.length === 0) {
      return res.status(404).json(keysToCamel("Client not found"));
    }

    res.status(200).json(keysToCamel(updatedClient));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Delete client by id
clientsRouter.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedClient = await db.query('DELETE FROM clients WHERE id = $1 RETURNING *', [id]);

    if (deletedClient.length === 0) {
      return res.status(404).json(keysToCamel({result: "error", message: "Client not found"}));
    }

    res.status(200).json(keysToCamel({result: "success", deletedClient: deletedClient[0]}));
    
  } catch (err) {
    res.status(500).send(err.message);
  }
});

