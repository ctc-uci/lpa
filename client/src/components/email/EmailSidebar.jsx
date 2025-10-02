import { useEffect, useRef, useState, useCallback } from "react";

import {
  Button,
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  IconButton,
  Image,
  Input,
  InputGroup,
  InputRightElement,
  Stack,
  Tag,
  TagCloseButton,
  TagLabel,
  Text,
} from "@chakra-ui/react";

import { useParams } from "react-router-dom";

import { EnvelopeIcon } from "../../assets/EnvelopeIcon.jsx";
import IoPaperPlane from "../../assets/IoPaperPlane.svg";
import logo from "../../assets/logo/logo.png";
import { useBackendContext } from "../../contexts/hooks/useBackendContext";
import { EmailDropdown } from "../clientsearch/EmailDropdown.jsx";
import { ConfirmEmailModal } from "./ConfirmEmailModal";
import { DiscardEmailModal } from "./DiscardEmailModal";
import { EmailInput } from "./EmailInput.jsx";
import { sendSaveEmail } from "./utils.jsx";
import { useSessionStore } from "../../stores/useSessionStore";
import { getPastDue } from "../../utils/pastDueCalc";

export const EmailSidebar = ({
  isOpen,
  onOpen,
  onClose,
  pdf_title,
  invoice,
}) => {
  const { backend } = useBackendContext();
  const { id } = useParams();
  const { sessions } = useSessionStore();
  const [title, setTitle] = useState(pdf_title);
  const [toInput, setToInput] = useState("");
  const [ccInput, setCcInput] = useState("");
  const [bccInput, setBccInput] = useState("");
  const [changesPresent, setChangesPresent] = useState(false);
  const [emails, setEmails] = useState([]);
  const [originalEmails, setOriginalEmails] = useState([]);
  const [ccEmails, setCcEmails] = useState([]);
  const [bccEmails, setBccEmails] = useState([]);

  const [instructorSearchTerm, setInstructorSearchTerm] = useState("");
  const [searchedInstructors, setSearchedInstructors] = useState([]);
  const [selectedInstructors, setSelectedInstructors] = useState([]);

  const [ccSearchTerm, setCcSearchTerm] = useState("");
  const [searchedCc, setSearchedCc] = useState([]);
  const [selectedCc, setSelectedCc] = useState([]);

  const [bccSearchTerm, setBccSearchTerm] = useState("");
  const [searchedBcc, setSearchedBcc] = useState([]);
  const [selectedBcc, setSelectedBcc] = useState([]);

  const [isDiscardModalOpen, setisDiscardModalOpen] = useState(false);
  const [isConfirmModalOpen, setisConfirmModalOpen] = useState(false);
  const [isDrawerOpen, setisDrawerOpen] = useState(false);

  const [allUsers, SetAllUsers] = useState(false);

  const [loading, setLoading] = useState(false);

  const btnRef = useRef();

  useEffect(() => {
    if (emails.length > 0 || ccEmails.length > 0 || bccEmails.length > 0) {
      setChangesPresent(true);
    } else {
      setChangesPresent(false);
    }
  }, [emails, ccEmails, bccEmails]);

  useEffect(() => {
    // If the title changes, set changesPresent to true
    if (title !== pdf_title) {
      setChangesPresent(true);
    } else {
      setChangesPresent(false);
    }
  }, [title, pdf_title]);

  useEffect(() => {
    // If the pdf_title changes, update the title
    // This could happen when the parent page finishes loading
    setTitle(pdf_title);
  }, [pdf_title]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const payeesResponse = await backend.get("/invoices/payees/" + id);
        const instructorResponse = await backend.get("/invoices/instructors/" + id);
        const userList = [...payeesResponse.data, ...instructorResponse.data];
        const uniqueUsers = userList.filter(
          (user, index, self) =>
            index === self.findIndex((u) => u.email === user.email)
        );
        SetAllUsers(uniqueUsers);

        const payeeEmails = payeesResponse.data.map((payee) => payee.email);

        const instructorEmails = instructorResponse.data.map(
          (instructor) => (instructor.email && !payeeEmails.includes(instructor.email)) ? instructor.email : null
        );

        setEmails((prevEmails) => {
          const newEmails = [...prevEmails];
          [...payeeEmails].forEach((email) => {
            if (!newEmails.includes(email)) {
              newEmails.push(email);
            }
          });
          return newEmails;
        });

        setSelectedInstructors(payeesResponse.data);

        setCcEmails((prevCcEmails) => {
          const newCcEmails = [...prevCcEmails];
          instructorEmails.forEach((email) => {
            if (!newCcEmails.includes(email)) {
              newCcEmails.push(email);
            }
          });
          return newCcEmails;
        });

        setOriginalEmails([...payeeEmails, ...instructorEmails]);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [id]);

  // const getInstructorResults = async ({ searchTerm, setSearchedResults, selectedUsers }) => {
  //   try {
  //     if (search !== "") {
  //       const instructorResponse = await backend.get("/clients/search", {
  //         params: {
  //           searchTerm: search,
  //         },
  //       });
  //       const payeesResponse = await backend.get("/invoices/payees/" + id);
  //       filterSelectedInstructorsFromSearch(
  //         instructorResponse.data,
  //         payeesResponse.data,
  //         setSearched,
  //         selectedUser
  //       );
  //     } else {
  //       setSearched([]);
  //     }
  //   } catch (error) {
  //     console.error("Error getting instructors:", error);
  //   }
  // };


  const getInstructorResults = async (search, setSearched, selectedUser) => {
    try {
      // Make sure search is a string to avoid TypeErrors
      const searchString = typeof search === "string" ? search : "";

      const instructorResponse = await backend.get("/clients/search", {
        params: {
          searchTerm: searchString,
          columns: ["email"]
        },
      });
      const payeesResponse = await backend.get("/invoices/payees/" + id);

      // Make sure selectedUser is an array
      const safeSelectedUser = Array.isArray(selectedUser)
        ? selectedUser
        : [];

      filterSelectedInstructorsFromSearch(
        instructorResponse.data,
        payeesResponse.data,
        setSearched,
        safeSelectedUser
      );
    } catch (error) {
      console.error("Error getting instructors:", error);
    }
  };

  // const filterSelectedInstructorsFromSearch = (instructorData, payeeData, setSearched, selectedUser) => {
  //   const filteredInstructors = instructorData.filter(
  //     (instructor) =>
  //       !selectedUser || !selectedUser.some((selected) => selected && selected.email === instructor.email)
  //   );
  //   setSearched(filteredInstructors);
  // };

  const filterSelectedInstructorsFromSearch = (
    instructorData,
    payeeData,
    setSearched,
    selectedUser
  ) => {
    // Add null checks and make sure arrays are arrays
    const safeInstructorData = Array.isArray(instructorData)
      ? instructorData
      : [];
    const safeSelectedUser = Array.isArray(selectedUser) ? selectedUser : [];

    const filteredInstructors = safeInstructorData.filter(
      (instructor) =>
        instructor &&
        instructor.email &&
        !safeSelectedUser.some(
          (selected) =>
            selected && selected.email && instructor.email === selected.email
        )
    );

    if (typeof setSearched === "function") {
      setSearched(filteredInstructors);
    }
  };

  // useEffect(() => {
  //   // Extract emails from selected instructors and add them to the emails list
  //   const instructorEmails = selectedInstructors
  //     .filter((instructor) => instructor.email)
  //     .map((instructor) => instructor.email);

  //   if (instructorEmails.length > 0) {
  //     setEmails((prevEmails) => {
  //       const newEmails = [...prevEmails];
  //       instructorEmails.forEach((email) => {
  //         if (!newEmails.includes(email)) {
  //           newEmails.push(email);
  //         }
  //       });
  //       return newEmails;
  //     });
  //   }
  // }, [selectedInstructors]);

  //TO
  // useEffect(() => {
  //   getInstructorResults({
  //     searchTerm: instructorSearchTerm,
  //     setSearchedResults: setSearchedInstructors,
  //     selectedUsers: selectedInstructors
  //   });
  // }, [instructorSearchTerm, selectedInstructors]);

  // //CC
  // useEffect(() => {
  //   getInstructorResults({
  //     searchTerm: ccSearchTerm,
  //     setSearchedResults: setSearchedCc,
  //     selectedUsers: selectedCc
  //   });
  // }, [ccSearchTerm, selectedCc]);

  // //BCC
  // useEffect(() => {
  //   getInstructorResults({
  //     searchTerm: bccSearchTerm,
  //     setSearchedResults: setSearchedBcc,
  //     selectedUsers: selectedBcc
  //   });
  // }, [bccSearchTerm, selectedBcc]);

  useEffect(() => {
    // Only call if instructorSearchTerm is defined
    if (instructorSearchTerm !== undefined) {
      getInstructorResults(
        instructorSearchTerm,
        setSearchedInstructors,
        selectedInstructors
      );
    }
  }, [instructorSearchTerm]);

  useEffect(() => {
    // Only call if ccSearchTerm is defined
    if (ccSearchTerm !== undefined) {
      getInstructorResults(ccSearchTerm, setSearchedCc, selectedCc);
    }
  }, [ccSearchTerm]);

  useEffect(() => {
    // Only call if bccSearchTerm is defined
    if (bccSearchTerm !== undefined) {
      getInstructorResults(bccSearchTerm, setSearchedBcc, selectedBcc);
    }
  }, [bccSearchTerm]);

  const emptyInputs = () => {
    setTitle(pdf_title);
    setToInput("");
    setBccInput("");
    setCcInput("");
    setEmails(originalEmails);
    setCcEmails([]);
    setBccEmails([]);
    setChangesPresent(false);
  };

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
    if (validateEmail(ccInput) && !ccEmails.includes(ccInput)) {
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

  const message = `Hello,

    This is a friendly reminder regarding your upcoming payment. Please ensure that all the necessary details have been updated in our records for timely processing. If there are any changes or concerns regarding the payment, please don't hesitate to reach out to us.

    Thank you for your cooperation. We truly appreciate your partnership. Should you have any questions or require further assistance, feel free to contact us.

    Best Regards,

    Rocío Cancel
    Programs Coordinator
    La Peña Cultural Center
    3105 Shattuck Ave., Berkeley, CA 94705
    lapena.org`;

  const handleSubtotalSum = (startTime, endTime, rate) => {
    if (!startTime || !endTime || !rate) return "0.00"; // Check if any required value is missing

    const timeToMinutes = (timeStr) => {
      const [hours, minutes] = timeStr.split(":").map(Number);
      return hours * 60 + minutes;
    };

    const startMinutes = timeToMinutes(startTime.substring(0, 5));
    const endMinutes = timeToMinutes(endTime.substring(0, 5));
    const diff = endMinutes - startMinutes;

    const totalHours = Math.ceil(diff / 60);

    const total = (totalHours * rate).toFixed(2);

    return total;
  };

  const getGeneratedDate = (sessions = [], includeDay = true) => {
    if (sessions.length === 0) {
      return "No Date Found";
    }
  
    const latestSession = sessions.slice().sort(
      (a, b) => new Date(b.datetime) - new Date(a.datetime)
    )[0];
  
    // Create date and adjust for timezone using the same pattern as EditInvoice.jsx
    const latestDate = new Date(latestSession.datetime);
    latestDate.setMinutes(
      latestDate.getMinutes() + latestDate.getTimezoneOffset()
    );
  
    const month = latestDate.toLocaleString("default", { month: "long" });
    const day = latestDate.getDate();
    const year = latestDate.getFullYear();
  
    return includeDay ? `${month} ${day}, ${year}` : `${month} ${year}`;
  };

  const fetchInvoiceData = async () => {
    const eventId = invoice.data[0].eventId;

    const [
      instructorResponse,
      programNameResponse,
      payeesResponse,
      summaryResponse
    ] = await Promise.all([
      backend.get(`/assignments/instructors/${eventId}`),
      backend.get(`/events/${eventId}`),
      backend.get(`/invoices/payees/${id}`),
      backend.get(`/comments/invoice/summary/${id}`)
    ]);


    const totalCustomRow = summaryResponse.data[0]?.total?.reduce((acc, total) => {
      return acc + Number(total.value);
    }, 0);


    const remainingBalance = await getPastDue(backend, id);

    return {
      instructors: instructorResponse.data,
      programName: programNameResponse.data[0].name,
      payees: payeesResponse.data,
      remainingBalance: remainingBalance,
      summary: summaryResponse.data[0],
      totalCustomRow: totalCustomRow,
    }

  };

  const handleEmailClick = async () => {
    const invoiceData = await fetchInvoiceData();

    await sendSaveEmail(
      setLoading,
      setisConfirmModalOpen,
      invoice,
      invoiceData,
      sessions,
      selectedInstructors.map((user) => user.email),
      title,
      message,
      selectedCc.map((user) => user.email),
      selectedBcc.map((user) => user.email),
      backend,
      id,
      pdf_title
    );
  };

  const HandleEmailSearch = (email) => {
    backend
      .get(`/users/email/${email}`)
      .catch((err) => {
        console.error("User not found");
      });
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
        onClose={() => {
          setisConfirmModalOpen(false);
          setisDrawerOpen(false);
          emptyInputs();
        }}
        closeDrawer={onClose}
        title={title}
        emails={selectedInstructors.map((user) => user.email)}
        ccEmails={ccEmails.filter((user) => user).map((user) => user?.email)}
        bccEmails={bccEmails.filter((user) => user).map((user) => user?.email)}
      />
      <Button
        ref={btnRef}
        onClick={() => setisDrawerOpen(true)}
        leftIcon={<EnvelopeIcon />}
        backgroundColor="#4441C8"
        _hover={{backgroundColor: "#312E8A"}}
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
            <Input
              placeholder="Subject"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
              }}
              borderColor="#E2E8F0"
              _focus={{ borderColor: "#4441C8" }}
              _placeholder={{ color: "#A0AEC0" }}
              borderRadius="8px"
              fontSize="18px"
              fontWeight="bold"
              color="#474849"
              backgroundColor="white"
            />
          </DrawerHeader>
          <DrawerBody ml="4">
            <Stack
              w="100%"
              mb="20px"
            >
              {/* // Here are the fixed EmailDropdown calls for the EmailSidebar
              component // For the "To:" section */}
              <Flex
                justifyContent="space-between"
                alignItems="center"
                gap="4"
              >
                <Text
                  color="#474849"
                  fontSize="14px"
                >
                  To:
                </Text>
                <EmailDropdown
                  searchTerm={instructorSearchTerm}
                  searchedUser={searchedInstructors}
                  selectedUsers={selectedInstructors}
                  setSelectedUsers={setSelectedInstructors}
                  setSearchedUsers={setSearchedInstructors}
                  getUserResults={getInstructorResults}
                  setSearchTerm={setInstructorSearchTerm}
                />
              </Flex>
              {/* Display selected To: emails */}
              <Flex
                gap="4"
                justifyContent="start"
                flexWrap="wrap"
              >
                {selectedInstructors &&
                  selectedInstructors.length > 0 &&
                  selectedInstructors.filter((user) => user).map(
                    (user, index) => (
                        <Tag
                          key={`user-${index}`}
                          size="lg"
                          borderRadius="full"
                          variant="solid"
                          bg={"white"}
                          border={"1px solid"}
                          borderColor={"#E2E8F0"}
                          textColor={"#080A0E"}
                          fontWeight={"normal"}
                          py={2}
                        >
                          <TagLabel>{user.email}</TagLabel>
                          <TagCloseButton
                            onClick={() => {
                              setSelectedInstructors((prevUsers) =>
                                prevUsers.filter(
                                  (item) => item && item.email !== user.email
                                )
                              );
                            }}
                            bgColor={"#718096"}
                            opacity={"none"}
                            _hover={{
                              bg: "#4441C8",
                            }}
                            textColor={"white"}
                          />
                        </Tag>
                      ))}
              </Flex>
              {/* For the "Cc:" section */}
              <Flex
                justifyContent="space-between"
                alignItems="center"
                gap="4"
              >
                <Text
                  color="#474849"
                  fontSize="14px"
                >
                  Cc:
                </Text>
                <EmailDropdown
                  searchTerm={ccSearchTerm}
                  searchedUser={searchedCc}
                  selectedUsers={selectedCc}
                  setSelectedUsers={setSelectedCc}
                  setSearchedUsers={setSearchedCc}
                  getUserResults={getInstructorResults}
                  setSearchTerm={setCcSearchTerm}
                />
              </Flex>
              {/* Display selected Cc: emails */}
              <Flex
                gap="4"
                flexWrap="wrap"
              >
                {/* Display regular cc emails */}
                {ccEmails.filter((user) => user).map((email, index) => (
                  <Tag
                    key={`string-${index}`}
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
                      onClick={() => {
                        setCcEmails(ccEmails.filter((e) => e !== email));
                      }}
                      bgColor={"#718096"}
                      opacity={"none"}
                      _hover={{
                        bg: "#4441C8",
                      }}
                      textColor={"white"}
                    />
                  </Tag>
                ))}

                {/* Display selected cc users from dropdown */}
                {selectedCc &&
                  selectedCc.length > 0 &&
                  selectedCc.map(
                    (user, index) =>
                      user &&
                      user.email && (
                        <Tag
                          key={`user-${index}`}
                          size="lg"
                          borderRadius="full"
                          variant="solid"
                          bg={"white"}
                          border={"1px solid"}
                          borderColor={"#E2E8F0"}
                          textColor={"#080A0E"}
                          fontWeight={"normal"}
                        >
                          <TagLabel>{user.email}</TagLabel>
                          <TagCloseButton
                            onClick={() => {
                              setSelectedCc((prevUsers) =>
                                prevUsers.filter(
                                  (item) => item && item.email !== user.email
                                )
                              );
                            }}
                            bgColor={"#718096"}
                            opacity={"none"}
                            _hover={{
                              bg: "#4441C8",
                            }}
                            textColor={"white"}
                          />
                        </Tag>
                      )
                  )}
              </Flex>
              {/* For the "Bcc:" section */}
              <Flex
                justifyContent="space-between"
                alignItems="center"
                gap="4"
              >
                <Text
                  color="#474849"
                  fontSize="14px"
                >
                  Bcc:
                </Text>
                <EmailDropdown
                  searchTerm={bccSearchTerm}
                  searchedUser={searchedBcc}
                  selectedUsers={selectedBcc}
                  setSelectedUsers={setSelectedBcc}
                  setSearchedUsers={setSearchedBcc}
                  getUserResults={getInstructorResults}
                  setSearchTerm={setBccSearchTerm}
                />
              </Flex>
              {/* Display selected Bcc: emails */}
              <Flex
                gap="4"
                flexWrap="wrap"
              >
                {/* Display regular bcc emails */}
                {bccEmails.filter((user) => user).map((email, index) => (
                  <Tag
                    key={`string-${index}`}
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
                        bg: "#4441C8",
                      }}
                      textColor={"white"}
                    />
                  </Tag>
                ))}

                {/* Display selected bcc users from dropdown */}
                {selectedBcc &&
                  selectedBcc.length > 0 &&
                  selectedBcc.map(
                    (user, index) =>
                      user &&
                      user.email && (
                        <Tag
                          key={`user-${index}`}
                          size="lg"
                          borderRadius="full"
                          variant="solid"
                          bg={"white"}
                          border={"1px solid"}
                          borderColor={"#E2E8F0"}
                          textColor={"#080A0E"}
                          fontWeight={"normal"}
                        >
                          <TagLabel>{user.email}</TagLabel>
                          <TagCloseButton
                            onClick={() => {
                              setSelectedBcc((prevUsers) =>
                                prevUsers.filter(
                                  (item) => item && item.email !== user.email
                                )
                              );
                            }}
                            bgColor={"#718096"}
                            opacity={"none"}
                            _hover={{
                              bg: "#4441C8",
                            }}
                            textColor={"white"}
                          />
                        </Tag>
                      )
                  )}
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
                onClick={handleEmailClick}
                isDisabled={
                  !title ||
                  (emails.length === 0 &&
                    ccEmails.length === 0 &&
                    bccEmails.length === 0)
                }
                width={"45px"}
                height={"30px"}
                borderRadius={"10px"}
                isLoading={loading}
              ></IconButton>
            </Flex>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};
