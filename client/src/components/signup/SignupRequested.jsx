import { Box, Button, Heading, Text, VStack } from "@chakra-ui/react";

import { Link } from "react-router-dom";

import logo from "../../assets/logo/logo.png";

import "./SignupRequested.css";

export const SignupRequested = () => {
  return (
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
          For questions, please contact rocio@lapena.org
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
  );
};
