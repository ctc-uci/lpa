import { Flex, Text } from "@chakra-ui/react";

import { parseSessionDate } from "./utils";

export const DateRange = ({ sessions }) => {
  if (!sessions || sessions.length === 0) {
    return <Text color="gray.600">No dates available</Text>;
  }

  const sortedSessions = [...sessions].sort((a, b) => {
    const tA = parseSessionDate(a.date)?.getTime() ?? 0;
    const tB = parseSessionDate(b.date)?.getTime() ?? 0;
    return tA - tB;
  });

  // Format date for display (parseSessionDate keeps calendar day correct in user TZ)
  const formatDate = (dateString) => {
    const date = parseSessionDate(dateString);
    if (!date) return "";
    const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "short" });
    const month = date.toLocaleDateString("en-US", { month: "numeric" });
    const day = date.toLocaleDateString("en-US", { day: "numeric" });
    const year = date.toLocaleDateString("en-US", { year: "numeric" });

    return `${dayOfWeek}. ${month}/${day}/${year}`;
  };

  const firstSession = sortedSessions[0];
  const lastSession = sortedSessions[sortedSessions.length - 1];

  // Make sure we have valid sessions with dates
  if (!firstSession?.date || !lastSession?.date) {
    return <Text color="gray.600">No dates available</Text>;
  }

  const firstDate = `${formatDate(firstSession.date)}`;
  const secondDate = `${formatDate(lastSession.date)}`;

  return (
    <Flex
      alignItems={"center"}
      flexDirection="row"
      gap={1}
    >
      <Text
        color="gray.600"
        fontSize={"14px"}
        fontFamily={"Inter"}
        fontWeight={"400"}
      >
        Starts on
      </Text>
      <Text
        fontFamily="Inter"
        fontSize={"14px"}
        fontWeight={"500"}
        lineHeight={"normal"}
        color="#2D3748"
      >
        {firstDate}
      </Text>
      <Text
        fontSize={"14px"}
        fontFamily={"Inter"}
        fontWeight={"400"}
      >
        and ends on
      </Text>
      <Text
        fontFamily="Inter"
        fontSize={"14px"}
        fontWeight={"500"}
        lineHeight={"normal"}
        color="#2D3748"
      >
        {secondDate}
      </Text>
    </Flex>
  );
};
