import { useCallback, useEffect, useRef, useState } from "react";

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
  Stack,
  Text,
  Textarea,
  useToast,
} from "@chakra-ui/react";

import { useParams } from "react-router-dom";

import { EditIcon } from "../../assets/EditIcon.jsx";
import { EnvelopeIcon } from "../../assets/EnvelopeIcon.jsx";
import IoPaperPlane from "../../assets/IoPaperPlane.svg";
import logo from "../../assets/logo/logo.png";
import { useBackendContext } from "../../contexts/hooks/useBackendContext";
import { useSessionStore } from "../../stores/useSessionStore";
import { getPastDue } from "../../utils/pastDueCalc";
import { ConfirmEmailModal } from "./ConfirmEmailModal";
import { DiscardEmailModal } from "./DiscardEmailModal";
import { RecipientField } from "./RecipientField.jsx";
import {
  cloneRecipients,
  recipientsEqual,
  recipientsToEmails,
  sendSaveEmail,
} from "./utils.jsx";

export const EmailSidebar = ({
  isOpen: _isOpen,
  onOpen: _onOpen,
  onClose,
  pdf_title,
  invoice,
  onEmailSent,
}) => {
  const { backend } = useBackendContext();
  const toast = useToast();
  const { id } = useParams();
  const { sessions } = useSessionStore();
  const [title, setTitle] = useState(pdf_title);
  const [changesPresent, setChangesPresent] = useState(false);

  const [toRecipients, setToRecipients] = useState([]);
  const [ccRecipients, setCcRecipients] = useState([]);
  const [bccRecipients, setBccRecipients] = useState([]);
  const [defaultToRecipients, setDefaultToRecipients] = useState([]);
  const [defaultCcRecipients, setDefaultCcRecipients] = useState([]);
  const [defaultBccRecipients, setDefaultBccRecipients] = useState([]);

  const [isDiscardModalOpen, setisDiscardModalOpen] = useState(false);
  const [isConfirmModalOpen, setisConfirmModalOpen] = useState(false);
  const [isDrawerOpen, setisDrawerOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [sentRecipients, setSentRecipients] = useState({
    to: [],
    cc: [],
    bcc: [],
  });
  const [messageBody, setMessageBody] = useState("");
  const [isEditingMessage, setIsEditingMessage] = useState(false);

  const btnRef = useRef();

  useEffect(() => {
    setTitle(pdf_title);
  }, [pdf_title]);

  useEffect(() => {
    const hasChanges =
      title !== pdf_title ||
      !recipientsEqual(toRecipients, defaultToRecipients) ||
      !recipientsEqual(ccRecipients, defaultCcRecipients) ||
      !recipientsEqual(bccRecipients, defaultBccRecipients);

    setChangesPresent(hasChanges);
  }, [
    title,
    pdf_title,
    toRecipients,
    defaultToRecipients,
    ccRecipients,
    defaultCcRecipients,
    bccRecipients,
    defaultBccRecipients,
  ]);

  useEffect(() => {
    if (!isDrawerOpen) return;

    const fetchRecipients = async () => {
      try {
        const payeesResponse = await backend.get("/invoices/payees/" + id);
        const instructorResponse = await backend.get(
          "/invoices/instructors/" + id
        );

        const payeeEmails = payeesResponse.data.map((payee) => payee.email);
        const instructorCc = instructorResponse.data.filter(
          (instructor) =>
            instructor?.email && !payeeEmails.includes(instructor.email)
        );

        const payees = cloneRecipients(payeesResponse.data);
        const ccDefaults = cloneRecipients(instructorCc);

        setToRecipients(payees);
        setCcRecipients(ccDefaults);
        setBccRecipients([]);
        setDefaultToRecipients(payees);
        setDefaultCcRecipients(ccDefaults);
        setDefaultBccRecipients([]);
      } catch (error) {
        console.error("Error fetching recipients:", error);
      }
    };

    fetchRecipients();
  }, [id, isDrawerOpen, backend]);

  const searchClients = useCallback(
    async (search, setSearched, selectedRecipients) => {
      try {
        const searchString = typeof search === "string" ? search : "";

        const instructorResponse = await backend.get("/clients/search", {
          params: {
            searchTerm: searchString,
            columns: ["email"],
          },
        });
        const safeSelected = Array.isArray(selectedRecipients)
          ? selectedRecipients
          : [];
        const safeResults = Array.isArray(instructorResponse.data)
          ? instructorResponse.data
          : [];

        const filtered = safeResults.filter(
          (client) =>
            client?.email &&
            !safeSelected.some(
              (selected) =>
                selected?.email?.toLowerCase() === client.email.toLowerCase()
            )
        );

        if (typeof setSearched === "function") {
          setSearched(filtered);
        }
      } catch (error) {
        console.error("Error searching clients:", error);
      }
    },
    [backend]
  );

  const resetForm = () => {
    setTitle(pdf_title);
    setToRecipients(cloneRecipients(defaultToRecipients));
    setCcRecipients(cloneRecipients(defaultCcRecipients));
    setBccRecipients(cloneRecipients(defaultBccRecipients));
    setChangesPresent(false);
  };

  useEffect(() => {
    if (!isDrawerOpen) {
      setIsEditingMessage(false);
      return;
    }

    const customMsg = invoice?.data?.[0]?.customMessage;
    if (customMsg) {
      setMessageBody(customMsg);
    } else {
      backend
        .get("/email/template")
        .then((res) => setMessageBody(res.data.body))
        .catch((err) => console.error("Failed to fetch email template:", err));
    }
  }, [isDrawerOpen, backend, invoice]);

  const handleResetToDefault = async () => {
    try {
      await backend.put("/email/template", { body: messageBody });
    } catch (err) {
      console.error("Failed to save default template:", err);
    }
  };

  const handleRevertToDefault = async () => {
    try {
      const res = await backend.get("/email/template");
      setMessageBody(res.data.body);
    } catch (err) {
      console.error("Failed to fetch default template:", err);
    }
  };

  const handleDoneEditing = async () => {
    try {
      await backend.put(`/invoices/${id}`, { customMessage: messageBody });
    } catch (err) {
      console.error("Failed to save invoice message:", err);
    }
    setIsEditingMessage(false);
  };

  const fetchInvoiceData = async () => {
    const eventId = invoice.data[0].eventId;

    const [
      instructorResponse,
      programNameResponse,
      payeesResponse,
      summaryResponse,
    ] = await Promise.all([
      backend.get(`/assignments/instructors/${eventId}`),
      backend.get(`/events/${eventId}`),
      backend.get(`/invoices/payees/${id}`),
      backend.get(`/comments/invoice/summary/${id}`),
    ]);

    const totalCustomRow = summaryResponse.data[0]?.total?.reduce(
      (acc, total) => acc + Number(total.value),
      0
    );

    const remainingBalance = await getPastDue(backend, id);

    return {
      instructors: instructorResponse.data,
      programName: programNameResponse.data[0].name,
      payees: payeesResponse.data,
      remainingBalance,
      summary: summaryResponse.data[0],
      totalCustomRow,
    };
  };

  const handleEmailClick = async () => {
    try {
      const invoiceData = await fetchInvoiceData();

      const toEmails = recipientsToEmails(toRecipients);
      const ccToEmails = recipientsToEmails(ccRecipients);
      const bccToEmails = recipientsToEmails(bccRecipients);

      setSentRecipients({
        to: toEmails,
        cc: ccToEmails,
        bcc: bccToEmails,
      });

      await backend.put(`/invoices/${id}`, { customMessage: messageBody });

      await sendSaveEmail(
        setLoading,
        setisConfirmModalOpen,
        invoice,
        invoiceData,
        sessions,
        toEmails,
        title,
        messageBody,
        ccToEmails,
        bccToEmails,
        backend,
        id,
        pdf_title,
        onEmailSent
      );
    } catch (err) {
      console.error("Failed to prepare or send email:", err);
      setLoading(false);
      toast({
        title: "Email could not be sent",
        description:
          err?.response?.data || err?.message || "Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-right",
      });
    }
  };

  const handleDrawerClose = () => {
    if (changesPresent) {
      setisDiscardModalOpen(true);
    } else {
      setisDrawerOpen(false);
    }
  };

  return (
    <>
      <DiscardEmailModal
        isOpen={isDiscardModalOpen}
        onClose={() => setisDiscardModalOpen(false)}
        emptyInputs={resetForm}
        setisDrawerOpen={setisDrawerOpen}
      />

      <ConfirmEmailModal
        isOpen={isConfirmModalOpen}
        onClose={() => {
          setisConfirmModalOpen(false);
          setisDrawerOpen(false);
          resetForm();
        }}
        closeDrawer={onClose}
        title={title}
        emails={sentRecipients.to}
        ccEmails={sentRecipients.cc}
        bccEmails={sentRecipients.bcc}
      />

      <Button
        ref={btnRef}
        onClick={() => setisDrawerOpen(true)}
        leftIcon={<EnvelopeIcon />}
        backgroundColor="#4441C8"
        _hover={{ backgroundColor: "#312E8A" }}
        color="white"
        borderRadius={10}
      >
        Email
      </Button>

      <Drawer
        isOpen={isDrawerOpen}
        placement="right"
        onClose={handleDrawerClose}
        finalFocusRef={btnRef}
        size="sm"
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton
            onClick={handleDrawerClose}
            position="initial"
            ml="11px"
            mt="15px"
          />
          <DrawerHeader
            ml="4"
            mt="5"
            fontSize="md"
          >
            <Input
              placeholder="Subject"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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
              spacing="4"
            >
              <RecipientField
                label="To"
                recipients={toRecipients}
                onRecipientsChange={setToRecipients}
                onSearchClients={searchClients}
              />
              <RecipientField
                label="Cc"
                recipients={ccRecipients}
                onRecipientsChange={setCcRecipients}
                onSearchClients={searchClients}
              />
              <RecipientField
                label="Bcc"
                recipients={bccRecipients}
                onRecipientsChange={setBccRecipients}
                onSearchClients={searchClients}
              />
            </Stack>

            <Divider color="#E2E8F0" />

            <Stack mt="10">
              {isEditingMessage ? (
                <>
                  <Textarea
                    value={messageBody}
                    onChange={(e) => setMessageBody(e.target.value)}
                    minH="400px"
                    resize="vertical"
                    borderColor="#E2E8F0"
                    _focus={{ borderColor: "#4441C8", boxShadow: "none" }}
                  />
                  <Flex
                    justify="space-between"
                    mt="1"
                  >
                    <Button
                      size="xs"
                      variant="ghost"
                      color="#718096"
                      onClick={handleRevertToDefault}
                    >
                      Revert to default
                    </Button>
                    <Flex gap="2">
                      <Button
                        size="xs"
                        variant="ghost"
                        color="#718096"
                        onClick={handleDoneEditing}
                      >
                        Done
                      </Button>
                      <Button
                        size="xs"
                        variant="ghost"
                        color="#4441C8"
                        onClick={handleResetToDefault}
                      >
                        Save as default
                      </Button>
                    </Flex>
                  </Flex>
                </>
              ) : (
                <>
                  <Text whiteSpace="pre-line">{messageBody}</Text>
                  <Flex justify="flex-end">
                    <Button
                      size="xs"
                      variant="ghost"
                      color="#4441C8"
                      leftIcon={<EditIcon color="#4441C8" />}
                      onClick={() => setIsEditingMessage(true)}
                    >
                      Edit
                    </Button>
                  </Flex>
                </>
              )}
              <Image
                src={logo}
                w="100px"
                mt="2"
              />
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
                isDisabled={!title || toRecipients.length === 0}
                width="45px"
                height="30px"
                borderRadius="10px"
                isLoading={loading}
              />
            </Flex>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};
