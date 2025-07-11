import { useState, useEffect } from "react";
import { Divider, Text, Heading, Icon, Box, Button } from "@chakra-ui/react";
import { Flex, IconButton } from "@chakra-ui/react";
import { LeftIcon } from "../../assets/LeftIcon";
import Navbar from "../navbar/Navbar";
import { useNavigate } from "react-router-dom";
import CalendarSelector from "../calendar/CalendarSelector";
import { GcalAuthButton } from "../calendar/CalendarComponents";
import { isSignedIn, getCalendarEmail } from "../../utils/calendar";
import { GoogleCalendarIcon } from "../../assets/GoogleCalendarIcon";
export const GoogleCalendar = () => {
  const [signedIn, setSignedIn] = useState(false);
  const [calendarEmail, setCalendarEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      setSignedIn(isSignedIn());
      setLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    const loadEmail = async () => {
      if (signedIn) {
        try {
          setLoadingEmail(true);
          setCalendarEmail("Loading...");
          const email = await getCalendarEmail();
          setCalendarEmail(email);
        } catch (error) {
          console.error("Failed to load calendar email:", error);
        }
      } else {
        setCalendarEmail("Signed Out");
      }
    };

    loadEmail();
  }, [signedIn, loadingEmail]);

  return (
    <Navbar>
      <Flex
        direction="column"
        padding="32px"
        gap="32px"
      >
        <Flex alignItems="center">
          <IconButton
            icon={<LeftIcon />}
            bg="white"
            onClick={() => {
              navigate("/settings");
            }}
          />
        </Flex>

        <Flex justifyContent="flex-start" gap="32px">
          <Flex justifyContent="flex-start" width="50%">
            <Box padding="6px 20px 20px 20px">
              <GoogleCalendarIcon size={46} />
            </Box>
            <Flex direction="column" gap="4px" marginLeft="16px">
              <Heading 
                color="#2D3748"
                fontSize="24px"
                fontWeight="700"
              >
                Google Calendar
              </Heading>
              {loading ? (
                <Text
                  fontSize="14px"
                  fontWeight="500"
                  letterSpacing="0.07px"
                  marginTop="4px"
                  color="#2D3748"
                >
                  Loading...
                </Text>
              ) : (
                <>
                  <Text
                    fontSize="14px"
                    fontWeight="500"
                    letterSpacing="0.07px"
                    marginTop="4px"
                    color={signedIn ? "#2D3748" : "#90080F"}
                  >
                    {calendarEmail}
                  </Text>
                  <Box
                    marginTop="20px"
                  >
                    <GcalAuthButton signedIn={signedIn} setSignedIn={setSignedIn} />
                  </Box>
                </>
              )}
            </Flex>
          </Flex>
          <Box width="100%" justifyContent="flex-start">
            {signedIn ? (
              <CalendarSelector />
            ): (
              <Text
                fontSize="14px"
                fontWeight="700"
                marginTop="5px"
                color="#2D3748"
              >
                Please sign in to your Google Calendar to sync your programs.
              </Text>
            )}
          </Box>
        </Flex>
      </Flex>
    </Navbar>
  );
};
