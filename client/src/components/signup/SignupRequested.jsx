import { useEffect } from "react";

import { Box, Button, Heading, Text, VStack } from "@chakra-ui/react";

import { Link, useNavigate } from "react-router-dom";

import logo from "../../assets/logo/logo.png";
import { useAuthContext } from "../../contexts/hooks/useAuthContext";
import { useRoleContext } from "../../contexts/hooks/useRoleContext";

import "./SignupRequested.css";

export const SignupRequested = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuthContext();
  const { editPerms } = useRoleContext();

  useEffect(() => {
    const expiration = localStorage.getItem("loginExpiration");
    if (currentUser && editPerms && expiration && new Date(expiration) > new Date()) {
      navigate("/programs", { replace: true });
    }
  }, [currentUser, editPerms, navigate]);

  return (
    <div className="entry-page">
      <VStack
        spacing={4}
        className="request-container"
      >
        <Box
          as="img"
          src={logo}
          className="logo"
        />
        <div className="header-container">
          <Heading className="request-heading">Account Request Sent!</Heading>
          <Text className="account-info-text">
            Your account is waiting approval.
          </Text>
          <Text className="contact-text">
            For questions, please contact classes@lapena.org
          </Text>
        </div>
        <Button
          as={Link}
          to="/login"
          className="back-button"
          mt="20px"
        >
          Back to Login
        </Button>
      </VStack>
    </div>
  );
};
