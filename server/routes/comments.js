import express, { Router } from "express";



import { keysToCamel } from "../common/utils";
import { db } from "../db/db-pgp"; // TODO: replace this db with


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
  if (adjustmentType === "rate_percent")  return val > 0 ? `+${val}%` : `-${val}%`;
  if (adjustmentType === "rate_flat") return val > 0 ? `+$${val}` : `-$${val}`;
  return null;
};

commentsRouter.get("/invoice/sessions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { includeNoBooking } = req.query;

    let query = "SELECT * FROM comments WHERE invoice_id = $1";
    const queryParams = [id];

    if (includeNoBooking !== 'true')
      query += " AND booking_id IS NOT NULL";
    else 
      query += " AND booking_id IS NULL";

    const data = await db.query(query, queryParams);
    const comments = keysToCamel(data);
    const groupedComments = {};

    comments.forEach((comment) => {
      const bookingId = comment.bookingId;
      const formattedValue = formatAdjustmentFee(comment.adjustmentType, comment.adjustmentValue);

      if (formattedValue !== null) {
        if (groupedComments[bookingId]) {
          groupedComments[bookingId].adjustmentValues.push(formattedValue);
        } else {
          groupedComments[bookingId] = { ...comment, adjustmentValues: [formattedValue] };
          delete groupedComments[bookingId].adjustmentValue;
        }
      } else {
        if (!groupedComments[bookingId]) {
          groupedComments[bookingId] = { ...comment, adjustmentValues: [] };
          delete groupedComments[bookingId].adjustmentValue;
        }
      }
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
    console.log(
      `Processing comment for invoice_id: ${invoice_id}, adjustment_type: ${adjustment_type}`
    );

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

    // Updating payment status for invoice
    if (adjustment_type === "paid" && invoice_id) {
      console.log(`Processing payment adjustment for invoice: ${invoice_id}`);

      const paidAmount = await getInvoicePaidAmount(invoice_id);
      const totalAmount = await getInvoiceTotal(invoice_id);
      console.log(`Paid amount: ${paidAmount}, Total amount: ${totalAmount}`);

      let newStatus = "none";

      if (paidAmount >= totalAmount) {
        newStatus = "full"; // This should be "full" not "paid" based on your schema
        console.log(`Invoice ${invoice_id} is fully paid`);
      } else if (paidAmount > 0) {
        newStatus = "partial";
        console.log(`Invoice ${invoice_id} is partially paid`);
      } else {
        newStatus = "none";
        console.log(`Invoice ${invoice_id} has no payment`);
      }

      console.log(`Updating invoice ${invoice_id} status to ${newStatus}`);

      // Update the invoice
      await db.query("UPDATE invoices SET payment_status = $1 WHERE id = $2", [
        newStatus,
        invoice_id,
      ]);

      // Verify the update
      const updatedInvoice = await db.oneOrNone(
        "SELECT payment_status FROM invoices WHERE id = $1",
        [invoice_id]
      );
      console.log(
        `After update, invoice status is: ${updatedInvoice?.payment_status}`
      );
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

    // Only update payment status if the deleted comment was a payment
    if (comment[0].adjustment_type === "paid") {
      const invoice_id = comment[0].invoice_id;
      console.log(
        `Deleted payment for invoice ${invoice_id}, recalculating status`
      );

      const newPaidAmount = await getInvoicePaidAmount(invoice_id);
      console.log(`New paid amount: ${newPaidAmount}`);

      const totalAmount = await getInvoiceTotal(invoice_id);
      console.log(`Total amount: ${totalAmount}`);

      let newStatus = "none";
      if (newPaidAmount >= totalAmount) {
        newStatus = "full";
        console.log(`Invoice ${invoice_id} is now fully paid`);
      } else if (newPaidAmount > 0) {
        newStatus = "partial";
        console.log(`Invoice ${invoice_id} is now partially paid`);
      } else {
        newStatus = "none";
        console.log(`Invoice ${invoice_id} now has no payment`);
      }

      console.log(`Updating invoice ${invoice_id} status to ${newStatus}`);

      // Update the invoice with the correct invoice_id
      await db.query("UPDATE invoices SET payment_status = $1 WHERE id = $2", [
        newStatus,
        invoice_id,
      ]);

      // Verify the update
      const updatedInvoice = await db.oneOrNone(
        "SELECT payment_status FROM invoices WHERE id = $1",
        [invoice_id]
      );
      console.log(
        `After update, invoice status is: ${updatedInvoice?.payment_status}`
      );
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

    // Update status for each affected invoice
    for (const invoice_id of invoiceIds) {
      console.log(
        `Updating status for invoice ${invoice_id} after deleting payment comments`
      );

      const newPaidAmount = await getInvoicePaidAmount(invoice_id);
      console.log(`New paid amount: ${newPaidAmount}`);

      const totalAmount = await getInvoiceTotal(invoice_id);
      console.log(`Total amount: ${totalAmount}`);

      let newStatus = "none";
      if (newPaidAmount >= totalAmount) {
        newStatus = "full";
      } else if (newPaidAmount > 0) {
        newStatus = "partial";
      } else {
        newStatus = "none";
      }

      console.log(`Setting invoice ${invoice_id} status to ${newStatus}`);

      // Update the invoice with the correct invoice_id
      await db.query("UPDATE invoices SET payment_status = $1 WHERE id = $2", [
        newStatus,
        invoice_id,
      ]);

      // Verify the update
      const updatedInvoice = await db.oneOrNone(
        "SELECT payment_status FROM invoices WHERE id = $1",
        [invoice_id]
      );
      console.log(
        `After update, invoice status is: ${updatedInvoice?.payment_status}`
      );
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

// Create a utility function to get the invoice total
// Utility function to get the invoice total
async function getInvoiceTotal(invoiceId) {
  try {
    console.log(`Calculating total for invoice ${invoiceId}`);

    // Get invoice details
    const invoiceRes = await db.query("SELECT * FROM invoices WHERE id = $1", [
      invoiceId,
    ]);

    if (!invoiceRes || invoiceRes.length === 0) {
      console.log(`No invoice found with id ${invoiceId}`);
      return 0;
    }

    const invoice = invoiceRes[0];

    // Get event details
    const eventRes = await db.query("SELECT * FROM events WHERE id = $1", [
      invoice.event_id,
    ]);

    if (!eventRes || eventRes.length === 0) {
      console.log(`No event found for invoice ${invoiceId}`);
      return 0;
    }

    const event = eventRes[0];

    // Get global rate adjustments
    const comments = await db.query(
      "SELECT * FROM comments WHERE adjustment_type IN ('rate_flat', 'rate_percent') AND booking_id IS NULL"
    );

    // Get bookings for this event in the invoice date range
    const bookings = await db.query(
      "SELECT * FROM bookings WHERE event_id = $1 AND date BETWEEN $2 AND $3",
      [event.id, invoice.start_date, invoice.end_date]
    );

    // Get total adjustments
    const totalAdjustments = await db.query(
      "SELECT * FROM comments WHERE adjustment_type = 'total'"
    );

    // Calculate costs for each booking
    const bookingCosts = await Promise.all(
      bookings.map(async (booking) => {
        // Get room rate for this booking
        const roomRateBooking = await db.query(
          "SELECT rooms.name, rooms.rate FROM rooms JOIN bookings ON rooms.id = bookings.room_id WHERE bookings.id = $1",
          [booking.id]
        );

        if (!roomRateBooking.length) return 0; // if room not found, cost is 0

        let totalRate = Number(roomRateBooking[0].rate);

        // Apply global rate adjustments
        comments.forEach((adj) => {
          if (adj.adjustment_type === "rate_percent") {
            totalRate *= 1 + Number(adj.adjustment_value) / 100;
          } else if (adj.adjustment_type === "rate_flat") {
            totalRate += Number(adj.adjustment_value);
          }
        });

        // Apply booking-specific rate adjustments
        const commentsBooking = await db.query(
          "SELECT * FROM comments WHERE adjustment_type IN ('rate_flat', 'rate_percent') AND booking_id = $1",
          [booking.id]
        );

        commentsBooking.forEach((adj) => {
          if (adj.adjustment_type === "rate_percent") {
            totalRate *= 1 + Number(adj.adjustment_value) / 100;
          } else if (adj.adjustment_type === "rate_flat") {
            totalRate += Number(adj.adjustment_value);
          }
        });

        // Calculate booking duration in hours
        const startTime = new Date(
          `1970-01-01T${booking.start_time.substring(0, booking.start_time.length - 3)}Z`
        );
        const endTime = new Date(
          `1970-01-01T${booking.end_time.substring(0, booking.end_time.length - 3)}Z`
        );
        const durationHours = (endTime - startTime) / (1000 * 60 * 60);

        // Calculate booking cost
        let bookingCost = totalRate * durationHours;

        // Apply 'total' adjustments specific to this booking
        totalAdjustments.forEach((comment) => {
          if (comment.booking_id === booking.id) {
            bookingCost += Number(comment.adjustment_value);
          }
        });

        return bookingCost;
      })
    );

    // Sum all booking costs
    let totalCost = bookingCosts.reduce((acc, cost) => acc + cost, 0);

    // Apply global 'total' adjustments that do not have a booking_id
    totalAdjustments.forEach((comment) => {
      if (!comment.booking_id) {
        totalCost += Number(comment.adjustment_value);
      }
    });

    console.log(`Total cost calculated for invoice ${invoiceId}: ${totalCost}`);
    return totalCost;
  } catch (error) {
    console.error(
      `Error calculating invoice total for ${invoiceId}: ${error.message}`
    );
    return 0; // Return 0 as a safe default
  }
}

// Create a utility function to get the invoice paid amount
async function getInvoicePaidAmount(invoiceId) {
  try {
    const result = await db.oneOrNone(
      `SELECT SUM(c.adjustment_value) FROM
      invoices as i, comments as c
      WHERE i.id = $1 AND c.adjustment_type = 'paid';`,
      [invoiceId]
    );

    return result ? Number(result.sum) || 0 : 0;
  } catch (error) {
    console.error("Error calculating invoice paid amount:", error);
    throw error;
  }
}

export { commentsRouter };
