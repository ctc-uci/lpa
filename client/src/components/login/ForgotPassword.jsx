import { useCallback, useEffect } from "react";

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
} from "@chakra-ui/react";



export const ForgotPassword = () => {
  return (
    <VStack
      spacing={8}
      sx={{ width: 300, marginX: "auto" }}
    >
      <Heading marginTop="80px">Reset Password</Heading>
      <p> Email </p>

      <FormControl>
        <Input
        />
      </FormControl>

      <Button>
        Send Reset
      </Button>

    </VStack>

  );
};



