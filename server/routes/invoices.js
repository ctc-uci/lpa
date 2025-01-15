import express from "express";
import { keysToCamel } from "../common/utils";
import { db } from "../db/db-pgp";

const invoicesRouter = express.Router();
invoicesRouter.use(express.json());

invoicesRouter.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    console.log(id);
    // Delete booking from database
    const data = db.query("DELETE FROM invoices WHERE id = $1 RETURNING *", 
      [ id ]);
    
    if (!data) {
      return res.status(404).json({result: 'error'});
    }

    res.status(200).json({result: 'success'});
  } catch (err) {
    res.status(500).send(err.message);
  }
});

export { invoicesRouter };