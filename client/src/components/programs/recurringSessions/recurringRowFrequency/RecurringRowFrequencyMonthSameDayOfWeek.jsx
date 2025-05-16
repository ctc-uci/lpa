import React from "react";

import { HStack, Select } from "@chakra-ui/react";

const weekDayOccurrences = [
  { value: 1, label: "First" },
  { value: 2, label: "Second" },
  { value: 3, label: "Third" },
  { value: 4, label: "Fourth" },
  { value: -1, label: "Last" }, // -1 can represent the last occurrence
];

const daysOfWeek = [
  { value: 1, label: "Sunday" },
  { value: 2, label: "Monday" },
  { value: 3, label: "Tuesday" },
  { value: 4, label: "Wednesday" },
  { value: 5, label: "Thursday" },
  { value: 6, label: "Friday" },
  { value: 7, label: "Saturday" },
];

export const RecurringRowFrequencyMonthSameDayOfWeek = ({
  session,
  index,
  handleChangeSessionField,
}) => {
  return (
    <HStack spacing="4">
      <Select
        value={session.weekDayOccurrence || ""}
        onChange={(e) => {
          handleChangeSessionField(
            "recurring",
            index,
            "weekDayOccurrence",
            parseInt(e.target.value)
          );
          handleChangeSessionField(
            "recurring",
            index,
            "frequency",
            "monthWeekday"
          );
        }}
        placeholder="Select occurrence"
      >
        {weekDayOccurrences.map((occurrence) => (
          <option
            key={occurrence.value}
            value={occurrence.value}
          >
            {occurrence.label}
          </option>
        ))}
      </Select>

      <Select
        value={session.dayOfWeek || ""}
        onChange={(e) => {
          handleChangeSessionField(
            "recurring",
            index,
            "dayOfWeek",
            parseInt(e.target.value)
          );
          handleChangeSessionField(
            "recurring",
            index,
            "frequency",
            "monthWeekday"
          );
        }}
        placeholder="Select day of week"
      >
        {daysOfWeek.map((day) => (
          <option
            key={day.value}
            value={day.value}
          >
            {day.label}
          </option>
        ))}
      </Select>
    </HStack>
  );
};
