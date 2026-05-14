import express, { Router } from "express";



import { keysToCamel } from "../common/utils";
import { db } from "../db/db-pgp"; // TODO: replace this db with
import { syncPaymentStatusesForInvoice } from "./utils/invoicePaymentAllocation.js";


const commentsRouter = Router();
commentsRouter.use(express.json());

commentsRouter.get("/", async (req, res) => {
  try {
    const data = await db.query("SELECT * FROM comments");

    res.status(200).json(keysToCamel(data));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

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

const formatAdjustmentFee = (adjustmentType, val) => {
  if (adjustmentType === "rate_percent")  return val > 0 ? `+${val}%` : `-${Math.abs(val)}%`;
  if (adjustmentType === "rate_flat") return val > 0 ? `+$${val}` : `-$${Math.abs(val)}`;
  return null;
};

commentsRouter.get("/invoice/sessions/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // First, get all sessions for the invoice (with or without comments)
    const query = `SELECT 
                   COALESCE(comments.id, 0) as comment_id,
                   COALESCE(comments.user_id, 0) as user_id,
                   bookings.id as booking_id,
                   invoices.id as invoice_id,
                   COALESCE(comments.datetime, bookings.date) as datetime,
                   COALESCE(comments.comment, '') as comment,
                   COALESCE(comments.adjustment_type, 'none') as adjustment_type,
                   COALESCE(comments.adjustment_value, 0) as adjustment_value,
                   bookings.start_time,
                   bookings.end_time,
                   bookings.date as booking_date,
                   rooms.name,
                   rooms.rate
                FROM invoices
                JOIN bookings ON bookings.event_id = invoices.event_id
                JOIN rooms ON bookings.room_id = rooms.id
                LEFT JOIN comments ON comments.booking_id = bookings.id AND comments.invoice_id = invoices.id
                WHERE invoices.id = $1 
                AND bookings.date BETWEEN invoices.start_date AND invoices.end_date
                ORDER BY bookings.id, comments.id`;

    
    const queryParams = [id];

    const data = await db.query(query, queryParams);
    const comments = keysToCamel(data);



    const groupedComments = {};

    comments.forEach((comment) => {
      const bookingId = comment.bookingId;
      
      // Initialize the session group if it doesn't exist
      if (!groupedComments[bookingId]) {

        groupedComments[bookingId] = {
          ...comment,
          comments: [],
          adjustmentValues: [],
          total : []
        };

        if (comment.commentId && comment.comment && comment.adjustmentType === "none") {
          groupedComments[bookingId].comments.push({
            id: comment.commentId,
            comment: comment.comment,
          });

        }
        
        // Only add adjustment value if type is not "none" and comment exists
        if (comment.commentId && comment.adjustmentType !== "none" && comment.adjustmentType !== "total") {
          groupedComments[bookingId].adjustmentValues.push({
            id: comment.commentId,
            type: comment.adjustmentType,
            value: comment.adjustmentValue
          });
        }

        if(comment.commentId && comment.adjustmentType === "total"){
          groupedComments[bookingId].total.push({
            id: comment.commentId,
            value: comment.adjustmentValue,
            comment: comment.comment,
            date: comment.datetime
          })
        }
        
      } else {
        // Add comment if it's not empty and has a valid commentId
        if (comment.commentId && comment.comment && comment.adjustmentType === "none") {
          groupedComments[bookingId].comments.push({
            id: comment.commentId,
            comment: comment.comment,
          });

        }

        // Add adjustment value if not already included and type is not "none"
        if (comment.commentId && comment.adjustmentType !== "none" && comment.adjustmentType !== "total") {
          const adjustmentExists = groupedComments[bookingId].adjustmentValues.some(
            adj => adj.id === comment.commentId || 
                  (adj.type === comment.adjustmentType && 
                   adj.value === comment.adjustmentValue)
          );
          
          if (!adjustmentExists) {
            groupedComments[bookingId].adjustmentValues.push({
              id: comment.commentId,
              type: comment.adjustmentType,
              value: comment.adjustmentValue
            });
          }
        }

        if(comment.commentId && comment.adjustmentType === "total"){
          groupedComments[bookingId].total.push({
            id: comment.commentId,
            value: comment.adjustmentValue,
            comment: comment.comment,
            date: comment.datetime
          })
        }
      }

      // Clean up unnecessary fields
      delete groupedComments[bookingId].adjustmentType;
      delete groupedComments[bookingId].adjustmentValue;
      delete groupedComments[bookingId].comment;
      delete groupedComments[bookingId].commentId;
    });

    // if(Object.keys(groupedComments).length === 0){
    //   const query = `SELECT bookings.id as booking_id, 
    //                 invoices.id as invoice_id, 
    //                 rooms.id as room_id, 
    //                 rooms.name, rooms.rate, bookings.date as booking_date, bookings.start_time as start_time, bookings.end_time as end_time
    //                 FROM bookings, invoices, rooms 
    //                 WHERE bookings.event_id = invoices.event_id 
    //                 AND invoices.id = $1 
    //                 AND bookings.date BETWEEN invoices.start_date 
    //                 AND invoices.end_date 
    //                 AND bookings.room_id = rooms.id`;
    //   const data = await db.query(query, [id]);
    //   const bookings = keysToCamel(data);

    //   for(const booking of bookings){
    //     groupedComments[booking.bookingId] = {
    //       adjustmentValues: [],
    //       comments: [],
    //       bookingId: booking.bookingId,
    //       bookingDate: booking.bookingDate,
    //       endTime: booking.endTime,
    //       startTime: booking.startTime,
    //       name: booking.name,
    //       rate: booking.rate,
    //       total : []
    //     };
    //   }
    // }


    // const totalQuery = `SELECT comments.id as comment_id,
    //                comments.user_id,
    //                comments.invoice_id,
    //                comments.datetime,
    //                comments.comment,
    //                comments.adjustment_type,
    //                comments.adjustment_value,
    //                invoices.start_date
    //             FROM comments
    //             JOIN invoices ON comments.invoice_id = invoices.id
    //             WHERE comments.invoice_id = $1 AND comments.adjustment_type = 'total' AND comments.booking_id IS NULL`;
    // const total = await db.query(totalQuery, queryParams);
    // const totalComments = keysToCamel(total);
    // console.log("totalComments", totalComments);
    
    // for (const comment of totalComments) {
    //   groupedComments[`total-${comment.commentId}`] = {
    //     comments: [],
    //     userId: comment.userId,
    //     bookingId: null,
    //     invoiceId: comment.invoiceId,
    //     datetime: comment.datetime,
    //     bookingDate: comment.startDate,
    //     adjustmentValues: [],
    //     startTime: '00:00:00+00',
    //     endTime: '01:00:00+00',
    //     name: "",
    //     rate: 0,
    //     total: [{
    //       id: comment.commentId,
    //       value: comment.adjustmentValue,
    //       comment: comment.comment,
    //       date: comment.datetime
    //     }],
        
    //   };
      
    // }
    
    res.status(200).json(Object.values(groupedComments));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

commentsRouter.get("/invoice/summary/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { includeNoBooking } = req.query;

    const query = `SELECT comments.id as comment_id,
                   comments.user_id,
                   comments.booking_id,
                   comments.invoice_id,
                   comments.datetime,
                   comments.comment,
                   comments.adjustment_type,
                   comments.adjustment_value
                FROM comments
                WHERE comments.invoice_id = $1 
                AND (comments.adjustment_type = 'rate_percent' or comments.adjustment_type = 'rate_flat' or comments.adjustment_type = 'total')
                AND comments.booking_id IS NULL
                ORDER BY comments.id`;
    const queryParams = [id];

    const data = await db.query(query, queryParams);
    const comments = keysToCamel(data);
    const groupedComments = {};

    comments.forEach((comment) => {
      // Skip comments with adjustment type "none" or "total" for the main summary
      // if (comment.adjustmentType === "none" || comment.adjustmentType === "total") {
        // For "total" adjustments, still create a separate entry
        
        
        // if (comment.adjustmentType === "total") {
        //   const totalKey = `summary-total-${comment.commentId}`;
        //   groupedComments[totalKey] = {
        //     ...comment,
        //     comments: comment.comment ? [comment.comment] : [],
        //     adjustmentValues: [{
        //       id: comment.commentId,
        //       type: comment.adjustmentType,
        //       value: comment.adjustmentValue
        //     }]
        //   };
          
        //   // Clean up unnecessary fields
        //   delete groupedComments[totalKey].adjustmentType;
        //   delete groupedComments[totalKey].adjustmentValue;
        //   delete groupedComments[totalKey].comment;
        //   delete groupedComments[totalKey].commentId;
        // }
        
      //   // Skip further processing for both "none" and "total"
      //   return;
      // }

      
      const bookingId = comment.bookingId || 'summary';
      
      // Initialize the session group if it doesn't exist
      if (!groupedComments[bookingId]) {
        groupedComments[bookingId] = {
          ...comment,
          comments: [],
          adjustmentValues: [],
          total: []
        };

        if (comment.adjustmentType !== "total") {
          groupedComments[bookingId].adjustmentValues.push({
            id: comment.commentId,
            type: comment.adjustmentType,
            value: comment.adjustmentValue
          });
        }

        if(comment.adjustmentType === "total"){
          groupedComments[bookingId].total.push({
            id: comment.commentId,
            value: comment.adjustmentValue,
            comment: comment.comment,
            date: comment.datetime
          })
        }
      } else {
        // Add comment if it's not empty
        // if (comment.comment && comment.adjustmentType !== "total") {
        //   groupedComments[bookingId].comments.push(comment.comment);
        // }

        // Add adjustment value if not already included
        const adjustmentExists = groupedComments[bookingId].adjustmentValues.some(
          adj => adj.id === comment.commentId || 
                (adj.type === comment.adjustmentType && 
                 adj.value === comment.adjustmentValue)
        );
        
        if (!adjustmentExists && comment.adjustmentType !== "total") {
          groupedComments[bookingId].adjustmentValues.push({
            id: comment.commentId,
            type: comment.adjustmentType,
            value: comment.adjustmentValue
          });
        }

        if(comment.adjustmentType === "total"){
          groupedComments[bookingId].total.push({
            id: comment.commentId,
            value: comment.adjustmentValue,
            comment: comment.comment,
            date: comment.datetime
          })
        }
      }

      // Clean up unnecessary fields
      delete groupedComments[bookingId].adjustmentType;
      delete groupedComments[bookingId].adjustmentValue;
      delete groupedComments[bookingId].comment;
      delete groupedComments[bookingId].commentId;
    });
    
    res.status(200).json(Object.values(groupedComments));
  } catch (err) {
    res.status(500).send(err.message);
  }
});



commentsRouter.get("/paidInvoices/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = await db.query(
      "SELECT * FROM comments WHERE invoice_id = $1 and adjustment_type = 'paid'",
      [id]
    );

    res.status(200).json(keysToCamel(data));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Get all comments details
commentsRouter.get("/details/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = await db.query(
      `
      SELECT * FROM comments
      JOIN bookings ON comments.booking_id = bookings.id
      JOIN rooms ON rooms.id = bookings.room_id
      WHERE invoice_id = $1
      `,
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

    const updated = data[0];
    if (updated.adjustment_type === "paid" && updated.invoice_id) {
      await syncPaymentStatusesForInvoice(db, updated.invoice_id);
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

    const currentDatetime = datetime || new Date().toISOString();

    // Insert new comment
    const inserted_row = await db.query(
      `INSERT INTO comments (user_id, booking_id, invoice_id, datetime, comment, adjustment_type, adjustment_value) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id;`,
      [
        user_id,
        booking_id ?? null,
        invoice_id,
        currentDatetime,
        comment,
        adjustment_type,
        adjustment_value,
      ]
    );

    if (adjustment_type === "paid" && invoice_id) {
      await syncPaymentStatusesForInvoice(db, invoice_id);
    }

    res.status(200).json(keysToCamel(inserted_row));
  } catch (err) {
    console.error(`Error in POST /comments: ${err.message}`);
    res.status(500).send(err.message);
  }
});

// Delete comment with ID
commentsRouter.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Delete and return the comment
    const comment = await db.query(
      `DELETE FROM comments WHERE id = $1 RETURNING *`,
      [id]
    );

    if (comment.length === 0) {
      return res.status(404).json({ result: "error" });
    }

    if (comment[0].adjustment_type === "paid" && comment[0].invoice_id) {
      await syncPaymentStatusesForInvoice(db, comment[0].invoice_id);
    }

    res.status(200).json({ result: "success", deletedComment: comment });
  } catch (err) {
    console.error(`Error deleting comment: ${err.message}`);
    res.status(500).json({ result: "error", message: err.message });
  }
});

