import { useNavigate } from "react-router-dom";
import { Box, Flex } from "@chakra-ui/react";
import googleCalendarSvg from "../../assets/icons/google-calendar.svg";
import plusSvg from "../../assets/icons/plus.svg";

export const HeaderRowComponent = () => {
  const navigate = useNavigate();

  return (
    <Flex className="header-row">
      <Box
        className="google-calendar"
        onClick={() => {
          // handle google calendar logic
        }}
      >
        <image
          src={googleCalendarSvg}
          alt="Google Calendar"
          className="google-calendar-icon"
        />
        <span className="google-calendar-text">Google Calendar</span>
      </Box>

      <Box
        className="new-program"
        onClick={() => navigate("/programs/newprogram")}
      >
        <img
          src={plusSvg}
          alt="New Program"
          className="new-program-icon"
        />
        <span className="new-program-text">New Program</span>
      </Box>
    </Flex>

  );
};
