import { batchInsertBookings, batchUpdateBookings, batchDeleteBookings } from "../../utils/calendar";

export const generateRecurringSessions = (
  recurringSession,
  startDate,
  endDate
) => {
  // console.log("recurringSession GEN GEN ERATE: ", recurringSession);

  const sessions = [];
  const currentTimezoneDate = new Date(
    startDate.replace(/-/g, "/").replace(/T.+/, "")
  );
  const startingDate = new Date(startDate);
  const endingDate = new Date(endDate);

  const frequency = recurringSession.frequency;

  // Get UTC time components from the original startDate to apply to new session dates
  const initialTimeHours = startingDate.getUTCHours();
  const initialTimeMinutes = startingDate.getUTCMinutes();
  const initialTimeSeconds = startingDate.getUTCSeconds();
  const initialTimeMilliseconds = startingDate.getUTCMilliseconds();
  let year;
  let month;

  switch (frequency) {
    case "week":
      { const weekdays = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
      ];

      const weekdayIndex = weekdays.indexOf(
        recurringSession.weekday.toLowerCase()
      );
      const startDayOfWeek = currentTimezoneDate.getDay();
      const daysUntilFirst = (weekdayIndex - startDayOfWeek + 7) % 7;

      if (daysUntilFirst > 0) {
        startingDate.setDate(startingDate.getDate() + daysUntilFirst);
      }

      while (startingDate <= endingDate) {
        sessions.push({
          date: startingDate.toISOString(),
          startTime: recurringSession.startTime,
          endTime: recurringSession.endTime,
          roomId: recurringSession.roomId,
          archived: false,
          id: Date.now() + Math.random(),
        });

        startingDate.setDate(startingDate.getDate() + 7);
      }
      break; }

    case "monthDate":
      year = currentTimezoneDate.getFullYear();
      month = currentTimezoneDate.getMonth(); // 0-11

      // console.log("month date");

      while (true) {
        // Construct candidate date in UTC
        const candidateDate = new Date(
          Date.UTC(year, month, recurringSession.dayOfMonth)
        );

        // If the constructed date rolled over (e.g., day 31 for Feb becomes Mar 2/3)
        if (candidateDate.getUTCMonth() !== month) {
          // This day doesn't exist in this month. Move to next month.
          month++;
          if (month > 11) {
            month = 0;
            year++;
          }
          // Check if just advancing the month/year already puts us past the end date
          if (new Date(Date.UTC(year, month, 1)) > endingDate) {
            break;
          }
          continue;
        }

        if (candidateDate > endingDate) {
          break; // Past the end date
        }

        // Check if this is the first month and if the candidate date matches the start date
        const isFirstMonth =
          year === currentTimezoneDate.getUTCFullYear() &&
          month === currentTimezoneDate.getUTCMonth();
        const isStartDate =
          candidateDate.getUTCDate() === currentTimezoneDate.getUTCDate();

        // Include the date if it's after the start date OR if it's the start date itself
        if (
          candidateDate >= currentTimezoneDate ||
          (isFirstMonth && isStartDate)
        ) {
          const sessionDateInstance = new Date(candidateDate.valueOf()); // Clone UTC date
          sessionDateInstance.setUTCHours(
            initialTimeHours,
            initialTimeMinutes,
            initialTimeSeconds,
            initialTimeMilliseconds
          );
          sessions.push({
            date: sessionDateInstance.toISOString(),
            startTime: recurringSession.startTime,
            endTime: recurringSession.endTime,
            roomId: recurringSession.roomId,
            archived: false,
            id: Date.now() + Math.random(),
          });
        }

        // Advance to the next month
        month++;
        if (month > 11) {
          month = 0;
          year++;
        }
        // Check if the start of the next month is already past the end date
        if (new Date(Date.UTC(year, month, 1)) > endingDate) {
          break;
        }
      }
      break;

    case "monthWeekday":
      {
      // Type: Same weekday of month
      // recurringSession.dayOfWeek: 1 (Sun) to 7 (Sat). JS Date: 0 (Sun) to 6 (Sat).
      const targetJsDayOfWeek = recurringSession.dayOfWeek - 1;

      // console.log("month weekday");
      year = currentTimezoneDate.getFullYear();
      month = currentTimezoneDate.getMonth(); // 0-11

      while (true) {
        const firstDayOfMonth = new Date(Date.UTC(year, month, 1));
        if (firstDayOfMonth > endingDate) {
          // Optimization: if first of month is past end, break
          break;
        }

        const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

        const occurrences = [];
        for (let day = 1; day <= daysInMonth; day++) {
          const d = new Date(Date.UTC(year, month, day));
          if (d.getUTCDay() === targetJsDayOfWeek) {
            occurrences.push(d);
          }
        }

        let specificOccurrenceDate = null;
        if (occurrences.length > 0) {
          if (recurringSession.weekDayOccurrence > 0) {
            // 1st, 2nd, 3rd, 4th
            if (occurrences.length >= recurringSession.weekDayOccurrence) {
              specificOccurrenceDate =
                occurrences[recurringSession.weekDayOccurrence - 1];
            }
          } else {
            // Last (weekDayOccurrence is -1)
            specificOccurrenceDate = occurrences[occurrences.length - 1];
          }
        }

        if (specificOccurrenceDate) {
          // Check if this is the first month and if the specific occurrence matches the start date
          const isFirstMonth =
            year === currentTimezoneDate.getUTCFullYear() &&
            month === currentTimezoneDate.getUTCMonth();
          const isStartDate =
            specificOccurrenceDate.getUTCDate() ===
              currentTimezoneDate.getUTCDate() &&
            specificOccurrenceDate.getUTCDay() ===
              currentTimezoneDate.getUTCDay();

          if (specificOccurrenceDate > endingDate) {
            // This specific date is past the end date.
            // Since occurrences are ordered, future months will also be too late.
            break;
          }
          if (
            specificOccurrenceDate >= currentTimezoneDate ||
            (isFirstMonth && isStartDate)
          ) {
            const sessionDateInstance = new Date(
              specificOccurrenceDate.valueOf()
            ); // Clone UTC date
            sessionDateInstance.setUTCHours(
              initialTimeHours,
              initialTimeMinutes,
              initialTimeSeconds,
              initialTimeMilliseconds
            );
            sessions.push({
              date: sessionDateInstance.toISOString(),
              startTime: recurringSession.startTime,
              endTime: recurringSession.endTime,
              roomId: recurringSession.roomId,
              archived: false,
              id: Date.now() + Math.random(),
            });
          }
        }

        // Advance to the next month
        month++;
        if (month > 11) {
          month = 0;
          year++;
        }
        // Check if the start of the new month itself is already too far (post-increment)
        if (
          new Date(Date.UTC(year, month, 1)) > endingDate &&
          month > currentTimezoneDate.getMonth() &&
          year >= currentTimezoneDate.getFullYear()
        ) {
          // A more aggressive break if we are certain no more valid dates can be found.
          // This condition ensures we don't break prematurely if endingDate is far in future.
          // Only break if the new month we're about to check is already past the end date.
          const nextMonthStartCheck = new Date(Date.UTC(year, month, 1));
          if (nextMonthStartCheck > endingDate) break;
        }
      }
      break; }

    case "year":
      {
      // Get the target month from recurringSession (0-11)
      const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      const targetMonth = months.indexOf(recurringSession.month);
      const targetDay = recurringSession.dayOfMonth;

      // Create a new date object for the first occurrence
      let currentYear = currentTimezoneDate.getFullYear();
      let candidateDate = new Date(
        Date.UTC(currentYear, targetMonth, targetDay)
      );

      // Handle case where target day doesn't exist in target month
      while (candidateDate.getUTCMonth() !== targetMonth) {
        // If the date rolled over to next month, use the last day of the target month
        candidateDate = new Date(Date.UTC(currentYear, targetMonth + 1, 0));
      }

      // Set the time components from the original start date
      candidateDate.setUTCHours(
        initialTimeHours,
        initialTimeMinutes,
        initialTimeSeconds,
        initialTimeMilliseconds
      );

      // Check if this is the first year and if the candidate date matches the start date
      const isFirstYear = currentYear === currentTimezoneDate.getUTCFullYear();
      const isStartDate =
        candidateDate.getUTCDate() === currentTimezoneDate.getUTCDate() &&
        candidateDate.getUTCMonth() === currentTimezoneDate.getUTCMonth();

      // If the target date this year is before the start date, advance to next year
      // But only if it's not the same date (to include the start date if it matches)
      if (
        candidateDate < currentTimezoneDate &&
        !(isFirstYear && isStartDate)
      ) {
        currentYear++;
        candidateDate = new Date(Date.UTC(currentYear, targetMonth, targetDay));

        // Handle case where target day doesn't exist in target month for the new year
        while (candidateDate.getUTCMonth() !== targetMonth) {
          candidateDate = new Date(Date.UTC(currentYear, targetMonth + 1, 0));
        }

        // Set the time components again for the new date
        candidateDate.setUTCHours(
          initialTimeHours,
          initialTimeMinutes,
          initialTimeSeconds,
          initialTimeMilliseconds
        );
      }

      // Generate sessions for each year
      while (candidateDate <= endingDate) {
        sessions.push({
          date: candidateDate.toISOString(),
          startTime: recurringSession.startTime,
          endTime: recurringSession.endTime,
          roomId: recurringSession.roomId,
          archived: false,
          id: Date.now() + Math.random(),
        });

        // Move to next year
        currentYear++;
        candidateDate = new Date(Date.UTC(currentYear, targetMonth, targetDay));

        // Handle case where target day doesn't exist in target month for the new year
        while (candidateDate.getUTCMonth() !== targetMonth) {
          candidateDate = new Date(Date.UTC(currentYear, targetMonth + 1, 0));
        }

        // Set the time components again for the new date
        candidateDate.setUTCHours(
          initialTimeHours,
          initialTimeMinutes,
          initialTimeSeconds,
          initialTimeMilliseconds
        );
      }
      break; }
  }

  return sessions;
};


