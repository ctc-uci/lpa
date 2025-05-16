import React from "react";

import { HStack, Select } from "@chakra-ui/react";

export const RecurringRowFrequencyMonthSameDay = ({
  session,
  index,
  handleChangeSessionField,
}) => {
  // Generate days from 1 to 31
  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <HStack spacing="4">
      <Select
        value={session.dayOfMonth || ""}
        onChange={(e) => {
          handleChangeSessionField(
            "recurring",
            index,
            "dayOfMonth",
            parseInt(e.target.value)
          );
          handleChangeSessionField(
            "recurring",
            index,
            "frequency",
            "monthDate"
          );
        }}
        placeholder="Select day"
      >
        {daysInMonth.map((day) => (
          <option
            key={day}
            value={day}
          >
            {day}
          </option>
        ))}
      </Select>
    </HStack>
  );
};
