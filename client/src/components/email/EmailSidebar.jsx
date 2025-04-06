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
import { EnvelopeIcon } from "../../assets/EnvelopeIcon.jsx";
import { PlusFilledIcon } from "../../assets/PlusFilledIcon.jsx";
import logo from "../../assets/logo/logo.png";
import { DiscardEmailModal } from "./DiscardEmailModal";
import { ConfirmEmailModal } from "./ConfirmEmailModal";
import { useBackendContext } from "../../contexts/hooks/useBackendContext";
import { useParams } from "react-router-dom";
import { SendEmailButton } from "./SendEmailButton";

export const EmailSidebar = ({ isOpen, onOpen, onClose, payees }) => {
  const { backend } = useBackendContext();
  const { id } = useParams();

  const [title, setTitle] = useState("Immigrant Rights Solidarity Week Invoice"); // Change to empty once Title is editable
  const [toInput, setToInput] = useState("");
  const [ccInput, setCcInput] = useState("");
  const [bccInput, setBccInput] = useState("");
  const [changesPresent, setChangesPresent] = useState(false);
  const [emails, setEmails] = useState([]);
  const [ccEmails, setCcEmails] = useState([]);
  const [bccEmails, setBccEmails] = useState([]);

  const [isDiscardModalOpen, setisDiscardModalOpen] = useState(false);
  const [isConfirmModalOpen, setisConfirmModalOpen] = useState(false);
  const [isDrawerOpen, setisDrawerOpen] = useState(false);

  const [names, setNames] = useState(payees?.map(p => p.name))
  
  const btnRef = useRef();

  useEffect(() => {
    if (emails.length > 0 || ccEmails.length > 0 || bccEmails.length > 0) {
      setChangesPresent(true);
    } else {
      setChangesPresent(false);
    }
  }, [emails, ccEmails, bccEmails]);

  useEffect(() => {
    console.log(names)
  }, [names])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const payeesResponse = await backend.get("/invoices/payees/" + id);
        const payeeEmails = payeesResponse.data.map((payee) => payee.email);
        
        setEmails((prevEmails) => {
          const newEmails = [...prevEmails];
          payeeEmails.forEach((email) => {
            if (!newEmails.includes(email)) {
              newEmails.push(email);
            }
          });
          return newEmails;
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
  
    fetchData();
  }, []);

  const emptyInputs = () => {
    setTitle("Immigrant Rights Solidarity Week Invoice"); // Default title for now, change once Title is editable
    setToInput("");
    setBccInput("");
    setCcInput("");
    setEmails([]);
    setCcEmails([]);
    setBccEmails([]);
    setChangesPresent(false);
  }

  const handleAddEmail = () => {
    if (validateEmail(toInput) && !emails.includes(toInput)) {
      setEmails((prev) => [...prev, toInput]);
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

  

  const getPayeeNames = (payees) => {
    if (!Array.isArray(payees) || payees.length === 0) return "";
  
    const names = payees.map(p => p.name);
    if (names.length === 1) return names[0];
    if (names.length === 2) return `${names[0]} and ${names[1]}`;
    return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
  };
  
  const message = `Dear ${getPayeeNames(payees)},

    This is a friendly reminder regarding your upcoming payment. Please ensure that all the necessary details have been updated in our records for timely processing. If there are any changes or concerns regarding the payment, please don't hesitate to reach out to us.

    Thank you for your cooperation. We truly appreciate your partnership. Should you have any questions or require further assistance, feel free to contact us.

    Best Regards,

    Rocío Cancel
    Programs Coordinator
    La Peña Cultural Center
    3105 Shattuck Ave., Berkeley, CA 94705
    lapena.org`;

    
    const sendEmail = async () => {
        try {
          const response = await backend.post("/email/send", {
            to: emails, 
            subject: title, 
            text: message,
            html: `<p>${message.replace(/\n/g, '<br />')}</p>`,
            cc: ccEmails,
            bcc: bccEmails
          });
    
        } catch (error) {
          console.error("Error sending email:", error);
        }
    };


  return (
    <>
      <DiscardEmailModal
        isOpen={isDiscardModalOpen}
        onClose={() => setisDiscardModalOpen(false)}
        emptyInputs={emptyInputs}
        setisDrawerOpen={setisDrawerOpen}
      />

      <ConfirmEmailModal 
        isOpen={isConfirmModalOpen}
        onClose= {() => {
          setisConfirmModalOpen(false);
          setisDrawerOpen(false);
          emptyInputs();
        }}
        closeDrawer={onClose}
        title={title}
        emails={emails}
        ccEmails={ccEmails}
        bccEmails={bccEmails}
      />
      <Button
        ref={btnRef}
        onClick={() => setisDrawerOpen(true)}
        leftIcon={<EnvelopeIcon />}
        backgroundColor="#4441C8"
        color="white"
        borderRadius={10}
      >
        Email
      </Button>
      
      <Drawer
        isOpen={isDrawerOpen}
        placement="right"
        onClose={() => {
          if (changesPresent) {
            setisDiscardModalOpen(true); 
          } else {
            setisDrawerOpen(false); 
          }
        }}
        finalFocusRef={btnRef}
        size="sm"
      >
        <DrawerOverlay />
        <DrawerContent>
          {/* CANT MOVE CLOSE BUTTON TO LEFT SIDE */}
          <DrawerCloseButton 
            onClick={() => {
              if (changesPresent) {
                setisDiscardModalOpen(true);
              } else {
                setisDrawerOpen(false);
              }
            }}
            position={"initial"}
            ml={"11px"}
            mt={"15px"}
          />
          <DrawerHeader
            ml="4"
            mt="5"
            fontSize="md"
          >
            <Text fontSize={"18px"} color={"black"}>{title}</Text>
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
                      sx={{
                        svg: {
                          width: "16px",
                          height: "16px",
                        }
                      }}
                      _hover={{
                        bgColor: "transparent",
                        svg: {
                          rect: { fill: "#4441C8" },
                        },
                      }}
                      _active={{ bgColor: "transparent" }}
                      _focus={{ boxShadow: "none" }}
                      icon={<PlusFilledIcon/>}
                      onClick={handleAddEmail}
                    />
                  </InputRightElement>
                </InputGroup>
              </Flex>
              <Flex gap="4" justifyContent="start" wrap="wrap">
                {[...emails].map((email, index) => (
                  <Tag 
                    key={index} 
                    size="lg" 
                    borderRadius="full" 
                    variant="solid" 
                    bg={"white"} 
                    border={"1px solid"} 
                    borderColor={"#E2E8F0"} 
                    textColor={"#080A0E"}
                    fontWeight={"normal"}
                  >
                    <TagLabel>{email}</TagLabel>
                    <TagCloseButton
                      onClick={() =>
                        setEmails((prevEmails) => prevEmails.filter((e) => e !== email))
                      }
                      bgColor={"#718096"}
                      opacity={"none"}
                      _hover={{
                        bg: "#4441C8"
                      }}
                      textColor={"white"}
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
                  Cc:
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
                      sx={{
                        svg: {
                          width: "16px",
                          height: "16px",
                        }
                      }}
                      _hover={{
                        bgColor: "transparent",
                        svg: {
                          rect: { fill: "#4441C8" },
                        },
                      }}
                      _active={{ bgColor: "transparent" }}
                      _focus={{ boxShadow: "none" }}
                      onClick={handleAddCcEmail}
                      icon={<PlusFilledIcon/>}
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
                    bg={"white"} 
                    border={"1px solid"} 
                    borderColor={"#E2E8F0"} 
                    textColor={"#080A0E"}
                    fontWeight={"normal"}
                  >
                    <TagLabel>{email}</TagLabel>
                    <TagCloseButton
                      onClick={() =>
                        setCcEmails(ccEmails.filter((e) => e !== email))
                      }
                      bgColor={"#718096"}
                      opacity={"none"}
                      _hover={{
                        bg: "#4441C8"
                      }}
                      textColor={"white"}
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
                  Bcc:
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
                      sx={{
                        svg: {
                          width: "16px",
                          height: "16px",
                        }
                      }}
                      _hover={{
                        bgColor: "transparent",
                        svg: {
                          rect: { fill: "#4441C8" },
                        },
                      }}
                      _active={{ bgColor: "transparent" }}
                      _focus={{ boxShadow: "none" }}
                      onClick={handleAddBccEmail}
                      icon={<PlusFilledIcon/>}
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
                    bg={"white"} 
                    border={"1px solid"} 
                    borderColor={"#E2E8F0"} 
                    textColor={"#080A0E"}
                    fontWeight={"normal"}
                  >
                    <TagLabel>{email}</TagLabel>
                    <TagCloseButton
                      onClick={() =>
                        setBccEmails(bccEmails.filter((e) => e !== email))
                      }
                      bgColor={"#718096"}
                      opacity={"none"}
                      _hover={{
                        bg: "#4441C8"
                      }}
                      textColor={"white"}
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
              mt="30px"
            >
              <IconButton
                icon={
                  <Image
                    src={IoPaperPlane}
                    w="19px"
                  />
                }
                bgColor="#4441C8"
                onClick={() => {
                  sendEmail();
                  setisConfirmModalOpen(true);
                }}
                isDisabled={!changesPresent}
                width={"45px"}
                height={"30px"}
                borderRadius={"10px"}
              ></IconButton>
            </Flex>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};
