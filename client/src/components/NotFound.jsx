import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Text, VStack } from "@chakra-ui/react";

export const NotFound = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-2);
  };

  return (
    <Box
      minHeight="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      background="linear-gradient(135deg, rgba(255, 207, 113, 0.3) 10.44%, rgba(145, 162, 167, 0.28) 55.22%, rgba(35, 118, 221, 0.25) 100%), #fff"
    >
      <VStack spacing={8} textAlign="center" maxWidth="500px" padding="32px">
        {/* 404 Number */}
        <Text
          fontSize="120px"
          fontWeight="700"
          color="#2D3748"
          fontFamily="Inter"
          lineHeight="1"
          marginBottom="16px"
        >
          404
        </Text>

        {/* Error Message */}
        <VStack spacing={4}>
          <Text
            fontSize="32px"
            fontWeight="700"
            color="#2D3748"
            fontFamily="Inter"
            lineHeight="normal"
          >
            Page Not Found
          </Text>
          
          <Text
            fontSize="16px"
            fontWeight="500"
            color="#4A5568"
            fontFamily="Inter"
            lineHeight="normal"
            letterSpacing="0.08px"
            maxWidth="400px"
          >
            The page you're looking for doesn't exist or has been moved.
          </Text>
        </VStack>

        {/* Go Back Button */}
        <Button
          height="40px"
          padding="0px 16px"
          justifyContent="center"
          alignItems="center"
          gap="4px"
          borderRadius="6px"
          backgroundColor="#4441C8"
          color="white"
          fontFamily="Inter"
          fontSize="14px"
          fontStyle="normal"
          fontWeight="700"
          lineHeight="normal"
          letterSpacing="0.07px"
          _hover={{
            backgroundColor: "#312E8A",
          }}
          onClick={handleGoBack}
        >
          Go Back
        </Button>
      </VStack>
    </Box>
  );
};
