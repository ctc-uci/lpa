import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Spinner, Text } from "@chakra-ui/react";

import { getBackendBaseUrl } from "../../utils/calendar";
import { refreshToken } from "../../utils/auth/firebase";

export const GoogleCalendarOAuthCallback = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("Connecting Google Calendar…");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");
    const oauthError = params.get("error");

    const finish = async () => {
      if (oauthError) {
        setMessage("Google authorization was cancelled or denied.");
        setTimeout(() => navigate("/settings/googlecalendar", { replace: true }), 2000);
        return;
      }

      if (!code || !state) {
        setMessage("Missing authorization code. Returning to settings.");
        setTimeout(() => navigate("/settings/googlecalendar", { replace: true }), 2000);
        return;
      }

      try {
        await refreshToken();
        const res = await fetch(
          `${getBackendBaseUrl()}/google-calendar/oauth/exchange`,
          {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code, state }),
          }
        );

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.message || `Exchange failed (${res.status})`);
        }

        navigate("/settings/googlecalendar", { replace: true });
      } catch (e) {
        setMessage(e.message || "Could not complete Google Calendar connection.");
        setTimeout(() => navigate("/settings/googlecalendar", { replace: true }), 3000);
      }
    };

    finish();
  }, [navigate]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="40vh"
      gap={4}
      padding={8}
    >
      <Spinner size="lg" />
      <Text fontSize="md" color="gray.700">
        {message}
      </Text>
    </Box>
  );
};
