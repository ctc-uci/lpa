import { getCurrentUser } from "./auth/firebase";
import { batchDeleteBookings } from "./calendar";

export const archiveProgram = async (backend, programId, cancelReason) => {
  // Get the current user
  const currentUser = await getCurrentUser();
  const firebaseUid = currentUser.uid;

  if (!firebaseUid) {
    throw new Error("No logged in user");
  }

  // Get all bookings
  const bookings = await backend.get(`/bookings/event/${programId}`);

  // Archive the program
  //   This also adds a fee to the current invoice
  const result = await backend.post(`/programs/archive/${programId}`, {
    reason: cancelReason,
    firebaseUid: firebaseUid
  });

  if (result.status !== 200) {
    throw new Error("Failed to archive program");
  }

  if (bookings.length === 0) {
    return;
  }

  // Create google calendar booking objects
  const googleBookings = bookings.data.map((booking) => {
    return {
      backendId: booking.id
    };
  });
  // Delete all google calendar bookings
  await batchDeleteBookings(googleBookings);
};

export const deleteProgram = async (backend, programId) => {
  // Get all bookings
  const bookings = await backend.get(`/bookings/event/${programId}`);

  // Delete the program
  const result = await backend.delete(`/programs/delete/${programId}`);

  if (result.status !== 200) {
    throw new Error("Failed to delete program");
  }

  if (bookings.length === 0) {
    return;
  }

  // Create google calendar booking objects
  const googleBookings = bookings.data.map((booking) => {
    return {
      backendId: booking.id
    };
  });
  // Delete all google calendar bookings
  await batchDeleteBookings(googleBookings);
}



// BROKEN
export const archiveBooking = async (backend, bookingId, cancelReason) => {
  // Get the current user
  const currentUser = await getCurrentUser();
  const firebaseUid = currentUser.uid;

  if (!firebaseUid) {
    throw new Error("No logged in user");
  }

  // Get the booking
  const booking = await backend.get(`/bookings/${bookingId}`);

  // Add a comment to the booking
  const commentResponse = await backend.post(`/comments`, {
    user_id: firebaseUid,
    invoice_id: booking.invoice_id,
    datetime: new Date().toISOString().slice(0, 19).replace('T', ' '),
    comment: cancelReason,
    adjustment_type: "total",
    adjustment_value: 0
  });
  if (commentResponse.status !== 200) {
    throw new Error("Failed to add comment to booking");
  }

  // Archive the booking
  const result = await backend.put(`/bookings/${bookingId}`, {
    archived: true
  });
  if (result.status !== 200) {
    throw new Error("Failed to archive booking");
  }

  // Create google calendar booking object
  const googleBooking = {
    backendId: bookingId
  };
  // Delete the google calendar booking
  await batchDeleteBookings([googleBooking]);
}
