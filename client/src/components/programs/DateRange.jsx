import { Text } from "@chakra-ui/react";

export const DateRange = ({ sessions }) => {
    if (!sessions || sessions.length === 0) {
      return <Text color="gray.600">No dates available</Text>;
    }
  
    const sortedSessions = [...sessions].sort((a, b) => {
      return new Date(a.date) - new Date(b.date);
    });
  
    // Format date for display
    const formatDate = (dateString) => {
      const date = new Date(dateString);
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
  
    const dateRangeText = `Starts on ${formatDate(firstSession.date)} and ends on ${formatDate(lastSession.date)}`;
  
    return (
      <Text color="gray.600" mt={1}>
        {dateRangeText}
      </Text>
    );
  };