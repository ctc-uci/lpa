import express from "express";

import { keysToCamel } from "../common/utils";
import {db} from "../db/db-pgp";

const commentsRouter = express.Router();
commentsRouter.use(express.json());

commentsRouter.get("/:id", async (req, res) => {
    try {
        const {id} = req.params;
        const data = await db.query("SELECT * FROM comments WHERE id = $1", [id]);

        res.status(200).json(keysToCamel(data));
    } catch (err) {
        res.status(500).send(err.message);
    }
});

commentsRouter.get("/invoice/:id", async (req, res) => {
    try {
        const {id} = req.params;
        const data = await db.query("SELECT * FROM comments WHERE invoice_id = $1", [id]);

        res.status(200).json(keysToCamel(data));
    } catch (err) {
        res.status(500).send(err.message);
    }
});

commentsRouter.get("/booking/:id", async (req, res) => {
    try {
        const {id} = req.params;
        const data = await db.query("SELECT * FROM comments WHERE booking_id = $1", [id]);
        
        res.status(200).json(keysToCamel(data));
    } catch (err) {
        res.status(500).send(err.message);
    }
});

export { commentsRouter };
