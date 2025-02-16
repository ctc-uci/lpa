import {
    Box,
    Button,
    Divider,
    FormControl,
    FormErrorMessage,
    Heading,
    HStack,
    Input,
    InputGroup,
    InputLeftElement,
    InputRightElement,
    VStack,
    Text,
  } from "@chakra-ui/react";
  
import logo from "../../assets/logo/logo.png";
import programSvg from "../../assets/icons/program.svg";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const setNewPasswordSchema = z.object({
    password: z.string().min(6, "Password must be at least 6 characters long"),
    confirmPassword: z.string().min(6, "Confirm Password must be at least 6 characters long"),
})
    .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

export const SetNewPassword = () => {
    const {
      register,
      handleSubmit,
      formState: { errors },
    } = useForm({
      resolver: zodResolver(setNewPasswordSchema),
      mode: "onBlur", 
    });

    const onSubmit = (data) => {
        // Functionality will be added later
        console.log("New password set:", data);
    };
  
    return (
        <VStack 
            spacing={5}
            sx={{ width: 550, marginX: "auto", mt:"44"}}
        >
            <Box as="img" src={logo} height="150px" width="280px" />
            <Heading fontSize="40px" color={"#4E4AE7"}>Set New Password</Heading>
            <Divider h={"2px"}opacity="1" borderColor={"#4E4AE7"}/>
            <Text fontSize="20px" fontColor="#474849">Enter a new password for your account</Text>

            <form onSubmit={handleSubmit(onSubmit)} style={{ width: "100%" }}>

                <FormControl isInvalid={!!errors.password}>
                    <label htmlFor="password"></label>
                    <InputGroup mt="20px">
                        <InputLeftElement 
                            pointerEvents="none"
                            display="flex"
                            alignItems="center"
                            h="100%"
                        >
                            <Box as="img" src={programSvg} boxSize="20px" />
                        </InputLeftElement>
                        <Input
                            placeholder="New Password"
                            type="password"
                            size={"lg"}
                            {...register("password")}
                            name="password"
                            isRequired
                            autoComplete="password"
                            borderRadius="10px"
                        />
                        <InputRightElement 
                            pointerEvents="none"
                            display="flex"
                            alignItems="center"
                            h="100%"
                        >
                            <Box as="img" src={programSvg} boxSize="20px" />
                        </InputRightElement>
                    </InputGroup>
                    <FormErrorMessage minH={"20px"}>
                    {errors.password?.message?.toString()}
                    </FormErrorMessage>
                </FormControl>
                <FormControl isInvalid={!!errors.confirmPassword}>
                <label htmlFor="confirmPassword"></label>
                <InputGroup mt="20px">
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
                        type="password"
                        size={"lg"}
                        {...register("confirmPassword")}
                        name="confirmPassword"
                        isRequired
                        autoComplete="password"
                        borderRadius="10px"
                    />
                    <InputRightElement 
                    pointerEvents="none"
                    display="flex"
                    alignItems="center"
                    h="100%"
                    >
                    <Box as="img" src={programSvg} boxSize="20px" />
                    </InputRightElement>
                </InputGroup>
                <FormErrorMessage minH={"20px"}>
                    {errors.confirmPassword?.message}
                </FormErrorMessage>
                </FormControl>

                <HStack
                    display="flex"
                    alignItems={"center"}
                    justifyContent={"center"}
                    mt="30px"
                    gap="10px"
                >
                    <Button 
                        as={Link} 
                        to="/login" 
                        size={"lg"}
                        sx={{ width: "40%" }}
                        borderRadius={"25px"}
                    > 
                        Back to Login
                    </Button>

                    <Button
                        as={Link} 
                        to="/passwordset" 
                        size={"lg"}
                        sx={{ width: "40%" }}
                        borderRadius={"25px"}
                        bg={"#4E4AE7"}
                        textColor={"white"}
                        isDisabled={Object.keys(errors).length > 0}
                    >
                        Enter
                    </Button>
                </HStack>
            </form>
        </VStack>
    );
};