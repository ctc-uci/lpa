export const cancelBookingFeeCalculation = async (db, bookingId) => {
  // Check if the booking is within 2 weeks in the future
  const booking = await db.query(`
    SELECT * FROM bookings
    WHERE id = $1
    AND (date) >= CAST(CURRENT_DATE AT TIME ZONE 'America/Los_Angeles' AS DATE) 
    AND (date) <= CAST(CURRENT_DATE AT TIME ZONE 'America/Los_Angeles' AS DATE) + INTERVAL '14 days'
    AND archived = false
  `, [bookingId]);

  if (booking.length === 0) {
    return 0;
  }

  const invoice = await db.query(`
    SELECT id FROM invoices
    WHERE event_id = $1
    ORDER BY start_date DESC
    LIMIT 1
    `, [booking[0].event_id]);
  console.log("Invoice: ", invoice);
  const invoiceId = invoice[0].id;
  if (invoiceId === undefined) {
    res.status(500).json({result: "error while finding invoice"});
  }

  // Calculate hour difference between time strings
  const calculateHourDifference = (startTimeStr, endTimeStr) => {
    // Extract time part (remove timezone)
    const startTime = startTimeStr.split('+')[0];
    const endTime = endTimeStr.split('+')[0];
    
    // Parse hours and minutes
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    
    // Convert to total minutes
    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;
    
    // Calculate difference in hours
    const diffMinutes = endTotalMinutes - startTotalMinutes;
    const diffHours = diffMinutes / 60;
    
    return diffHours;
  };

  const bookingDuration = calculateHourDifference(booking[0].start_time, booking[0].end_time);

  // Get the room rate
  const room = await db.query(`
    SELECT * FROM rooms
    WHERE id = $1
  `, [booking[0].room_id]);
  const bookingRate = room[0].rate;

  // Get the rates applied to the invoice
  const invoiceRateAdjustments = await db.query(`
    SELECT * FROM comments
    WHERE invoice_id = $1
    AND adjustment_type IN ('rate_flat', 'rate_percent')
    AND booking_id IS NULL
    ORDER BY id ASC
  `, [invoiceId]);

  // Get rates applied to the invoice and booking
  const sessionRateAdjustments = await db.query(`
    SELECT * FROM comments
    WHERE invoice_id = $1
    AND adjustment_type IN ('rate_flat', 'rate_percent')
    AND booking_id = $2
    ORDER BY id ASC
  `, [invoiceId, bookingId]);

  let rate = Number(bookingRate);
  if (isNaN(rate)) {
    throw new Error(`Invalid booking rate: ${bookingRate}`);
  }
  for (const adjustment of invoiceRateAdjustments) {
    const value = Number(adjustment.adjustment_value);
    if (isNaN(value)) {
      throw new Error(`Invalid adjustment_value: ${adjustment.adjustment_value}`);
    }
    if (adjustment.adjustment_type === "rate_flat") {
      rate += value;
    } else if (adjustment.adjustment_type === "rate_percent") {
      rate += (value / 100) * rate;
    }
  }

  for (const adjustment of sessionRateAdjustments) {
    const value = Number(adjustment.adjustment_value);
    if (isNaN(value)) {
      throw new Error(`Invalid adjustment_value: ${adjustment.adjustment_value}`);
    }
    if (adjustment.adjustment_type === "rate_flat") {
      rate += value;
    } else if (adjustment.adjustment_type === "rate_percent") {
      rate += (value / 100) * rate;
    }
  }

  // Round rate to 2 decimal places
  rate = Math.round(rate * 100) / 100;
  const fee = rate * bookingDuration;
  return Math.round(fee * 100) / 100;
}

export const cancelProgramFeeCalculation = async (db, eventId) => {
  // Get all bookings for the event within 2 weeks in the future
  const bookings = await db.query(`
    SELECT * FROM bookings
    WHERE event_id = $1
    AND (date) >= CAST(CURRENT_DATE AT TIME ZONE 'America/Los_Angeles' AS DATE) 
    AND (date) <= CAST(CURRENT_DATE AT TIME ZONE 'America/Los_Angeles' AS DATE) + INTERVAL '14 days'
    AND archived = false
  `, [eventId]);

  if (bookings.length === 0) {
    return 0;
  }

  // TODO: make this more efficient by using a single query

  // For all bookings, call the booking fee calculation function
  const fees = await Promise.all(bookings.map(async (booking) => {
    return await cancelBookingFeeCalculation(db, booking.id);
  }));

  console.log("Fees: ", fees);

  // Return the total fee
  return fees.reduce((acc, fee) => acc + fee, 0);
  
}