export const createNewSessions = async (newSessions, id, backend) => {
  // Get event name and description
  const eventResponse = await backend.get(`/events/${id}`);
  const event = eventResponse.data[0];
  const eventName = event.name;
  const eventDescription = event.description;
  
  const formattedNewSessions = newSessions.map((s) => ({
    event_id: id,
    room_id: s.roomId,
    start_time: s.startTime,
    end_time: s.endTime,
    date: s.date,
    archived: s.archived,
  }));

  if (formattedNewSessions.length < 1) {
    return;
  }

  const response = await backend.post("/bookings/batch", {
    bookings: formattedNewSessions,
  });

  if (response.status !== 200) {
    return;
  }

  const backendIds = response.data.data;

  // Get room names from ids
  const roomNameMap = {};
  for (const session of newSessions) {
    const roomResponse = await backend.get(`/rooms/${session.roomId}`);
    const room = roomResponse.data[0];
    roomNameMap[session.roomId] = room.name;
  }

  const gcalFormat = newSessions.map((s, index) => ({
    backendId: backendIds[index],
    name: eventName,
    date: s.date,
    startTime: s.startTime,
    endTime: s.endTime,
    location: roomNameMap[s.roomId],
    description: eventDescription,
    roomId: s.roomId,
  }));

  await batchInsertBookings(gcalFormat);
};

