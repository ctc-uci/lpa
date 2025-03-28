import { useRef, useState, useEffect } from "react";

import {
  Box,
  Button,
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  HStack,
  IconButton,
  Image,
  Input,
  InputGroup,
  InputRightElement,
  SimpleGrid,
  Stack,
  Tag,
  TagCloseButton,
  TagLabel,
  Text,
  VStack,
} from "@chakra-ui/react";

import IoPaperPlane from "../../assets/IoPaperPlane.svg";
import logo from "../../assets/logo/logo.png";
import { DiscardEmailModal } from "./DiscardEmailModal";
import { ConfirmEmailModal } from "./ConfirmEmailModal";
import { useBackendContext } from "../../contexts/hooks/useBackendContext";
import { useParams } from "react-router-dom";
import { SendEmailButton } from "./SendEmailButton";

export const EmailSidebar = ({ isOpen, onOpen, onClose }) => {
  const { backend } = useBackendContext();
  const { id } = useParams();

  const [toInput, setToInput] = useState("");
  const [ccInput, setCcInput] = useState("");
  const [bccInput, setBccInput] = useState("");
  const [changesPresent, setChangesPresent] = useState(false);
  const [emails, setEmails] = useState(new Set());
  const [ccEmails, setCcEmails] = useState([]);
  const [bccEmails, setBccEmails] = useState([]);

  const [isDiscardModalOpen, setisDiscardModalOpen] = useState(false);
  
  const btnRef = useRef();

  useEffect(() => {
    if (toInput || ccInput || bccInput) {
      setChangesPresent(true);
    }
  }, [toInput, ccInput, bccInput]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const payeesResponse = await backend.get("/invoices/payees/" + id);
        const payeeEmails = payeesResponse.data.map((payee) => payee.email);
        
        setEmails((prevEmails) => {
          const updatedEmails = new Set(prevEmails);
          payeeEmails.forEach(email => updatedEmails.add(email));
          return updatedEmails;
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
  
    fetchData();
  }, []);

  const emptyInputs = () => {
    setToInput("");
    setBccInput("");
    setCcInput("");
    setEmails(new Set());
    setCcEmails([]);
    setBccEmails([]);
    setChangesPresent(false);
  }

  const handleAddEmail = () => {
    if (validateEmail(toInput) && !emails.has(toInput)) {
      setEmails(new Set(emails.add(toInput)));
      setToInput(""); // Clear the input after adding
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleAddEmail();
    }
  };

  const handleAddCcEmail = () => {
    if (validateEmail(ccInput)&& !ccEmails.includes(ccInput)) {
      setCcEmails((prev) => [...prev, ccInput]);
      setCcInput("");
    }
  };

  const handleAddBccEmail = () => {
    if (validateEmail(bccInput) && !bccEmails.includes(bccInput)) {
      setBccEmails((prev) => [...prev, bccInput]);
      setBccInput("");
    }
  };

  const handleKeyPressCc = (e) => {
    if (e.key === "Enter") {
      handleAddCcEmail();
    }
  };

  const handleKeyPressBcc = (e) => {
    if (e.key === "Enter") {
      handleAddBccEmail();
    }
  };

  const validateEmail = (email) => {
    const regex = /\S+@\S+\.\S+/;
    return regex.test(email);
  };

  const message = `Dear John Doe,

    This is a friendly reminder regarding your upcoming payment. Please ensure that all the necessary details have been updated in our records for timely processing. If there are any changes or concerns regarding the payment, please don't hesitate to reach out to us.

    Thank you for your cooperation. We truly appreciate your partnership. Should you have any questions or require further assistance, feel free to contact us.

    Best Regards,

    Rocío Cancel
    Programs Coordinator
    La Peña Cultural Center
    3105 Shattuck Ave., Berkeley, CA 94705
    lapena.org`;

    
    const sendEmail = async () => {
      for (const email of emails) {
        try {
          const response = await backend.post("/email/send", {
            to: "brendanlieu05@gmail.com",
            subject: "Invoice",
            text: message,
            html: `<p>${message.replace(/\n/g, '<br />')}</p>`
          });
    
          console.log(response.data);
        } catch (error) {
          console.error("Error sending email:", error);
        }
      }
    };


  return (
    <>
      <DiscardEmailModal
        isOpen={isDiscardModalOpen}
        onClose={() => setisDiscardModalOpen(false)}
        emptyInputs={emptyInputs}
      />
      <Button
        ref={btnRef}
        onClick={onOpen}
        leftIcon={
          //TODO FIX IMPORT LATER
          <svg
            width="20"
            height="20"
            viewBox="0 0 12 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10.875 0.875H1.125C0.917578 0.875 0.75 1.04258 0.75 1.25V8.75C0.75 8.95742 0.917578 9.125 1.125 9.125H10.875C11.0824 9.125 11.25 8.95742 11.25 8.75V1.25C11.25 1.04258 11.0824 0.875 10.875 0.875ZM9.92813 2.15117L6.23086 5.02813C6.13945 5.09961 6.01172 5.09961 5.92031 5.02813L2.22188 2.15117C2.20793 2.14041 2.19771 2.12556 2.19263 2.1087C2.18755 2.09183 2.18788 2.0738 2.19357 2.05714C2.19925 2.04047 2.21001 2.026 2.22433 2.01575C2.23866 2.00551 2.25583 2 2.27344 2H9.87656C9.89417 2 9.91134 2.00551 9.92567 2.01575C9.93999 2.026 9.95075 2.04047 9.95643 2.05714C9.96212 2.0738 9.96245 2.09183 9.95737 2.1087C9.95229 2.12556 9.94207 2.14041 9.92813 2.15117Z"
              fill="white"
            />
          </svg>
        }
        backgroundColor="#4441C8"
        color="white"
        borderRadius={10}
      >
        Email
      </Button>
      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={onClose}
        finalFocusRef={btnRef}
        size="sm"
      >
        <DrawerOverlay />
        <DrawerContent>
          {/* CANT MOVE CLOSE BUTTON TO LEFT SIDE */}
          <DrawerCloseButton 
            onClick={() => {
              console.log(changesPresent);
              if (changesPresent) {
                setisDiscardModalOpen(true);
              } else {
                return false;
              }
            }}
          />
          <DrawerHeader
            ml="4"
            mt="12"
            fontSize="md"
          >
            <Text>Immigrant Rights Solidarity Week Invoice</Text>
          </DrawerHeader>
          <DrawerBody ml="4">
            <Stack
              w="300px"
              mb="20px"
            >
              <Flex
                justifyContent="space-between"
                alignItems="center"
              >
                <Text
                  color="#474849"
                  fontSize="14px"
                >
                  To:
                </Text>
                <InputGroup w="200px">
                  <Input
                    placeholder="johndoe@gmail.com"
                    onChange={(e) => setToInput(e.target.value)}
                    value={toInput}
                    onKeyDown={handleKeyDown}
                  />
                  <InputRightElement>
                    <IconButton
                      bgColor="transparent"
                      _hover={{
                        bgColor: "transparent",
                        svg: {
                          rect: { fill: "#4441C8" },
                        },
                      }}
                      _active={{ bgColor: "transparent" }}
                      _focus={{ boxShadow: "none" }}
                      icon={
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 20 20"
                          fill="none"
                        >
                          <rect
                            width="20"
                            height="20"
                            rx="10"
                            fill="#718096"
                          />
                          <path
                            d="M9.16675 10.8333H5.00008C4.76397 10.8333 4.5662 10.7533 4.40675 10.5933C4.24731 10.4333 4.16731 10.2355 4.16675 9.99996C4.1662 9.76441 4.2462 9.56663 4.40675 9.40663C4.56731 9.24663 4.76508 9.16663 5.00008 9.16663H9.16675V4.99996C9.16675 4.76385 9.24675 4.56607 9.40675 4.40663C9.56675 4.24718 9.76453 4.16718 10.0001 4.16663C10.2356 4.16607 10.4337 4.24607 10.5943 4.40663C10.7548 4.56718 10.8345 4.76496 10.8334 4.99996V9.16663H15.0001C15.2362 9.16663 15.4343 9.24663 15.5943 9.40663C15.7543 9.56663 15.834 9.76441 15.8334 9.99996C15.8329 10.2355 15.7529 10.4336 15.5934 10.5941C15.434 10.7547 15.2362 10.8344 15.0001 10.8333H10.8334V15C10.8334 15.2361 10.7534 15.4341 10.5934 15.5941C10.4334 15.7541 10.2356 15.8339 10.0001 15.8333C9.76453 15.8327 9.56675 15.7527 9.40675 15.5933C9.24675 15.4339 9.16675 15.2361 9.16675 15V10.8333Z"
                            fill="white"
                          />
                        </svg>
                      }
                      onClick={handleAddEmail}
                    />
                  </InputRightElement>
                </InputGroup>
              </Flex>
              <Flex gap="4" justifyContent="start" wrap="wrap">
                {[...emails].map((email, index) => (
                  <Tag key={index} size="lg" borderRadius="full" variant="solid">
                    <TagLabel>{email}</TagLabel>
                    <TagCloseButton
                      onClick={() =>
                        setEmails((prevEmails) => {
                          const updatedEmails = new Set(prevEmails);
                          updatedEmails.delete(email);
                          return updatedEmails;
                        })
                      }
                    />
                  </Tag>
                ))}
              </Flex>

              <Flex
                justifyContent="space-between"
                alignItems="center"
              >
                <Text
                  color="#474849"
                  fontSize="14px"
                >
                  CC:
                </Text>
                <InputGroup w="200px">
                  <Input
                    placeholder="johndoe@gmail.com"
                    value={ccInput}
                    onChange={(e) => setCcInput(e.target.value)}
                    onKeyDown={handleKeyPressCc}
                  />
                  <InputRightElement>
                    <IconButton
                      bgColor="transparent"
                      _hover={{
                        bgColor: "transparent",
                        svg: {
                          rect: { fill: "#4441C8" },
                        },
                      }}
                      _active={{ bgColor: "transparent" }}
                      _focus={{ boxShadow: "none" }}
                      onClick={handleAddCcEmail}
                      icon={
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 20 20"
                          fill="none"
                        >
                          <rect
                            width="20"
                            height="20"
                            rx="10"
                            fill="#718096"
                          />
                          <path
                            d="M9.16675 10.8333H5.00008C4.76397 10.8333 4.5662 10.7533 4.40675 10.5933C4.24731 10.4333 4.16731 10.2355 4.16675 9.99996C4.1662 9.76441 4.2462 9.56663 4.40675 9.40663C4.56731 9.24663 4.76508 9.16663 5.00008 9.16663H9.16675V4.99996C9.16675 4.76385 9.24675 4.56607 9.40675 4.40663C9.56675 4.24718 9.76453 4.16718 10.0001 4.16663C10.2356 4.16607 10.4337 4.24607 10.5943 4.40663C10.7548 4.56718 10.8345 4.76496 10.8334 4.99996V9.16663H15.0001C15.2362 9.16663 15.4343 9.24663 15.5943 9.40663C15.7543 9.56663 15.834 9.76441 15.8334 9.99996C15.8329 10.2355 15.7529 10.4336 15.5934 10.5941C15.434 10.7547 15.2362 10.8344 15.0001 10.8333H10.8334V15C10.8334 15.2361 10.7534 15.4341 10.5934 15.5941C10.4334 15.7541 10.2356 15.8339 10.0001 15.8333C9.76453 15.8327 9.56675 15.7527 9.40675 15.5933C9.24675 15.4339 9.16675 15.2361 9.16675 15V10.8333Z"
                            fill="white"
                          />
                        </svg>
                      }
                    />
                  </InputRightElement>
                </InputGroup>
              </Flex>
              <Flex
                gap="4"
                justifyContent="start"
                wrap="wrap"
              >
                {ccEmails.map((email, index) => (
                  <Tag
                    key={index}
                    size="lg"
                    borderRadius="full"
                    variant="solid"
                  >
                    <TagLabel>{email}</TagLabel>
                    <TagCloseButton
                      onClick={() =>
                        setCcEmails(ccEmails.filter((e) => e !== email))
                      }
                    />
                  </Tag>
                ))}
              </Flex>

              <Flex
                justifyContent="space-between"
                alignItems="center"
              >
                <Text
                  color="#474849"
                  fontSize="14px"
                >
                  BCC:
                </Text>
                <InputGroup w="200px">
                  <Input
                    placeholder="johndoe@gmail.com"
                    value={bccInput}
                    onChange={(e) => setBccInput(e.target.value)}
                    onKeyDown={handleKeyPressBcc}
                  />
                  <InputRightElement>
                    <IconButton
                      bgColor="transparent"
                      _hover={{
                        bgColor: "transparent",
                        svg: {
                          rect: { fill: "#4441C8" },
                        },
                      }}
                      _active={{ bgColor: "transparent" }}
                      _focus={{ boxShadow: "none" }}
                      onClick={handleAddBccEmail}
                      icon={
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 20 20"
                          fill="none"
                        >
                          <rect
                            width="20"
                            height="20"
                            rx="10"
                            fill="#718096"
                          />
                          <path
                            d="M9.16675 10.8333H5.00008C4.76397 10.8333 4.5662 10.7533 4.40675 10.5933C4.24731 10.4333 4.16731 10.2355 4.16675 9.99996C4.1662 9.76441 4.2462 9.56663 4.40675 9.40663C4.56731 9.24663 4.76508 9.16663 5.00008 9.16663H9.16675V4.99996C9.16675 4.76385 9.24675 4.56607 9.40675 4.40663C9.56675 4.24718 9.76453 4.16718 10.0001 4.16663C10.2356 4.16607 10.4337 4.24607 10.5943 4.40663C10.7548 4.56718 10.8345 4.76496 10.8334 4.99996V9.16663H15.0001C15.2362 9.16663 15.4343 9.24663 15.5943 9.40663C15.7543 9.56663 15.834 9.76441 15.8334 9.99996C15.8329 10.2355 15.7529 10.4336 15.5934 10.5941C15.434 10.7547 15.2362 10.8344 15.0001 10.8333H10.8334V15C10.8334 15.2361 10.7534 15.4341 10.5934 15.5941C10.4334 15.7541 10.2356 15.8339 10.0001 15.8333C9.76453 15.8327 9.56675 15.7527 9.40675 15.5933C9.24675 15.4339 9.16675 15.2361 9.16675 15V10.8333Z"
                            fill="white"
                          />
                        </svg>
                      }
                    />
                  </InputRightElement>
                </InputGroup>
              </Flex>
              <Flex
                gap="4"
                justifyContent="start"
                wrap="wrap"
              >
                {bccEmails.map((email, index) => (
                  <Tag
                    key={index}
                    size="lg"
                    borderRadius="full"
                    variant="solid"
                  >
                    <TagLabel>{email}</TagLabel>
                    <TagCloseButton
                      onClick={() =>
                        setBccEmails(bccEmails.filter((e) => e !== email))
                      }
                    />
                  </Tag>
                ))}
              </Flex>
            </Stack>

            <Divider color="#E2E8F0" />

            <Stack mt="10">
              <Text whiteSpace="pre-line">
                {message}
                <Image
                  src={logo}
                  w="100px"
                  mt="4"
                />
              </Text>
            </Stack>

            <Flex
              justifyContent="end"
              mt="40px"
            >
              <IconButton
                icon={
                  <Image
                    src={IoPaperPlane}
                    w="20px"
                  />
                }
                bgColor="#4441C8"
                onClick={sendEmail}
              ></IconButton>
            </Flex>
            

            {/* <DiscardEmailModal /> */}
            <ConfirmEmailModal />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};
