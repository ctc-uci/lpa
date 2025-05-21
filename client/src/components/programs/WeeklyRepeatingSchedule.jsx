import { React } from "react";

import { Box, Flex, Text } from "@chakra-ui/react";

export const WeeklyRepeatingSchedule = ({ sessions }) => {
  if (!sessions || sessions.length === 0) {
    return <Text>No sessions scheduled</Text>;
  }

  // Function to format time strings
  const formatTimeString = (timeString) => {
    if (!timeString) return "";
    if (timeString.includes(":")) {
      const [hours, minutes] = timeString.split(":");
      const hour = parseInt(hours, 10);
      const period = hour >= 12 ? "pm" : "am";
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      return `${displayHour}:${minutes.substring(0, 2)} ${period}`;
    }
    return timeString;
  };

  // Filter out sessions without dates
  const validSessions = sessions.filter((session) => session.date);

  if (validSessions.length === 0) {
    return <Text>No sessions with valid dates</Text>;
  }

  // Group sessions by day of week
  const sessionsByDay = {};
  let maxCount = 0;

  for (const session of validSessions) {
    const sessionDate = new Date(session.date);
    const dayOfWeek = sessionDate.toLocaleDateString("en-US", {
      weekday: "short",
    });

    if (!sessionsByDay[dayOfWeek]) {
      sessionsByDay[dayOfWeek] = [];
    }

    // If we already have a session for this day with the same time, skip it
    const existingTimeSlot = sessionsByDay[dayOfWeek].find(
      (slot) =>
        slot.startTime === session.startTime && slot.endTime === session.endTime
    );

    if (!existingTimeSlot) {
      sessionsByDay[dayOfWeek].push({
        startTime: session.startTime,
        endTime: session.endTime,
        count: 1,
      });
      if (1 > maxCount) {
        maxCount = 1;
      }
    } else {
      existingTimeSlot.count++;
      if (existingTimeSlot.count > maxCount) {
        maxCount = existingTimeSlot.count;
      }
    }
  }

  console.log(sessionsByDay);
  const finalSessionsByDay = {}
  for (const day in sessionsByDay) {
    const dayList = sessionsByDay[day];
    const finalDayList = [];
    for (const timeSlot of dayList) {
      if (timeSlot.count >= maxCount - 2) {
        finalDayList.push(timeSlot);
      }
    }
    finalSessionsByDay[day] = finalDayList;
  }
  console.log(finalSessionsByDay);

  // Order days of week
  const daysOrder = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const orderedDays = Object.keys(finalSessionsByDay).sort(
    (a, b) => daysOrder.indexOf(a) - daysOrder.indexOf(b)
  );

  if (orderedDays.length === 0) {
    return <Text>No scheduled days found</Text>;
  }

  // Create components for each day/time combination
  return (
    <Flex
      direction="column"
      gap={1}
    >
      {orderedDays.map((day, dayIndex) =>
        finalSessionsByDay[day].map((timeSlot, timeIndex) => (
          <Text
            key={`${day}-${timeIndex}`}
            fontWeight="500"
          >
            {formatTimeString(timeSlot.startTime)} -{" "}
            {formatTimeString(timeSlot.endTime)} on {day}.
          </Text>
        ))
      )}
    </Flex>
  );
};
