import {
  Box,
  Button,
  Divider,
  Heading,
  VStack,
  Text,
} from "@chakra-ui/react";

import logo from "../../assets/logo/logo.png";
import { Link } from "react-router-dom";

export const SignupRequested = () => {
    return (
      <VStack 
        spacing={4}
        mt={"44"}
      >
        <Box as="img" src={logo} height="150px" width="280px" />
        <Heading fontSize="40px" color={"#4E4AE7"}>Request Sent!</Heading>
        <Divider h={"2px"} opacity="1" borderColor={"#4E4AE7"} w="25%"/>
        <Text fontColor="#474849">Your account is waiting approval.</Text>
        <Text fontColor="#474849">For questions, please contact La Peña admin at rocio@lapena.org</Text>
        <Button 
            as={Link} 
            to="/login" 
            width={"200px"}
            mt={"20px"}
            borderRadius={"20px"}
            bg={"#4E4AE7"}
            textColor={"white"}
        > 
            Back to Login
        </Button>
      </VStack>
    );
  };