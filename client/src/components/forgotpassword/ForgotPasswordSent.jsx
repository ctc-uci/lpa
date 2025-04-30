import {
  Box,
  Button,
  Center,
  Link as ChakraLink,
  Heading,
  Text,
  VStack,
} from "@chakra-ui/react";

import { Link } from "react-router-dom";

import logo from "../../assets/logo/logo.png";
import "./ForgotPassword.css";

export const ForgotPasswordSent = () => {
  return (
    <Center
      h="100vh"
      className="entry-page"
    >
      <VStack
        spacing={4}
        className="signup-container"
      >
        <Box
          as="img"
          src={logo}
          className="logo"
        />

        <div className="header-forgot-sent-container">
          <Heading className="login-heading">Email Sent</Heading>
          <Text className="account-info-text">
            Please open your inbox for an email from La Peña Cultural Center.
          </Text>
          <Text className="account-info-text">
            Click on the link there to reset password.
          </Text>
        </div>
        <ChakraLink
          as={Link}
          to="/login"
        >
          <Button
            type="button"
            height="40px"
            padding="0px 16px"
            justifyContent="center"
            alignItems="center"
            borderRadius="6px"
            background="#4441C8"
            color="white"
            fontFamily="Inter"
            fontSize={14}
            fontWeight={500}
            w={176}
            textAlign={"center"}
            _hover={{ background: "#3835a0" }} // Optional: darker on hover
          >
            Back to Login
          </Button>
        </ChakraLink>
      </VStack>
    </Center>
  );
};
