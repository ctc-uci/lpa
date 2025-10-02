import React, { useState } from "react";

import {
    Button,
    Flex,
    Input,
    FormControl,
    FormErrorMessage
} from "@chakra-ui/react";

import { useBackendContext } from "../../contexts/hooks/useBackendContext";

const SendEmailButton = () => {
    const { backend } = useBackendContext();
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");

    const validateEmail = (email) => {
        const regex = /\S+@\S+\.\S+/;
        return regex.test(email);
    };

    const sendEmail = async () => {
        if (!validateEmail(email)) {
            setError("Please enter a valid email address.");
            return;
        }

        const response = await backend.post("/email/send", {
            to: email,
            subject: "Invoice",
            text: "This is a test email.",
            html: "<h1>This is a test email.</h1>"
        });

        // console.log(response.data);
    };

    return (
        <FormControl isInvalid={!!error}>
            <Flex direction="row" gap="1rem" width="100%">
                <Input
                    type="email"
                    size="lg"
                    placeholder="Enter invoice recipient email..."
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        setError("");
                    }}
                >
                </Input>
                <Button size="lg" onClick={sendEmail}>
                    Send Email
                </Button>
            </Flex>
            <FormErrorMessage>{error}</FormErrorMessage>
        </FormControl>
    );
}

export { SendEmailButton };