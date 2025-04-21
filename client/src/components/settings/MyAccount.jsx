import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {
    Box,
    Button,
    Flex,
    Grid,
    Input,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    Text,
} from "@chakra-ui/react";
import { useDisclosure } from "@chakra-ui/react";

import Navbar from "../navbar/Navbar";
import { LeftIcon } from "../../assets/LeftIcon"
import { MdIcon } from "../../assets/MdIcon"
import { UserIcon } from "../../assets/UserIcon";
import { AiFillMailIcon } from "../../assets/AiFillMailIcon";
import { AiFillLockIcon } from "../../assets/AiFillLockIcon";

import { useAuthContext } from "../../contexts/hooks/useAuthContext";
import { useBackendContext } from "../../contexts/hooks/useBackendContext";


export const MyAccount = () => {
    const { currentUser, logout } = useAuthContext();
    const { backend } = useBackendContext();
    const navigate = useNavigate();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState(currentUser.email);

    const [isEditing, setIsEditing] = useState(false);
    const [temporaryFirstName, setTemporaryFirstName] = useState(firstName);
    const [temporaryLastName, setTemporaryLastName] = useState(lastName);
    const [temporaryEmail, setTemporaryEmail] = useState(email);
    const [isInvalidTemporaryFirstName, setIsInvalidTemporaryFirstName] = useState(false);
    const [isInvalidTemporaryLastName, setIsInvalidTemporaryLastName] = useState(false);
    const [isInvalidTemporaryEmail, setIsInvalidTemporaryEmail] = useState(false);

    const {
        isOpen: isCancelModalOpen,
        onOpen: onCancelModalOpen,
        onClose: onCancelModalClose
    } = useDisclosure()

    useEffect(() => {
        const getUser = async () => {
            try {
                const userResponse = await backend.get("/users/" + currentUser.uid);
                setFirstName(userResponse.data[0].firstName);
                setTemporaryFirstName(firstName);
                setLastName(userResponse.data[0].lastName);
                setTemporaryLastName(lastName);
            }
            catch (err) {
                console.log(err);
            }
        }
        getUser();
    }, [backend, currentUser, firstName, lastName, email]);


    const handleLogout = async () => {
        try {
            await logout();
            navigate("/");
        }
        catch (err) {
            console.log(err);
        }
    }

    const getInitials = (firstName, lastName) => {
        if (firstName && lastName) {
            return firstName.charAt(0) + lastName.charAt(0);
        }
        else if (firstName) {
            return firstName.charAt(0);
        }
        else if (lastName) {
            return lastName.charAt(0);
        }
        else {
            return "";
        }
    }

    const handleFirstNameEdit = (e) => {
        if (e.target.value === "" || e.target.value.length > 256) {
            setIsInvalidTemporaryFirstName(true);
        }
        else {
            setIsInvalidTemporaryFirstName(false);
        }
        setTemporaryFirstName(e.target.value);
    }

    const handleLastNameEdit = (e) => {
        if (e.target.value === "" || e.target.value.length > 256) {
            setIsInvalidTemporaryLastName(true);
        }
        else {
            setIsInvalidTemporaryLastName(false);
        }
        setTemporaryLastName(e.target.value);
    }

    const handleEmailEdit = (e) => {
        if (e.target.value === "" || e.target.value.length > 256) {
            setIsInvalidTemporaryEmail(true);
        }
        else {
            setIsInvalidTemporaryEmail(false);
        }
        setTemporaryEmail(e.target.value);
    }

    const handleCancel = () => {
        setTemporaryFirstName(firstName);
        setTemporaryLastName(lastName);
        setTemporaryEmail(email);
        setIsInvalidTemporaryFirstName(false);
        setIsInvalidTemporaryLastName(false);
        setIsInvalidTemporaryEmail(false);
        onCancelModalClose();
    }

    return (
        <Navbar>
            <Flex
                direction="column"
                padding="32px"
                gap="32px"
            >
                <Flex
                    alignItems="center"
                >
                    <LeftIcon></LeftIcon>
                    <Button
                        height="2.5rem"
                        padding="0rem 1rem"
                        marginLeft="auto"
                        onClick={handleLogout}
                    >
                        Log Out
                    </Button>
                </Flex>
                <Flex
                    gap="26px"
                    alignItems="flex-start"
                >
                    <Flex
                        alignItems="center"
                        gap="9px"
                    >
                        <Flex
                            justifyContent="center"
                            alignContent="center"
                            width="85px"
                            height="85px"
                            padding="27px"
                            borderRadius="100px"
                            backgroundColor="#FBF6FF"
                        >
                            <Text
                                textAlign="center"
                                fontFamily="Inter"
                                fontSize="22px"
                                fontWeight="700"
                            >
                                {getInitials(firstName, lastName)}
                            </Text>
                        </Flex>
                        <Flex
                            padding="16px 0px"
                            direction="column"
                        >
                            <Text
                                padding="5px 10px"
                                color="#2D3748"
                                fontFamily="Inter"
                                fontSize="24px"
                                fontWeight="700"
                            >
                                {firstName + " " + lastName}
                            </Text>
                            <Text
                                padding="5px 10px"
                                color="#718096"
                                fontFamily="Inter"
                                fontSize="14px"
                                fontWeight="500"
                            >
                                {email}
                            </Text>
                        </Flex>
                    </Flex>
                    <Flex
                        direction="column"
                        padding="20px 20px 20px 26px"
                        alignItems="flex-start"
                        gap="24px"
                        width="100%"
                        borderRadius="15px"
                        border="1px solid #E2E8F0"
                    >
                        <Flex
                            alignItems="center"
                            width="100%"
                            gap="12px"
                        >
                            <Text
                                color="#718096"
                                fontFamily="Inter"
                                fontSize="16px"
                                fontWeight="700"
                            >
                                My Account
                            </Text>
                            {
                                isEditing ? (
                                    <>
                                        <Button
                                            display="flex"
                                            padding="0px 16px"
                                            justifyContent="center"
                                            alignItems="center"
                                            gap="4px"
                                            marginLeft="auto"
                                            borderRadius="6px"
                                            backgroundColor="#EDF2F7"
                                        >
                                            <Text
                                                fontFamily="Inter"
                                                fontSize="14px"
                                                fontWeight="500"
                                                color="#2D3748"
                                                onClick={() => {onCancelModalOpen()}}
                                            >
                                                Cancel
                                            </Text>
                                            <ConfirmationModal
                                                isOpen={isCancelModalOpen}
                                                onClose={onCancelModalClose}
                                                title="Discard Changes?"
                                                body="Your edits to account information will not be saved."
                                                onConfirm={handleCancel}
                                                primaryButtonBackgroundColor="#90080F"
                                            >

                                            </ConfirmationModal>
                                        </Button>
                                        <Button
                                            display="flex"
                                            padding="0px 16px"
                                            justifyContent="center"
                                            alignItems="center"
                                            gap="4px"
                                            borderRadius="6px"
                                            backgroundColor="#4441C8"
                                        >
                                            <Text
                                                color="#FFF"
                                                fontFamily="Inter"
                                                fontSize="14px"
                                                fontWeight="500"
                                            >
                                                Save
                                            </Text>
                                        </Button>
                                    </>
                                ) : (
                                    <Button
                                        height="31px"
                                        padding="8px 12px"
                                        display="flex"
                                        justifyContent="center"
                                        alignItems="center"
                                        gap="4px"
                                        borderRadius="5.368px"
                                        background="#4441C8"
                                        marginLeft="auto"
                                        onClick={() => setIsEditing(true)}
                                    >
                                        <MdIcon></MdIcon>
                                        <Text
                                            color="#FFF"
                                            fontFamily="Inter"
                                            fontSize="12px"
                                            fontWeight="500"
                                        >
                                            Edit
                                        </Text>
                                    </Button>
                                )
                            }
                        </Flex>
                        <Flex
                            direction="column"
                            alignItems="flex-start"
                            gap="26px"
                            width="100%"
                        >
                            <Grid
                                templateColumns={isEditing ? "10rem 1fr auto 1fr" : "10rem 7.5rem 7.5rem"}
                                alignItems="center"
                                width="100%"
                                rowGap={isEditing ? "0.75rem" : 0}
                            >
                                <Box></Box>
                                <Text
                                    color="#4A5568"
                                    fontFamily="Inter"
                                    fontSize="12px"
                                    fontWeight="500"
                                >
                                    First
                                </Text>
                                {isEditing ? <Box width="1rem" /> : null}
                                <Text
                                    color="#4A5568"
                                    fontFamily="Inter"
                                    fontSize="12px"
                                    fontWeight="500"
                                >
                                    Last
                                </Text>

                                <Flex align="center">
                                    <UserIcon size={20}></UserIcon>
                                    <Text
                                        color="#718096"
                                        fontFamily="Inter"
                                        fontSize="14px"
                                        fontWeight="700"
                                        marginLeft="1rem"
                                    >
                                        Name
                                    </Text>
                                </Flex>
                                {
                                    isEditing ? (
                                        <Input
                                            value={temporaryFirstName}
                                            onChange={handleFirstNameEdit}
                                            placeholder="First Name"
                                            isInvalid={isInvalidTemporaryFirstName}
                                        />
                                    ) : (
                                        <Text
                                            color="#2D3748"
                                            fontFamily="Inter"
                                            fontSize="16px"
                                            fontWeight="400"
                                            padding="12px 0px"
                                        >
                                            {firstName}
                                        </Text>
                                    )
                                }
                                {isEditing ? <Box width="1rem" /> : null}
                                {
                                    isEditing ? (
                                        <Input
                                            value={temporaryLastName}
                                            onChange={handleLastNameEdit}
                                            placeholder="Last Name"
                                            isInvalid={isInvalidTemporaryLastName}
                                        />
                                    ) : (
                                        <Text
                                            color="#2D3748"
                                            fontFamily="Inter"
                                            fontSize="16px"
                                            fontWeight="400"
                                            padding="12px 0px"
                                        >
                                            {lastName}
                                        </Text>
                                    )
                                }
                            </Grid>
                            <Flex
                                width="100%"
                            >
                                <Flex
                                    alignItems="center"
                                    width="10rem"
                                    flexShrink="0"
                                >
                                    <AiFillMailIcon></AiFillMailIcon>
                                    <Text
                                        color="#718096"
                                        fontFamily="Inter"
                                        fontSize="14px"
                                        fontWeight="700"
                                        marginLeft="1rem"
                                    >
                                        Email
                                    </Text>
                                </Flex>
                                {
                                    isEditing ? (
                                        <Input
                                            value={temporaryEmail}
                                            onChange={handleEmailEdit}
                                            placeholder="Email"
                                            isInvalid={isInvalidTemporaryEmail}
                                            width="100%"
                                        >
                                        </Input>
                                    ) : (
                                        <Text
                                            color="#2D3748"
                                            fontFamily="Inter"
                                            fontSize="16px"
                                            fontWeight="400"
                                        >
                                            {email}
                                        </Text>
                                    )
                                }
                            </Flex>
                            <Flex>
                                <Flex
                                    alignItems="center"
                                    width="10rem"
                                >
                                    <AiFillLockIcon></AiFillLockIcon>
                                    <Text
                                        color="#718096"
                                        fontFamily="Inter"
                                        fontSize="14px"
                                        fontWeight="700"
                                        marginLeft="1rem"
                                    >
                                        Password
                                    </Text>
                                </Flex>
                                <Text>
                                    ••••••••••••
                                </Text>
                            </Flex>
                        </Flex>
                    </Flex>
                </Flex>
            </Flex>
        </Navbar>
    )
}

const ConfirmationModal = (
    { isOpen, onClose, title, body, primaryButtonBackgroundColor, onConfirm}
) => {
    <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay></ModalOverlay>
        <ModalContent>
            <ModalHeader>
                {title}
            </ModalHeader>
            <ModalBody>
                <Text>
                    {body}
                </Text>
            </ModalBody>
            <ModalFooter>
                <Button onClick={onClose}>
                    Cancel
                </Button>
                <Button
                    marginLeft="0.5rem"
                    backgroundColor={primaryButtonBackgroundColor}
                    onClick={onConfirm}
                >
                    <Text color="white">
                        Confirm
                    </Text>
                </Button>
            </ModalFooter>
        </ModalContent>
    </Modal>
}