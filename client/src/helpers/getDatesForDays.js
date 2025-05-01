export const getDatesForDays = (startDate, endDate, selectedDays, repeatInterval, customRepeatInterval, customRepeatType) => {
  const dayMap = {
    "Sun": 0,
    "Mon": 1,
    "Tue": 2,
    "Wed": 3,
    "Thu": 4,
    "Fri": 5,
    "Sat": 6,
  };
  const selectedDayNumbers = Object.keys(selectedDays).map((day) => dayMap[day]);

  const start = new Date(startDate + "T00:00:00");
  const end = new Date(endDate + "T23:59:59");
  const dates = [];

  // add x days to a date
  const addDays = (date, days) => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + days);
    return newDate;
  };

  // add x months to a date
  const addMonths = (date, months) => {
    const newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() + months);
    return newDate;
  };

  // add x years to a date
  const addYears = (date, years) => {
    const newDate = new Date(date);
    newDate.setFullYear(newDate.getFullYear() + years);
    return newDate;
  };

  let step = 1;
  let addFunction = addDays;

  switch (repeatInterval) {
    case "Every week":
      step = 7;
      break;
    case "Every month":
      addFunction = addMonths;
      break;
    case "Every year":
      addFunction = addYears;
      break;
    case "Custom":
      step = customRepeatInterval;
      switch (customRepeatType) {
        case "Week":
          step *= 7; // (ie. step is 2 * 7 (14 days) when n = 2)
          break;
        case "Month":
          addFunction = addMonths;
          break;
        case "Year":
          addFunction = addYears;
          break;
        default:
          throw new Error("Invalid customRepeatType");
      }
      break;
    default:
      throw new Error("Invalid repeatInterval");
  }

  // iterate through the date range
  let currentDate = start;
  while (currentDate <= end) {
    // check for each selected day and add the matching ones
    selectedDayNumbers.forEach(dayNum => {
      // Find the closest matching day in the current week
      const daysUntilNext = (dayNum - currentDate.getDay() + 7) % 7;
      const nextMatchingDay = addDays(currentDate, daysUntilNext);

      if (nextMatchingDay <= end && selectedDays[Object.keys(dayMap)[dayNum]].start) {
        // add the date and its start/end time to the result
        dates.push({
          date: new Date(nextMatchingDay),
          startTime: selectedDays[Object.keys(dayMap)[dayNum]].start,
          endTime: selectedDays[Object.keys(dayMap)[dayNum]].end,
        });
      }
    });

    // move to the next date based on the repeat logic
    currentDate = addFunction(currentDate, step);
  }
  return dates
};
