import {
    Box,
    Button,
    Divider,
    Heading,
    VStack,
  } from "@chakra-ui/react";
  
import logo from "../../assets/logo/logo.png";
import { Link } from "react-router-dom";

export const PasswordSet = () => {
    return (
        <VStack 
            spacing={5}
            sx={{ width: 550, marginX: "auto", mt:"44"}}
        >
            <Box as="img" src={logo} height="150px" width="280px" />
            <Heading fontSize="40px" fontFamily="'Inter', sans-serif" color={"#4E4AE7"}>Password is Set!</Heading>
            <Divider h={"2px"}opacity="1" borderColor={"#4E4AE7"}/>
            <Button 
                as={Link} 
                to="/login" 
                size={"lg"}
                mt={"30px"}
                sx={{ width: "50%" }}
                fontFamily="'Inter', sans-serif"
                borderRadius={"25px"}
                bg={"#4E4AE7"}
                textColor={"white"}
            > 
                Back to Login
            </Button>
        </VStack>
    );
};