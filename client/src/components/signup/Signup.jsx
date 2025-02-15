import { useEffect } from "react";

import {
  Button,
  Center,
  Link as ChakraLink,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  Heading,
  Input,
  Stack,
  useToast,
  VStack,
  Text,
} from "@chakra-ui/react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FaGoogle } from "react-icons/fa6";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";

import { useAuthContext } from "../../contexts/hooks/useAuthContext";
import { useBackendContext } from "../../contexts/hooks/useBackendContext";
import { authenticateGoogleUser } from "../../utils/auth/providers";

const signupSchema = z.object({
  first_name: z.string("Invalid first name").min(1, { message: "First name required" }),
  last_name: z.string("Invalid last name").min(1, { message: "Last name required" }),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export const Signup = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { signup, handleRedirectResult } = useAuthContext();
  const { backend } = useBackendContext();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
    mode: "onBlur",
  });

  const handleSignup = async (data) => {
    try {
      const user = await signup({
        email: data.email,
        password: data.password,
        first_name: data.first_name,
        last_name: data.last_name,

      });

      if (user) {
        navigate("/dashboard");
      }
    } catch (err) {
      if (err instanceof Error) {
        toast({
          title: "An error occurred",
          description: err.message,
          status: "error",
          variant: "subtle",
        });
      }
    }
  };

  const handleGoogleSignup = async () => {
    await authenticateGoogleUser();
  };

  useEffect(() => {
    handleRedirectResult(backend, navigate, toast);
  }, [backend, handleRedirectResult, navigate, toast]);

  return (
    <VStack
      spacing={8}
      sx={{ width: 300, marginX: "auto" }}
    >
      <Heading>SignUp</Heading>

      <form
        onSubmit={handleSubmit(handleSignup)}
        style={{ width: "100%" }}
      >
        <Stack spacing={2}>
        <FormControl
            isInvalid={!!errors.first_name}
            w={"100%"}
          >
            <label htmlFor="first">First name</label>
            <Center id="first">
              <Input
                placeholder="First name"
                type="text"
                size={"lg"}
                {...register("first_name")}
                name="first_name"
                isRequired
              />
            </Center>
            <FormErrorMessage>
              {errors.first_name?.message?.toString()}
            </FormErrorMessage>
          </FormControl>
          <FormControl
            isInvalid={!!errors.last_name}
            w={"100%"}
          >
            <label htmlFor="last">Last name</label>
            <Center id="last">
              <Input
                placeholder="Last name"
                type="text"
                size={"lg"}
                {...register("last_name")}
                name="last_name"
                isRequired
              />
            </Center>
            <FormErrorMessage>
              {errors.last_name?.message?.toString()}
            </FormErrorMessage>
          </FormControl>
          <FormControl
            isInvalid={!!errors.email}
            w={"100%"}
          >
            <label htmlFor="email">Email</label>
            <Center id="email">
              <Input
                placeholder="Email"
                type="text"
                size={"lg"}
                {...register("email")}
                name="email"
                isRequired
                autoComplete="email"
              />
            </Center>
            <FormErrorMessage>
              {errors.email?.message?.toString()}
            </FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={!!errors.password}>
          <label htmlFor="password">Password</label>
            <Center id="password">
              <Input
                placeholder="Password"
                type="password"
                size={"lg"}
                {...register("password")}
                name="password"
                isRequired
                autoComplete="password"
              />
            </Center>
            <FormErrorMessage>
              {errors.password?.message?.toString()}
            </FormErrorMessage>
          </FormControl>

          <Button
            type="submit"
            size={"lg"}
            sx={{ width: "100%" }}
            isDisabled={Object.keys(errors).length > 0}
          >
            Sign Up
          </Button>

        <Text>Already have an account? <ChakraLink>Log in</ChakraLink></Text>
        </Stack>
      </form>
    </VStack>
  );
};
