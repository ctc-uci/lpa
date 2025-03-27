import { useCallback, useEffect, useState } from "react";

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
  InputRightElement,
  VStack,
  Checkbox,
  Text,
  Image,
  useToast,
  Flex,
  Box,
} from "@chakra-ui/react";

import { FaEnvelope } from "react-icons/fa6";
import { RiLockPasswordFill } from "react-icons/ri";
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";

import { useAuthContext } from "../../contexts/hooks/useAuthContext";
import { useBackendContext } from "../../contexts/hooks/useBackendContext";

const signinSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export const Login = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const { login, handleRedirectResult } = useAuthContext();
  const { backend } = useBackendContext();

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signinSchema),
    mode: "onBlur",
  });

  const toastLoginError = useCallback(
    (msg) => {
      toast({
        title: "An error occurred while signing in",
        description: msg,
        status: "error",
        variant: "subtle",
      });
    },
    [toast]
  );

  const handleLogin = async (data) => {
    try {
      await login({
        email: data.email,
        password: data.password,
      });

      const permitCheck = await backend.get(`/users/email/${data.email}`);
      if (permitCheck.data.editPerms === false) {
        throw {
          code: "auth/no-permission",
        }
      };

      navigate("/programs");
    } catch (err) {
      const errorCode = err.code;
      const firebaseErrorMsg = err.message;

      switch (errorCode) {
        case "auth/wrong-password":
        case "auth/invalid-credential":
        case "auth/invalid-email":
        case "auth/user-not-found":
          toastLoginError(
            "Email address or password does not match our records!"
          );
          break;
        case "auth/unverified-email":
          toastLoginError("Please verify your email address.");
          break;
        case "auth/user-disabled":
          toastLoginError("This account has been disabled.");
          break;
        case "auth/too-many-requests":
          toastLoginError("Too many attempts. Please try again later.");
          break;
        case "auth/user-signed-out":
          toastLoginError("You have been signed out. Please sign in again.");
          break;
        case "auth/no-permission":
          toastLoginError("Your permission has not been approved by admin.");
          break;
        default:
          toastLoginError(firebaseErrorMsg);
      }
    }
  };

  useEffect(() => {
    handleRedirectResult(backend, navigate, toast);
  }, [backend, handleRedirectResult, navigate, toast]);

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
          Sign In
        </Heading>
        <Box
          w="45%"
          h="3px"
          bg="#4E4AE7"
          borderRadius="full"
        />

        <Text fontSize="lg" color="#474849" mb={6}>
          Please enter your login information.
        </Text>

        <form onSubmit={handleSubmit(handleLogin)} style={{ width: "100%" }}>
          <VStack spacing={4} w="100%">
            <FormControl isInvalid={!!errors.email}>
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

            <FormControl isInvalid={!!errors.password}>
              <InputGroup>
                <InputLeftElement pointerEvents="none" h="100%">
                  <RiLockPasswordFill color="gray" />
                </InputLeftElement>
                <Input
                  placeholder="Password"
                  type={isPasswordVisible ? 'text' : 'password'}
                  size="lg"
                  {...register("password")}
                  isRequired
                  autoComplete="current-password"
                  borderRadius="md"
                  border="1px solid gray"
                />
                <InputRightElement h="100%">
                  <button onClick={togglePasswordVisibility} style={{ background: 'none', border: 'none' }}>
                    {isPasswordVisible ? <AiOutlineEyeInvisible color="gray" /> : <AiOutlineEye color="gray" />}
                  </button>
                </InputRightElement>
              </InputGroup>
              <FormErrorMessage>
                {errors.password?.message?.toString()}
              </FormErrorMessage>
            </FormControl>

            <Flex justify="space-between" align="center" w="100%" mb={6}>
              <Checkbox size="md" color="#767778">
                Keep me signed in
              </Checkbox>
              <ChakraLink as={Link} to="/forgotpassword" fontSize="md" color="#767778">
                Forgot password?
              </ChakraLink>
            </Flex>

            <Flex justify="space-between" align="center" w="100%">
              <Text w="100%" color="#474849">
                <ChakraLink as={Link} to="/signup" fontWeight="bold">
                  Create Account
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
                Let's Go
              </Button>
            </Flex>
          </VStack>
        </form>
      </VStack>
    </Center>
  );
};
