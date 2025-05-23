import express, { Router } from "express";

import { keysToCamel } from "../common/utils";
import { db } from "../db/db-pgp"; // TODO: replace this db with

const clientsRouter = Router();
clientsRouter.use(express.json());

// Get all clients
clientsRouter.get("/", async (req, res) => {
  try {
    const users = await db.query(`SELECT * FROM clients ORDER BY id ASC`);

    res.status(200).json(keysToCamel(users));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

const generateWhereClause = (search, columns) => {
  // const columns = ["name"]; // You want to search the client name
  let searchWhereClause = "";

  if (search.length > 0) {
    searchWhereClause = ` WHERE `;
    // Generate the condition for searching through client names
    searchWhereClause += columns
      .map((column) => {
        return `CAST(${column} AS TEXT) ILIKE '%' || $1 || '%'`;
      })
      .join(" OR ");
  }
  return { searchWhereClause };
};

// Get client that matches a search parameter
clientsRouter.get("/search", async (req, res) => {
  try {
    const { searchTerm, columns } = req.query;
    console.log("searchTerm", searchTerm);
    const search = searchTerm.split("+").join(" ");
    const { searchWhereClause } = generateWhereClause(search, columns);

    const query = `
      SELECT DISTINCT *
      FROM clients
      ${searchWhereClause};
    `;

    // Execute the query and pass the search term for the placeholder
    const result = await db.query(query, [search]);

    res.status(200).send(result);
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

    // Update just the name or just the email, without having to provide both fields
    const updatedClient = await db.query(
      `
      UPDATE clients
      SET
        name = COALESCE($1, name),
        email = COALESCE($2, email)
      WHERE id = $3
      RETURNING *
      `,
      [name, email, id]
    );

    if (updatedClient.length === 0) {
      return res.status(404).json(keysToCamel("Client not found"));
    }

    res.status(200).json(keysToCamel(updatedClient));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Create new client
clientsRouter.post("/", async (req, res) => {
  try {
    const { name, email } = req.body;
    const users = await db.query(
      `INSERT INTO clients (name, email) VALUES ($1, $2) RETURNING id`,
      [name, email]
    );
    res.status(200).json(keysToCamel(users));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Delete client by id
clientsRouter.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedClient = await db.query(
      "DELETE FROM clients WHERE id = $1 RETURNING *",
      [id]
    );

    if (deletedClient.length === 0) {
      return res
        .status(404)
        .json(keysToCamel({ result: "error", message: "Client not found" }));
    }

    res
      .status(200)
      .json(
        keysToCamel({ result: "success", deletedClient: deletedClient[0] })
      );
  } catch (err) {
    res.status(500).send(err.message);
  }
});

export { clientsRouter };
