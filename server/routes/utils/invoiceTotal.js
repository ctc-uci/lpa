/**
 * Single source of truth for invoice dollar totals (matches GET /invoices/total/:id).
 */

export async function calculateInvoiceTotal(db, id) {
  const invoiceRes = await db.query("SELECT * FROM invoices WHERE id = $1", [id]);
  if (!invoiceRes || invoiceRes.length === 0) {
    return 0;
  }
  const invoice = invoiceRes[0];

  const eventRes = await db.query("SELECT * FROM events WHERE id = $1", [
    invoice.event_id,
  ]);
  if (!eventRes || eventRes.length === 0) {
    return 0;
  }
  const event = eventRes[0];

  const comments = await db.query(
    "SELECT * FROM comments WHERE adjustment_type IN ('rate_flat', 'rate_percent') AND booking_id IS NULL AND invoice_id = $1",
    [id]
  );

  const bookings = await db.query(
    "SELECT * FROM bookings WHERE event_id = $1 AND date BETWEEN $2 AND $3",
    [event.id, invoice.start_date, invoice.end_date]
  );

  const totalAdjustments = await db.query(
    "SELECT * FROM comments WHERE adjustment_type = 'total' AND invoice_id = $1 AND booking_id IS NOT NULL",
    [id]
  );

  const invoiceTotalAdjustments = await db.query(
    "SELECT * FROM comments WHERE adjustment_type = 'total' AND invoice_id = $1 AND booking_id IS NULL",
    [id]
  );

  const bookingCosts = await Promise.all(
    bookings.map(async (booking) => {
      const roomRateBooking = await db.query(
        "SELECT rooms.name, rooms.rate FROM rooms JOIN bookings ON rooms.id = bookings.room_id WHERE bookings.id = $1",
        [booking.id]
      );

      if (!roomRateBooking.length) return 0;

      let totalRate = Number(roomRateBooking[0].rate);

      comments.forEach((adj) => {
        if (adj.adjustment_type === "rate_percent") {
          totalRate *= 1 + Number(adj.adjustment_value) / 100;
        } else if (adj.adjustment_type === "rate_flat") {
          totalRate += Number(adj.adjustment_value);
        }
      });

      const commentsBooking = await db.query(
        "SELECT * FROM comments WHERE adjustment_type IN ('rate_flat', 'rate_percent') AND booking_id = $1 AND invoice_id = $2",
        [booking.id, id]
      );

      commentsBooking.forEach((adj) => {
        if (adj.adjustment_type === "rate_percent") {
          totalRate *= 1 + Number(adj.adjustment_value) / 100;
        } else if (adj.adjustment_type === "rate_flat") {
          totalRate += Number(adj.adjustment_value);
        }
      });

      const startTime = new Date(
        `1970-01-01T${booking.start_time.substring(0, booking.start_time.length - 3)}Z`
      );
      const endTime = new Date(
        `1970-01-01T${booking.end_time.substring(0, booking.end_time.length - 3)}Z`
      );
      const durationHours = (endTime - startTime) / (1000 * 60 * 60);

      let bookingCost = totalRate * durationHours;

      totalAdjustments.forEach((comment) => {
        if (comment.booking_id === booking.id) {
          bookingCost += Number(comment.adjustment_value);
        }
      });

      return bookingCost;
    })
  );

  let totalCost = bookingCosts.reduce((acc, cost) => acc + cost, 0);

  totalAdjustments.forEach((comment) => {
    if (!comment.booking_id) {
      totalCost += Number(comment.adjustment_value);
    }
  });

  totalCost += invoiceTotalAdjustments.reduce(
    (acc, comment) => acc + Number(comment.adjustment_value),
    0
  );

  return totalCost;
}
