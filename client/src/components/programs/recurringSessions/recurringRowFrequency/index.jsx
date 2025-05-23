import React from "react";

import { RecurringRowFrequencyMonthSameDay } from "./RecurringRowFrequencyMonthSameDay";
import { RecurringRowFrequencyMonthSameDayOfWeek } from "./RecurringRowFrequencyMonthSameDayOfWeek";
import { RecurringRowFrequencyWeek } from "./RecurringRowFrequencyWeek";
import { RecurringRowFrequencyYear } from "./RecurringRowFrequencyYear";

export const RecurringRowFrequency = ({
  session,
  index,
  handleChangeSessionField,
  recurrenceType, // "week", "year", "monthDate", or "monthWeekday"
}) => {
  switch (recurrenceType) {
    case "week":
      return (
        <RecurringRowFrequencyWeek
          session={session}
          index={index}
          handleChangeSessionField={handleChangeSessionField}
        />
      );
    case "monthDate":
      return (
        <RecurringRowFrequencyMonthSameDay
          session={session}
          index={index}
          handleChangeSessionField={handleChangeSessionField}
        />
      );
    case "monthWeekday":
      return (
        <RecurringRowFrequencyMonthSameDayOfWeek
          session={session}
          index={index}
          handleChangeSessionField={handleChangeSessionField}
        />
      );
    case "year":
      return (
        <RecurringRowFrequencyYear
          session={session}
          index={index}
          handleChangeSessionField={handleChangeSessionField}
        />
      );
    default:
      // Default to week or return null/error if appropriate
      console.warn(
        `Unknown recurrenceType: ${recurrenceType}, defaulting to week.`
      );
      return (
        <RecurringRowFrequencyWeek
          session={session}
          index={index}
          handleChangeSessionField={handleChangeSessionField}
        />
      );
  }
};
