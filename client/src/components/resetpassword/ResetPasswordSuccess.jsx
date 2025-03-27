import { Box, Button, Heading, Text, VStack } from "@chakra-ui/react";

import { Link } from "react-router-dom";

import logo from "../../assets/logo/logo.png";

import "../signup/SignupRequested.css";

export const ResetPasswordSuccess = () => {
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
          <Heading className="request-heading">New Password is Set!</Heading>
          <Text className="account-info-text">
            Please login with your new password.
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
