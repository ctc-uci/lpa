import { useEffect, useRef, useState } from "react";

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

import { pdf } from "@react-pdf/renderer";
import { useParams } from "react-router-dom";

import { EnvelopeIcon } from "../../assets/EnvelopeIcon.jsx";
import IoPaperPlane from "../../assets/IoPaperPlane.svg";
import logo from "../../assets/logo/logo.png";
import { PlusFilledIcon } from "../../assets/PlusFilledIcon.jsx";
import { useBackendContext } from "../../contexts/hooks/useBackendContext";
import { InvoicePDFDocument } from "../invoices/InvoicePDFDocument.jsx";
import { ConfirmEmailModal } from "./ConfirmEmailModal";
import { DiscardEmailModal } from "./DiscardEmailModal";

export const EmailSidebar = ({
  isOpen,
  onOpen,
  onClose,
  pdf_title,
  invoice,
}) => {
  const { backend } = useBackendContext();
  const { id } = useParams();
  const [fileBlob, setFileBlob] = useState();
  const [title, setTitle] = useState(pdf_title);
  const [toInput, setToInput] = useState("");
  const [ccInput, setCcInput] = useState("");
  const [bccInput, setBccInput] = useState("");
  const [changesPresent, setChangesPresent] = useState(false);
  const [emails, setEmails] = useState([]);
  const [originalEmails, setOriginalEmails] = useState([]);
  const [ccEmails, setCcEmails] = useState([]);
  const [bccEmails, setBccEmails] = useState([]);

  const [isDiscardModalOpen, setisDiscardModalOpen] = useState(false);
  const [isConfirmModalOpen, setisConfirmModalOpen] = useState(false);
  const [isDrawerOpen, setisDrawerOpen] = useState(false);

  const [loading, setLoading] = useState(true);


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
        setOriginalEmails(emails);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

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

    const fetchInvoiceData = async (invoice, backend) => {
      const eventId = invoice?.data[0]?.eventId;
    
      const [
        instructorResponse,
        commentsResponse,
        programNameResponse,
        payeesResponse,
        unpaidInvoicesResponse,
        invoiceTotalResponse
      ] = await Promise.all([
        backend.get(`/assignments/instructors/${eventId}`),
        backend.get(`/comments/invoice/22`),
        backend.get(`/events/${eventId}`),
        backend.get(`/invoices/payees/22`),
        backend.get(`/events/remaining/${eventId}`),
        backend.get(`/invoices/total/22`)
      ]);
    
      const comments = commentsResponse.data;
      let booking = {};
      let room = [];
    
      if (comments.length > 0 && comments[0].bookingId) {
        const bookingResponse = await backend.get(`/bookings/${comments[0].bookingId}`);
        booking = bookingResponse.data[0];
    
        const roomResponse = await backend.get(`/rooms/${booking.roomId}`);
        room = roomResponse.data;
      }
    
      const unpaidTotals = await Promise.all(
        unpaidInvoicesResponse.data.map(invoice =>
          backend.get(`/invoices/total/${invoice.id}`)
        )
      );
      const partiallyPaidTotals = await Promise.all(
        unpaidInvoicesResponse.data.map(invoice =>
          backend.get(`/invoices/paid/${invoice.id}`)
        )
      );
    
      const unpaidTotal = unpaidTotals.reduce((sum, res) => sum + res.data.total, 0);
      const unpaidPartiallyPaidTotal = partiallyPaidTotals.reduce((sum, res) => {
        return res.data.total ? sum + Number(res.data.total) : sum;
      }, 0);
    
      const remainingBalance = unpaidTotal - unpaidPartiallyPaidTotal;
    
      let subtotalSum = 0;
      if (comments.length && booking.startTime && booking.endTime && room[0]?.rate) {
        const total = handleSubtotalSum(booking.startTime, booking.endTime, room[0].rate);
        subtotalSum = parseFloat(total) * comments.length;
      }
    
      return {
        instructors: instructorResponse.data,
        programName: programNameResponse.data[0].name,
        payees: payeesResponse.data,
        comments,
        booking,
        room,
        remainingBalance,
        subtotalSum,
      };
    };


  const generatePDFBlob = async () => {
    // Make sure the invoice data is loaded before proceeding
    // if (!invoice || !invoice.data || invoice.data.length === 0) {
    //   console.log("Waiting for invoice data to load...");
    //   return null;
    // }

    const invoiceData = await fetchInvoiceData(invoice, backend);

    const pdfDocument = (
      <InvoicePDFDocument
        invoice={invoice}
        {...invoiceData}
      />
    );

    const blob = await pdf(pdfDocument).toBlob();
    return blob;
  };


  
  const makeBlob = async () => {

    
    const invoiceData = await fetchInvoiceData(invoice, backend);

    const pdfDocument = (
      <MyDocument
        invoice={invoice}
        {...invoiceData}
      />
    );

      const blob = await pdf(pdfDocument).toBlob();
      return blob;
    }

  

  const handleButtonClick = async () => {
        const blob = await makeBlob();
        await sendEmail(blob);
        // console.log("after sendEmail");
        await saveEmail(blob);
        setisConfirmModalOpen(true);
  };

  const sendEmail = async (blob) => {
    try {
      console.log("fileblob in sendEmail", blob);
      if (blob) {
        const formData = new FormData();
        formData.append("pdfFile", blob, `${pdf_title}.pdf`);
        formData.append("to", emails);
        formData.append("subject", title);
        formData.append("text", message);
        formData.append("html", `<p>${message.replace(/\n/g, "<br />")}</p>`);
        formData.append("cc", ccEmails);
        formData.append("bcc", bccEmails);

        const response = await backend.post("/email/send", formData);

        console.log("Email sent successfully!", response.data);
      }
    } catch (error) {
      console.error("Error sending email:", error);
    }
  };

  const saveEmail = async (blob) => {
    try {
      if (blob) {
        await backend.post(`invoices/backupInvoice/` + id, {
          comment: "",
          file: blob,
        });
      }
      else {
        console.log("no blob for save email");
      }
    } catch (error) {
      console.error("Error saving email to database:", error);
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
        onClose={() => {
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
            {/* <Text fontSize={"18px"} color={"black"}>{title}</Text> */}
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
                        },
                      }}
                      _hover={{
                        bgColor: "transparent",
                        svg: {
                          rect: { fill: "#4441C8" },
                        },
                      }}
                      _active={{ bgColor: "transparent" }}
                      _focus={{ boxShadow: "none" }}
                      icon={<PlusFilledIcon />}
                      onClick={handleAddEmail}
                    />
                  </InputRightElement>
                </InputGroup>
              </Flex>
              <Flex
                gap="4"
                justifyContent="start"
                wrap="wrap"
              >
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
                        setEmails((prevEmails) =>
                          prevEmails.filter((e) => e !== email)
                        )
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
                        },
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
                      icon={<PlusFilledIcon />}
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
                        bg: "#4441C8",
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
                        },
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
                      icon={<PlusFilledIcon />}
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
                        bg: "#4441C8",
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
                onClick={
                  handleButtonClick
                }
                isDisabled={
                  !title ||
                  (emails.length === 0 &&
                    ccEmails.length === 0 &&
                    bccEmails.length === 0)
                }
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
