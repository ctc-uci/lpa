import { Box, Image, Text } from "@chakra-ui/react";

import { useNavigate } from "react-router-dom";

import googleCalendarSvg from "../../assets/icons/google-calendar.svg";
import plusSvg from "../../assets/icons/plus.svg";

export const HeaderRowComponent = () => {
  const navigate = useNavigate();

  return (
    <Box className="header-row">
      <Box
        className="google-calendar"
        onClick={() => {
          // handle google calendar logic
        }}
      >
        <Image
          src={googleCalendarSvg}
          alt="Google Calendar"
          className="google-calendar-icon"
        />
        <Text className="google-calendar-text">Google Calendar</Text>
      </Box>

      <Box className="header-right">
        <Box
          className="new-program"
          onClick={() => navigate("/programs/newprogram")}
        >
          <Image
            src={plusSvg}
            alt="New Program"
            className="new-program-icon"
          />
          <Text className="new-program-text">New Program</Text>
        </Box>
      </Box>
    </Box>
  );
};