// Delete comment with booking ID
commentsRouter.delete("/booking/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Delete and return the comments
    const comments = await db.query(
      `DELETE FROM comments WHERE booking_id = $1 RETURNING *`,
      [id]
    );

    if (comments.length === 0) {
      return res.status(404).json({ result: "error" });
    }

    // Check if any of the deleted comments were payments
    const paymentComments = comments.filter(
      (c) => c.adjustment_type === "paid"
    );

    // Get unique invoice IDs from payment comments
    const invoiceIds = [...new Set(paymentComments.map((c) => c.invoice_id))];

    for (const invoice_id of invoiceIds) {
      await syncPaymentStatusesForInvoice(db, invoice_id);
    }

    res.status(200).json({ result: "success", deletedComments: comments });
  } catch (err) {
    console.error(`Error deleting comments for booking: ${err.message}`);
    res.status(500).json({ result: "error", message: err.message });
  }
});

// Get the flat_rate or rate_percent comments for program and
commentsRouter.get("/program-invoice/:programId/:invoiceId", async(req, res) => {
  try {
    const { programId, invoiceId } = req.params;
    const programAdjustments = await db.query (
      `SELECT * FROM comments C
        JOIN invoices I ON I.id = $1
        WHERE I.event_id = $2
        AND C.adjustment_type in ('rate_flat', 'rate_percent')
        AND C.booking_id IS NULL`,
        [invoiceId, programId]
    );
    res.status(200).json(keysToCamel(programAdjustments));
  } catch (err) {
    console.error(`Error fetching program adjustments for invoice: ${err.message}`);
    res.status(500).json({ result: "error", message: err.message });
  }
});

export { commentsRouter };