// id = event id, backend = backend context
export const updateSessions = async (updatedSessions, id, backend) => {
  const eventResponse = await backend.get(`/events/${id}`);
  const event = eventResponse.data[0];
  const eventName = event.name;
  const eventDescription = event.description;

  const formattedUpdatedSessions = updatedSessions.map((s) => ({
    id: s.id,
    event_id: id,
    room_id: s.roomId,
    start_time: s.startTime,
    end_time: s.endTime,
    date: s.date,
    archived: s.archived,
  }));

  if (formattedUpdatedSessions.length < 1) {
    return;
  }

  await backend.put("/bookings/batch", {
    bookings: formattedUpdatedSessions,
  });

  // Get room names from ids
  const roomNameMap = {};
  for (const session of updatedSessions) {
    const roomResponse = await backend.get(`/rooms/${session.roomId}`);
    const room = roomResponse.data[0];
    roomNameMap[session.roomId] = room.name;
  }

  // Get event name and description
  const gcalFormat = updatedSessions.map((s) => ({
    backendId: s.id,
    name: s.archived ? `[ARCHIVED] ${eventName}` : eventName,
    date: s.date,
    startTime: s.startTime.slice(0, 5),
    endTime: s.endTime.slice(0, 5),
    location: roomNameMap[s.roomId],
    description: s.archived ? `[ARCHIVED] ${eventDescription ?? ''}` : eventDescription,
    roomId: s.roomId,
    visibility: s.archived ? "private" : "default"
  }));
  // console.log("gcalFormat: ", gcalFormat);
  if (gcalFormat.length > 0) {
    await batchUpdateBookings(gcalFormat);
  }
};

export const deleteSessions = async (deletedSessions, backend) => {
  const formattedDeletedSessions = deletedSessions.map((s) => s.id);

  if (formattedDeletedSessions.length < 1) {
    return;
  }

  await backend.delete("/bookings/batch", {
    data: {
      ids: formattedDeletedSessions,
    },
  });

  const gcalFormat = deletedSessions.map((s) => ({
    backendId: s.id,
    date: s.date,
    startTime: s.startTime?.slice(0, 5),
    endTime: s.endTime?.slice(0, 5),
    roomId: s.roomId,
  }));

  await batchDeleteBookings(gcalFormat);
};
