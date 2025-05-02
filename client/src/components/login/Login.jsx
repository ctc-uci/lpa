import { useCallback, useEffect, useState } from "react";

import {
  Box,
  Button,
  Center,
  Link as ChakraLink,
  FormControl,
  FormErrorMessage,
  Heading,
  HStack,
  Icon,
  Input,
  Text,
  useToast,
  VStack,
} from "@chakra-ui/react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  AiFillEye,
  AiFillLock,
  AiFillMail,
} from "react-icons/ai";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";

import logo from "../../assets/logo/logo.png";
import { useAuthContext } from "../../contexts/hooks/useAuthContext";
import { useBackendContext } from "../../contexts/hooks/useBackendContext";

import "./Login.css";

const signinSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export const Login = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const { login, handleRedirectResult, currentUser } = useAuthContext();
  const { backend } = useBackendContext();

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [credentialsError, setCredentialsError] = useState(false);
  const [permissionError, setPermissionError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [boxChecked, setBoxChecked] = useState(false);

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

  const handleEmailChange = (e) => {
    if (credentialsError) setCredentialsError("");
    setEmailError("");
    return e.target.value;
  };
  
  const handlePasswordChange = (e) => {
    if (credentialsError) setCredentialsError("");
    setPasswordError("");
    return e.target.value;
  };

  const handleLogin = async (data) => {
    try {
      await login(
        {
          email: data.email,
          password: data.password,
        },
        boxChecked
      );

      const permitCheck = await backend.get(`/users/email/${data.email}`);
      if (permitCheck.data.editPerms === false) {
        throw {
          code: "auth/no-permission",
        };
      }

      navigate("/programs");
    } catch (err) {
      const errorCode = err.code;
      const firebaseErrorMsg = err.message;

      switch (errorCode) {
        case "auth/wrong-password":
        case "auth/invalid-credential":
          setCredentialsError("Invalid email and password. Please try again or create an account.");
          setEmailError("Please enter a valid email address.");
          setPasswordError("Please enter a valid password.");
          break;
        case "auth/invalid-email":
        case "auth/user-not-found":
          toastLoginError(
            "Invalid and password. Please try again or create a new account."
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
          setPermissionError("Your account is still waiting for approval.");
          break;
        default:
          toastLoginError(firebaseErrorMsg);
      }
    }
  };

  useEffect(() => {
    const checkAuthAndPermissions = async () => {
      if (currentUser) {
        try {
          const permitCheck = await backend.get(`users/email/${currentUser.email}`);
          if (permitCheck.data.editPerms !== false) {
            navigate("/programs");
          }
        } catch (err) {
          console.error("Error checking permissions:", err);
        }
      }
    }
    checkAuthAndPermissions();
  }, [backend, currentUser, navigate]);

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

        <div className="header-container">
          <Heading className="login-heading">Log In</Heading>

          <Text className="account-info-text">
            Please enter your login information.
          </Text>
        </div>

        <form
          onSubmit={handleSubmit(handleLogin)}
          style={{ width: "100%" }}
        >
          <VStack
            spacing={4}
            w="100%"
          >
            {/* Fields Container */}
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
                <div className={(errors.email || emailError)? "input-outer-email-error" : "input-outer-email"}>
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
                      onChange={(e) => {
                        handleEmailChange(e);
                        // let react-hook-form also update its internal state
                        register("email").onChange(e);
                      }}
                      isRequired
                      autoComplete="email"
                    />
                  </div>
                  <div className="input-right-icon-container">
                    {/* No right icon for email */}
                  </div>
                </div>
                <FormErrorMessage className="form-error" color="#90080F" fontWeight={500}>
                Please enter a valid email address.
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
                <div className={(errors.password || passwordError) ? "input-outer-password-error" : "input-outer-password"}>
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
                      onChange={(e) => {
                        handlePasswordChange(e);
                        register("password").onChange(e);
                      }}
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
                <FormErrorMessage className="form-error" color="#90080F" fontWeight={500}>
                  Please enter a valid password.
                </FormErrorMessage>
              </FormControl>
            </div>

            {/* Middle Options */}
            <HStack
              width="360px"
              justifyContent="space-between"
              alignItems="center"
              display="flex"
              fontSize={14}
              marginBottom={26}
            >
              <div className="keep-signed-in-container">
                <input
                  type="checkbox"
                  name="keep-signed-in"
                  className="keep-signed-in-checkbox"
                  id="keep-signed-in"
                  onChange={() => setBoxChecked(!boxChecked)}
                />
                <label
                  htmlFor="keep-signed-in"
                  className="keep-signed-in-label"
                >
                  Remember me for 30 days
                </label>
              </div>
            </HStack>

            {(permissionError || credentialsError) && (
              <Box
                bg="#FFF5F5"
                border="1px solid"
                borderColor="red.400"
                color="red.800"
                px={10}
                py={3}
                borderRadius="md"
                w="360px"
                textAlign="left"
                fontFamily="Inter"
                fontSize="14px"
                fontWeight="500"
                lineHeight="normal"
                letterSpacing="0.07px"
              >

                <VStack gap={0} align="start">
                  {credentialsError ? (
                    <>
                      <Text>{credentialsError}</Text>
                    </>
                  ) : (
                    <>
                      <Text>{permissionError}</Text>
                      <Text>Please contact rocio@lapena.org</Text>
                    </>
                  )}
                </VStack>
              </Box>
            )}

            {/* Button Group */}
            <HStack className="button-group">
              <Button
                type="button"
                className="cancel-button"
              >
                <ChakraLink
                  as={Link}
                  to="/signup"
                >
                  Create Account
                </ChakraLink>
              </Button>
              <Button
                type="submit"
                className="submit-button"
                isDisabled={Object.keys(errors).length > 0}
                onClick = {() => {
                  setCredentialsError("");
                  setPermissionError("");
                  setPasswordError("");
                  setEmailError("");
                }}
              >
                Let's Go
              </Button>
            </HStack>
            <div className="forgot-password">
              <ChakraLink
                as={Link}
                to="/forgotpassword"
              >
                Forgot password?
              </ChakraLink>
            </div>
            
          </VStack>
        </form>
      </VStack>
    </Center>
  );
};
