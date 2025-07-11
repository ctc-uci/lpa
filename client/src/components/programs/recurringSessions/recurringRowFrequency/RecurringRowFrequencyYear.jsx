import React from "react";

import { HStack, Select } from "@chakra-ui/react";

const months = [
  { name: "January", days: 31 },
  { name: "February", days: 29 }, // Allow leap day, up to 29
  { name: "March", days: 31 },
  { name: "April", days: 30 },
  { name: "May", days: 31 },
  { name: "June", days: 30 },
  { name: "July", days: 31 },
  { name: "August", days: 31 },
  { name: "September", days: 30 },
  { name: "October", days: 31 },
  { name: "November", days: 30 },
  { name: "December", days: 31 },
];

export const RecurringRowFrequencyYear = ({
  session,
  index,
  handleChangeSessionField,
}) => {
  return (
    <HStack spacing="4">
      <Select
        value={session.month || ""}
        onChange={(e) => {
          handleChangeSessionField("recurring", index, "month", e.target.value);
          // Reset day if current day exceeds new month's days
          const selectedMonth = months.find((m) => m.name === e.target.value);
          if (session.dayOfMonth > selectedMonth.days) {
            handleChangeSessionField("recurring", index, "dayOfMonth", 1);
            handleChangeSessionField("recurring", index, "frequency", "year");
          }
        }}
        placeholder="Select month"
      >
        {months.map((month) => (
          <option
            key={month.name}
            value={month.name}
          >
            {month.name}
          </option>
        ))}
      </Select>

      <Select
        value={session.dayOfMonth || ""}
        onChange={(e) => {
          handleChangeSessionField(
            "recurring",
            index,
            "dayOfMonth",
            parseInt(e.target.value)
          );
          handleChangeSessionField("recurring", index, "frequency", "year");
        }}
        placeholder="Select day"
        isDisabled={!session.month}
      >
        {session.month &&
          Array.from(
            { length: months.find((m) => m.name === session.month).days },
            (_, i) => (
              <option
                key={i + 1}
                value={i + 1}
              >
                {i + 1}
              </option>
            )
          )}
      </Select>
    </HStack>
  );
};
