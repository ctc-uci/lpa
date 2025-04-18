import {
  Box,
  Button,
  Center,
  Link as ChakraLink,
  FormControl,
  FormErrorMessage,
  Heading,
  Icon,
  Input,
  Text,
  useToast,
  VStack,
  HStack
} from "@chakra-ui/react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { AiFillMail } from "react-icons/ai";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";

import logo from "../../assets/logo/logo.png";
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
      await resetPassword({ email });
      navigate("/forgotpassword/sent");
    } catch (error) {
      toast({
        title: "An error occurred while sending reset email",
        description: error.message,
        status: "error",
        variant: "subtle",
      });
    }
  };

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

        <div className="header-forgot-container">
          <Heading className="login-heading">Forgot Password</Heading>
          <Text className="account-info-text">
            Enter your email associated with this account.
          </Text>
          <Text className="account-info-text">
            We will send reset instructions.
          </Text>
        </div>

        <form
          onSubmit={handleSubmit(handleResetEmail)}
          style={{ width: "100%" }}
        >
          <VStack
            spacing={4}
            w="100%"
          >
            <div className="login-fields-container">
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
                Send Instructions
              </Button>
            </HStack>
          </VStack>
        </form>
      </VStack>
    </Center>
  );
};
