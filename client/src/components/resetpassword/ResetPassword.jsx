import { useState } from "react";

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
  VStack,
} from "@chakra-ui/react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { AiFillEye, AiFillLock, AiFillMail } from "react-icons/ai";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";

import logo from "../../assets/logo/logo.png";

import "../signup/Signup.css";

const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export const ResetPassword = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onBlur",
  });

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const onSubmit = (data) => {
    // Reset password functionality can be added here.
    // console.log("Reset password data:", data);
    navigate("/resetpassword/success");
  };

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
          <Heading className="create-account-heading">Set New Password</Heading>
          <Text className="account-info-text">
            Please enter a new password for your account.
          </Text>
        </div>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="signup-form"
        >
          <Stack spacing={2}>
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
                <div className="input-outer">
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
                <div className="input-outer">
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
                      placeholder="New Password"
                      type={isPasswordVisible ? "text" : "password"}
                      variant="unstyled"
                      className="input-text"
                      {...register("password")}
                      isRequired
                      autoComplete="new-password"
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
            </div>
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
                Reset Password
              </Button>
            </HStack>
          </Stack>
        </form>
      </VStack>
    </div>
  );
};
