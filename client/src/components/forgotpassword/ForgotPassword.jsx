import {
    Button,
    Center,
    Link as ChakraLink,
    FormControl,
    FormErrorMessage,
    Heading,
    Input,
    InputGroup, 
    InputLeftElement,
    VStack,
    Text,
    Image,
    useToast,
    Flex,
    Box,
} from "@chakra-ui/react";

import { FaEnvelope } from "react-icons/fa6";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";

import { useAuthContext } from "../../contexts/hooks/useAuthContext";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const ForgotPassword = () => {
  const navigate = useNavigate();
  const { resetPassword } = useAuthContext();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onBlur",
  });

  const handleResetEmail = async (data) => {
    try {
      const email = data.email;
      await resetPassword({email});
      navigate("/forgotpassword/sent");
    } catch (error) {
        toast({
            title: "An error occurred while sending reset email",
            description: error.message,
            status: "error",
            variant: "subtle"
        });
    }
  };

  return (
    <Center h="100vh">
      <VStack spacing={4} w="100%" maxW="500px" textAlign="center">
        <Image
          src="src/assets/logo/logo.png"
          alt="Logo"
          w="40%"
          objectFit="contain"
        />

        <Heading color="#4E4AE7" fontSize="4xl">
          Forgot Password?
        </Heading>
        <Box
          w="45%"
          h="3px"
          bg="#4E4AE7"
          borderRadius="full"
        />

        <Text fontSize="lg" color="#474849" mb={6}>
          All good, we will send reset instructions.
        </Text>

        <form onSubmit={handleSubmit(handleResetEmail)} style={{ width: "100%" }}>
          <VStack spacing={4} w="100%">
            <FormControl isInvalid={!!errors.email} mb={6}>
              <InputGroup>
                <InputLeftElement pointerEvents="none" h="100%">
                  <FaEnvelope color="gray" />
                </InputLeftElement>
                <Input
                  placeholder="Email"
                  type="email"
                  size="lg"
                  {...register("email")}
                  isRequired
                  autoComplete="email"
                  borderRadius="md"
                  border="1px solid gray"
                />
              </InputGroup>
              <FormErrorMessage>
                {errors.email?.message?.toString()}
              </FormErrorMessage>
            </FormControl>

            <Flex justify="space-between" align="center" w="100%">
              <Text w="100%" color="#474849">
                <ChakraLink as={Link} to="/login" fontWeight="bold">
                  Back to Login
                </ChakraLink>
              </Text>
              <Button
                type="submit"
                size="lg"
                bg="#4E4AE7"
                color="white"
                _hover={{ bg: "#3b39c4" }}
                borderRadius="full"
                fontSize="md"
                w="100%"
              >
                Reset Password
              </Button>
            </Flex>
          </VStack>
        </form>
      </VStack>
    </Center>
  );
};



