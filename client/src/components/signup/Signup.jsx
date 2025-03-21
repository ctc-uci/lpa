import { useEffect, useState } from "react";

import {
  Box,
  Button,
  Divider,
  Link as ChakraLink,
  FormControl,
  FormErrorMessage,
  Heading,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Stack,
  useToast,
  VStack,
  Text,
  HStack,
} from "@chakra-ui/react";

import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import logo from "../../assets/logo/logo.png";
import programSvg from "../../assets/icons/program.svg";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";

import { useAuthContext } from "../../contexts/hooks/useAuthContext";
import { useBackendContext } from "../../contexts/hooks/useBackendContext";

const signupSchema = z.object({
  first_name: z.string("Invalid first name").min(1, { message: "First name required" }),
  last_name: z.string("Invalid last name").min(1, { message: "Last name required" }),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  confirmPassword: z.string().min(6, "Confirm Password must be at least 6 characters long"),
})
.refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const Signup = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { signup, handleRedirectResult } = useAuthContext();
  const { backend } = useBackendContext();

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

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
        navigate("/signup/requested");
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

  useEffect(() => {
    handleRedirectResult(backend, navigate, toast);
  }, [backend, handleRedirectResult, navigate, toast]);

  return (
    <VStack
      spacing={5}
      sx={{ width: 550, marginX: "auto", mt:"20"}}
    >
      <Box
        as="img"
        src={logo}
        height={"120px"}
        width={"230px"}
      />
      <Heading fontFamily="'Inter', sans-serif" color={"#4E4AE7"}>Create Account</Heading>
      <Divider h={"2px"} mt={-"10px"} opacity="1" borderColor={"#4E4AE7"} w="60%"/>
      <Text fontSize={"17px"}>Please enter your information</Text>
      <form
        onSubmit={handleSubmit(handleSignup)}
        style={{ width: "100%" }}
      >
        <Stack spacing={2}>
        <HStack align="start">
          <VStack align="start" w="100%">
            <FormControl
              isInvalid={!!errors.first_name}
              w={"100%"}
            >
              <label htmlFor="first">First name</label>
              <InputGroup>
                <InputLeftElement 
                  pointerEvents="none"
                  display="flex"
                  alignItems="center"
                  h="100%"
                >
                  <Box as="img" src={programSvg} boxSize="20px" />
                </InputLeftElement>
                <Input
                  placeholder="First name"
                  type="text"
                  borderRadius={"10px"}
                  pl={-"4px"}
                  size={"lg"}
                  {...register("first_name")}
                  name="first_name"
                  isRequired
                />
              </InputGroup>
              <FormErrorMessage minH="20px">
                {errors.first_name?.message?.toString()}
              </FormErrorMessage>
            </FormControl>
          </VStack>
          <VStack align="start" w="100%">
            <FormControl
              isInvalid={!!errors.last_name}
              w={"100%"}
            >
              <label htmlFor="last">Last name</label>
              <InputGroup>
                <InputLeftElement 
                  pointerEvents="none"
                  display="flex"
                  alignItems="center"
                  h="100%"
                >
                  <Box as="img" src={programSvg} boxSize="20px" />
                </InputLeftElement>
              
                <Input
                  placeholder="Last name"
                  type="text"
                  size={"lg"}
                  borderRadius={"10px"}
                  {...register("last_name")}
                  name="last_name"
                  isRequired
                />
              </InputGroup>
              <FormErrorMessage minH="20px">
                {errors.last_name?.message?.toString()}
              </FormErrorMessage>
            </FormControl>
          </VStack>
        </HStack>
          <FormControl
            isInvalid={!!errors.email}
            w={"100%"}
          >
            <label htmlFor="email">Email</label>
            <InputGroup>
              <InputLeftElement 
                pointerEvents="none"
                display="flex"
                alignItems="center"
                h="100%"
              >
                <Box as="img" src={programSvg} boxSize="20px" />
              </InputLeftElement>
              <Input
                placeholder="Email"
                type="text"
                size={"lg"}
                borderRadius={"10px"}
                {...register("email")}
                name="email"
                isRequired
                autoComplete="email"
              />
            </InputGroup>
            <FormErrorMessage>
              {errors.email?.message?.toString()}
            </FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={!!errors.password}>
          <label htmlFor="password">Password</label>
          <InputGroup>
            <InputLeftElement 
              pointerEvents="none"
              display="flex"
              alignItems="center"
              h="100%"
            >
              <Box as="img" src={programSvg} boxSize="20px" />
            </InputLeftElement>
            <Input
              placeholder="Password"
              type={isPasswordVisible ? 'text' : 'password'}
              size={"lg"}
              borderRadius={"10px"}
              {...register("password")}
              name="password"
              isRequired
              autoComplete="password"
            />
            <InputRightElement 
              display="flex"
              alignItems="center"
              h="100%"
            >
              <button onClick={() => {setIsPasswordVisible((prev) => !prev)}} style={{ background: 'none', border: 'none' }}>
                {isPasswordVisible ? <AiOutlineEyeInvisible color="gray" /> : <AiOutlineEye color="gray" />}
              </button>
            </InputRightElement>
          </InputGroup>
            <FormErrorMessage>
              {errors.password?.message?.toString()}
            </FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={!!errors.confirmPassword}>
          <label htmlFor="confirmPassword">Confirm Password</label>
          <InputGroup>
            <InputLeftElement 
              pointerEvents="none"
              display="flex"
              alignItems="center"
              h="100%"
            >
              <Box as="img" src={programSvg} boxSize="20px" />
            </InputLeftElement>
            <Input
              placeholder="Confirm Password"
              type={isConfirmPasswordVisible ? 'text' : 'password'}
              size={"lg"}
              borderRadius={"10px"}
              {...register("confirmPassword")}
              name="confirmPassword"
              isRequired
              autoComplete="password"
            />
            <InputRightElement 
              display="flex"
              alignItems="center"
              h="100%"
            >
              <button onClick={() => {setIsConfirmPasswordVisible((prev) => !prev)}} style={{ background: 'none', border: 'none' }}>
                {isConfirmPasswordVisible ? <AiOutlineEyeInvisible color="gray" /> : <AiOutlineEye color="gray" />}
              </button>
            </InputRightElement>
          </InputGroup>
            <FormErrorMessage>
              {errors.confirmPassword?.message}
            </FormErrorMessage>
          </FormControl>

          <HStack
            pt="10px"
          >
              <Button
                type="submit"
                size={"lg"}
                borderRadius={"20px"}
                sx={{ width: "100%" }}
              >
                <ChakraLink as={Link} to="/login">
                  Cancel
                </ChakraLink>
              </Button>

            <Button
              type="submit"
              size={"lg"}
              sx={{ width: "100%" }}
              borderRadius={"20px"}
              bg={"#4E4AE7"}
              textColor={"white"}
              isDisabled={Object.keys(errors).length > 0}
            >
              Enter
            </Button>
          </HStack>
        </Stack>
      </form>
    </VStack>
  );
};
