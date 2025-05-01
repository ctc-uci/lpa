import { useEffect, useState } from "react";

import {
  Box,
  Button,
  Link as ChakraLink,
  FormControl,
  FormErrorMessage,
  Heading,
  HStack,
  Icon,
  Input,
  Stack,
  Text,
  useToast,
  VStack,
} from "@chakra-ui/react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { AiFillEye, AiFillLock, AiFillMail } from "react-icons/ai";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";

import logo from "../../assets/logo/logo.png";
import { useAuthContext } from "../../contexts/hooks/useAuthContext";
import { useBackendContext } from "../../contexts/hooks/useBackendContext";

import "./Signup.css";

const signupSchema = z
  .object({
    first_name: z
      .string("Invalid first name")
      .min(1, { message: "First name required" }),
    last_name: z
      .string("Invalid last name")
      .min(1, { message: "Last name required" }),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    confirmPassword: z
      .string()
      .min(6, "Confirm Password must be at least 6 characters long"),
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
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);

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
    <div className="entry-page">
      <VStack
        spacing={5}
        className="signup-container"
      >
        <Box
          as="img"
          src={logo}
          className="logo"
        />
        <div className="header-container">
          <Heading className="create-account-heading">Create Account</Heading>
          <Text className="account-info-text">
            Please enter your account information.
          </Text>
        </div>
        <form
          onSubmit={handleSubmit(handleSignup)}
          className="signup-form"
        >
          <Stack spacing={2}>
            {/* Name Fields */}
            <div className="name-fields">
              <HStack
                align="start"
                style={{ width: "363px", justifyContent: "space-between" }}
              >
                <VStack
                  align="flex-start"
                  w="173px"
                >
                  <FormControl isInvalid={!!errors.first_name}>
                    <div className="name-field-container">
                      <label
                        htmlFor="first"
                        className="form-label"
                      >
                        First Name
                      </label>
                      <div className={errors.first_name ? "name-input-outer-error" : "name-input-outer"}>
                        <div className="name-input-container">
                          <Input
                            id="first"
                            placeholder="First name"
                            type="text"
                            variant="unstyled"
                            className="name-input-text"
                            {...register("first_name")}
                            isRequired
                          />
                        </div>
                      </div>
                    </div>
                    <FormErrorMessage className="form-error">
                      {errors.first_name?.message?.toString()}
                    </FormErrorMessage>
                  </FormControl>
                </VStack>

                <VStack
                  align="flex-start"
                  w="173px"
                >
                  <FormControl isInvalid={!!errors.last_name}>
                    <div className="name-field-container">
                      <label
                        htmlFor="last"
                        className="form-label"
                      >
                        Last Name
                      </label>
                      <div className={errors.last_name ? "name-input-outer-error" : "name-input-outer"}>

                        <div className="name-input-container">
                          <Input
                            id="last"
                            placeholder="Last name"
                            type="text"
                            variant="unstyled"
                            className="name-input-text"
                            {...register("last_name")}
                            isRequired
                          />
                        </div>
                      </div>
                    </div>
                    <FormErrorMessage className="form-error">
                      {errors.last_name?.message?.toString()}
                    </FormErrorMessage>
                  </FormControl>
                </VStack>
              </HStack>
            </div>

            {/* Fields Container */}
            <div className="fields-container">
              {/* Email Field */}
              <FormControl
                isInvalid={!!errors.email}
                className="form-field-container"
              >
                <label
                  htmlFor="email"
                  className="form-label"
                >
                  Email
                </label>
                <div className={errors.email ? "input-outer-email-error" : "input-outer-email"}>

                  <div className="input-icon-container">
                    <Icon
                      as={AiFillMail}
                      boxSize="22px"
                      color="#718096"
                    />
                  </div>
                  <div className="input-text-container">
                    <Input
                      id="email"
                      placeholder="Your email"
                      type="text"
                      variant="unstyled"
                      className="input-text"
                      {...register("email")}
                      isRequired
                      autoComplete="email"
                    />
                  </div>
                  <div className="input-right-icon-container">
                    {/* No right icon for email */}
                  </div>
                </div>
                <FormErrorMessage className="form-error">
                  {errors.email?.message?.toString()}
                </FormErrorMessage>
              </FormControl>

              {/* Password Field */}
              <FormControl
                isInvalid={!!errors.password}
                className="form-field-container"
              >
                <label
                  htmlFor="password"
                  className="form-label"
                >
                  Password
                </label>
                <div className={errors.password ? "input-outer-password-error" : "input-outer-password"}>
                  <div className="input-icon-container">
                    <Icon
                      as={AiFillLock}
                      boxSize="24px"
                      color="#718096"
                    />
                  </div>
                  <div className="input-text-container">
                    <Input
                      id="password"
                      placeholder="Your password"
                      type={isPasswordVisible ? "text" : "password"}
                      variant="unstyled"
                      className="input-text"
                      {...register("password")}
                      isRequired
                      autoComplete="password"
                    />
                  </div>
                  <div className="input-right-icon-container">
                    <button
                      type="button"
                      onClick={() => setIsPasswordVisible((prev) => !prev)}
                      className="icon-button"
                    >
                      <Icon
                        as={AiFillEye}
                        boxSize="24px"
                        color="#718096"
                      />
                    </button>
                  </div>
                </div>
                <FormErrorMessage className="form-error">
                  {errors.password?.message?.toString()}
                </FormErrorMessage>
              </FormControl>

              {/* Confirm Password Field */}
              <FormControl
                isInvalid={!!errors.confirmPassword}
                className="form-field-container"
              >
                <label
                  htmlFor="confirmPassword"
                  className="form-label"
                >
                  Confirm Password
                </label>
                <div className={errors.confirmPassword ? "input-outer-password-confirm-error" : "input-outer-password-confirm"}>

                  <div className="input-icon-container">
                    <Icon
                      as={AiFillLock}
                      boxSize="24px"
                      color="#718096"
                    />
                  </div>
                  <div className="input-text-container">
                    <Input
                      id="confirmPassword"
                      placeholder="Your password"
                      type={isConfirmPasswordVisible ? "text" : "password"}
                      variant="unstyled"
                      className="input-text"
                      {...register("confirmPassword")}
                      isRequired
                      autoComplete="password"
                    />
                  </div>
                  <div className="input-right-icon-container">
                    <button
                      type="button"
                      onClick={() =>
                        setIsConfirmPasswordVisible((prev) => !prev)
                      }
                      className="icon-button"
                    >
                      <Icon
                        as={AiFillEye}
                        boxSize="24px"
                        color="#718096"
                      />
                    </button>
                  </div>
                </div>
                <FormErrorMessage className="form-error">
                  {errors.confirmPassword?.message}
                </FormErrorMessage>
              </FormControl>
            </div>

            {/* Button Group */}
            <HStack className="button-group">
              <Button
                type="button"
                className="cancel-button"
              >
                <ChakraLink
                  as={Link}
                  to="/login"
                >
                  Back to Login
                </ChakraLink>
              </Button>
              <Button
                type="submit"
                className="submit-button"
                isDisabled={Object.keys(errors).length > 0}
              >
                Create Account
              </Button>
            </HStack>
          </Stack>
        </form>
      </VStack>
    </div>
  );
};
