import {
    Button,
    Center,
    Link as ChakraLink,
    Heading,
    VStack,
    Text,
    Image,
    Box,
} from "@chakra-ui/react";

import { Link } from "react-router-dom";
import logo from "../../assets/logo/logo.png";

export const ForgotPasswordSent = () => {
    return (
      <Center h="100vh">
          <VStack spacing={4} w="100%" maxW="500px" textAlign="center">
            <Image
              src={logo}
              alt="Logo"
              w="40%"
              objectFit="contain"
            />
    
            <Heading color="#4E4AE7" fontSize="4xl">
              Email Sent
            </Heading>
            <Box
              w="45%"
              h="3px"
              bg="#4E4AE7"
              borderRadius="full"
            />
    
            <Text fontSize="lg" color="#474849" mb={6}>
              Please open your inbox to reset password.
            </Text>
    
            <ChakraLink
              as={Link} 
              to="/login"
            >
              <Button
                size="lg"
                bg="#4E4AE7"
                color="white"
                _hover={{ bg: "#3b39c4" }}
                borderRadius="full"
                fontSize="md"
                w="100%"
              >
                Back to Login
              </Button>
            </ChakraLink>
          </VStack>
    </Center>
  );
};