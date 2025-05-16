export const generateRecurringSessions = (
  recurringSession,
  startDate,
  endDate
) => {
  console.log("recurringSession GEN GEN ERATE: ", recurringSession);

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

  switch (frequency) {
    case "week":
      const weekdays = [
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
        });

        startingDate.setDate(startingDate.getDate() + 7);
      }
      break;

    case "monthDate":
      let year = currentTimezoneDate.getFullYear();
      let month = currentTimezoneDate.getMonth(); // 0-11

      console.log("month date");

      while (true) {
        // Construct candidate date in UTC
        let candidateDate = new Date(
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

        // Ensure the candidate date is not before the startDate (comparison based on date part)
        if (candidateDate >= currentTimezoneDate) {
          let sessionDateInstance = new Date(candidateDate.valueOf()); // Clone UTC date
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
      // Type: Same weekday of month
      // recurringSession.dayOfWeek: 1 (Sun) to 7 (Sat). JS Date: 0 (Sun) to 6 (Sat).
      const targetJsDayOfWeek = recurringSession.dayOfWeek - 1;

      console.log("month weekday");
      year = currentTimezoneDate.getFullYear();
      month = currentTimezoneDate.getMonth(); // 0-11

      while (true) {
        const firstDayOfMonth = new Date(Date.UTC(year, month, 1));
        if (firstDayOfMonth > endingDate) {
          // Optimization: if first of month is past end, break
          break;
        }

        const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

        let occurrences = [];
        for (let day = 1; day <= daysInMonth; day++) {
          let d = new Date(Date.UTC(year, month, day));
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
          if (specificOccurrenceDate > endingDate) {
            // This specific date is past the end date.
            // Since occurrences are ordered, future months will also be too late.
            break;
          }
          if (specificOccurrenceDate >= currentTimezoneDate) {
            let sessionDateInstance = new Date(
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
          let nextMonthStartCheck = new Date(Date.UTC(year, month, 1));
          if (nextMonthStartCheck > endingDate) break;
        }
      }
      break;

    case "year":
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
      const targetDay = recurringSession.dayOfMonth - 1;

      // Set starting date to first occurrence of target month/day
      startingDate.setMonth(targetMonth);
      startingDate.setDate(targetDay);

      // If target date this year is before start date, advance to next year
      if (startingDate < currentTimezoneDate) {
        startingDate.setFullYear(startingDate.getFullYear() + 1);
      }

      while (startingDate <= endingDate) {
        sessions.push({
          date: startingDate.toISOString(),
          startTime: recurringSession.startTime,
          endTime: recurringSession.endTime,
          roomId: recurringSession.roomId,
          archived: false,
        });

        startingDate.setFullYear(startingDate.getFullYear() + 1);
      }
      break;
  }

  return sessions;
};
