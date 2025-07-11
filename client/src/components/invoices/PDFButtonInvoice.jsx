import React, { useEffect, useState } from "react";

import { CheckCircleIcon, DownloadIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Text as ChakraText,
  Flex,
  HStack,
  Icon,
  IconButton,
  Spinner,
  useToast,
  VStack,
} from "@chakra-ui/react";

import { pdf, PDFViewer, Text } from "@react-pdf/renderer";
import { saveAs } from "file-saver";

import { DownloadInvoiceIcon } from "../../assets/DownloadInvoiceIcon";
import { useBackendContext } from "../../contexts/hooks/useBackendContext";
import { InvoicePDFDocument } from "./InvoicePDFDocument";

// TODO FIX ENDPOINTS TO FIX CALCULATIONS
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

const PDFButtonInvoice = ({
  id,
  onlyIcon = false,
  hasUnsavedChanges,
  handleOtherButtonClick,
}) => {
  // // get comments for the invoice, all relevant db data here
  const { backend } = useBackendContext();
  const [loading, setLoading] = useState(false);
  const [programName, setProgramName] = useState(null);
  const [invoiceDate, setInvoiceDate] = useState("");
  const toast = useToast();
  const downloadToast = useToast();

  const fetchInvoiceData = async (invoice, backend, id) => {
    const eventId = invoice?.data[0]?.eventId;

    const [
      instructorResponse,
      commentsResponse,
      programNameResponse,
      payeesResponse,
      unpaidInvoicesResponse,
      sessionResponse,
      summaryResponse,
    ] = await Promise.all([
      backend.get(`/assignments/instructors/${eventId}`),
      backend.get(`/comments/invoice/${id}`),
      backend.get(`/events/${eventId}`),
      backend.get(`/invoices/payees/${id}`),
      backend.get(`/events/remaining/${eventId}`),
      backend.get(`/comments/invoice/sessions/${id}`),
      backend.get(`/comments/invoice/summary/${id}`),
    ]);

    const comments = commentsResponse.data;
    const sessions = sessionResponse.data;
    const summary = summaryResponse.data;

    setProgramName(
      programNameResponse.data[0].name.trim().split(" ").slice(0, 3).join("_")
    );

    let booking = {};
    let room = [];

    if (comments.length > 0 && comments[0].bookingId) {
      const bookingResponse = await backend.get(
        `/bookings/${comments[0].bookingId}`
      );
      booking = bookingResponse.data[0];

      const roomResponse = await backend.get(`/rooms/${booking.roomId}`);
      room = roomResponse.data;
    }

    const unpaidTotals = await Promise.all(
      unpaidInvoicesResponse.data.map((invoice) =>
        backend.get(`/invoices/total/${invoice.id}`)
      )
    );
    const partiallyPaidTotals = await Promise.all(
      unpaidInvoicesResponse.data.map((invoice) =>
        backend.get(`/invoices/paid/${invoice.id}`)
      )
    );

    const unpaidTotal = unpaidTotals.reduce(
      (sum, res) => sum + res.data.total,
      0
    );
    const unpaidPartiallyPaidTotal = partiallyPaidTotals.reduce((sum, res) => {
      return res.data.total ? sum + Number(res.data.total) : sum;
    }, 0);

    const remainingBalance = unpaidTotal - unpaidPartiallyPaidTotal;

    let subtotalSum = 0;
    if (
      comments.length &&
      booking.startTime &&
      booking.endTime &&
      room[0]?.rate
    ) {
      const total = handleSubtotalSum(
        booking.startTime,
        booking.endTime,
        room[0].rate
      );
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
      id,
      sessions,
      summary,
    };
  };

  const getGeneratedDate = (comments, invoice) => {
    if (comments.length > 0) {
      const latestComment = comments?.sort(
        (a, b) => new Date(b.datetime) - new Date(a.datetime)
      )[0];

      const latestDate = new Date(latestComment.datetime);
      const month = latestDate.toLocaleString("default", { month: "long" });

      const year = latestDate.getFullYear();

      if (month && year) {
        return `${month} ${year}`;
      } else {
        return "No Date Found";
      }
    }
  };

  const handleDownload = async () => {
    try {
      setLoading(true);
      const invoiceResponse = await backend.get(`/invoices/${id}`);
      const invoice = invoiceResponse.data;
      const invoiceData = await fetchInvoiceData(invoiceResponse, backend, id);
      setProgramName(invoiceData.programName);

      const blob = await pdf(
        <InvoicePDFDocument
          invoice={invoice}
          {...invoiceData}
        />
      ).toBlob();

      saveAs(
        blob,
        `${invoiceData.programName.split(" ").slice(0, 3).join(" ").trim()}, ${getGeneratedDate(invoiceData.comments, invoice, false)} Invoice`
      );
      downloadToast({
        title: "Invoice Downloaded",
        description: `${invoiceData.programName.split(" ").slice(0, 3).join(" ").trim()}_${getGeneratedDate(invoiceData.comments, invoice, false)}`,
        status: "success",
        duration: 6000,
        position: "bottom-right",
        variant: "left-accent",
        isClosable: false,
      });
    } catch (err) {
      console.error("Error generating PDF:", err);
    } finally {
      setLoading(false);
    }
  };

  //   const date = new Date(invoice[0].startDate);
  //   const month = date.toLocaleString("default", { month: "long" });
  //   const year = date.getFullYear();

  //   const blob = pdf(
  //     <InvoicePDFDocument
  //       invoice={invoice}
  //       {...invoiceData}
  //     />
  //   ).toBlob();

  //   saveAs(
  //     blob,
  //     `${programName}, ${getGeneratedDate(invoiceData.comments, invoice, false)} Invoice`
  //   );

  //   toast({
  //     position: "bottom-right",
  //     duration: 3000,
  //     status: "success",
  //     render: () => (
  //       <HStack
  //         bg="green.100"
  //         p={4}
  //         borderRadius="md"
  //         boxShadow="md"
  //         borderLeft="6px solid"
  //         borderColor="green.500"
  //         spacing={3}
  //         align="center"
  //       >
  //         <Icon
  //           as={CheckCircleIcon}
  //           color="green.600"
  //           boxSize={5}
  //         />
  //         <VStack
  //           align="left"
  //           spacing={0}
  //         >
  //           <ChakraText
  //             color="#2D3748"
  //             fontFamily="Inter"
  //             fontSize="16px"
  //             fontStyle="normal"
  //             fontWeight={700}
  //             lineHeight="normal"
  //             letterSpacing="0.08px"
  //           >
  //             Invoice Downloaded
  //           </ChakraText>
  //           {month && year && (
  //             <ChakraText
  //               fontSize="sm"
  //             >
  //               {programName}_{month} {year}
  //             </ChakraText>
  //           )}
  //         </VStack>
  //       </HStack>
  //     ),
  //   });
  // } catch (err) {
  //   console.error("Error generating PDF:", err);
  // } finally {
  //   setLoading(false);
  // }

  return (
    <Box>
      {onlyIcon ? (
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            if (hasUnsavedChanges) {
              handleOtherButtonClick(() => {
                handleDownload();
              });
            } else {
              handleDownload();
            }
          }}
          bg="transparent"
          icon={
            loading ? <Spinner size="sm" /> : <DownloadIcon boxSize="20px" />
          }
          aria-label="Download PDF"
          isDisabled={loading}
        ></IconButton>
      ) : (
        <Button
          onClick={handleDownload}
          leftIcon={
            loading ? (
              <Spinner size="sm" />
            ) : (
              <DownloadIcon
                boxSize="20px"
                color={"#4441C8"}
              />
            )
          }
          bg="transparent"
          aria-label="Download PDF"
          isDisabled={loading}
          color={"#4441C8"}
          fontWeight={"600"}
          fontSize={"16px"}
          borderRadius={"6px"}
          border={"1px solid #4441C8"}
          mr={"16px"}
          padding={"0px 16px"}
          justifyContent={"center"}
          alignItems={"center"}
          height={"40px"}
        >
          Download
        </Button>
      )}
    </Box>
  );
};

const TestPDFViewer = () => {
  const { backend } = useBackendContext();
  const [invoice, setInvoice] = useState(null);
  const [invoiceData, setInvoiceData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchInvoiceData = async (invoice, backend, id) => {
    const eventId = invoice?.data[0]?.eventId;

    const [
      instructorResponse,
      commentsResponse,
      programNameResponse,
      payeesResponse,
      unpaidInvoicesResponse,
      sessionResponse,
      summaryResponse,
    ] = await Promise.all([
      backend.get(`/assignments/instructors/${eventId}`),
      backend.get(`/comments/invoice/${id}`),
      backend.get(`/events/${eventId}`),
      backend.get(`/invoices/payees/${id}`),
      backend.get(`/events/remaining/${eventId}`),
      backend.get(`/comments/invoice/sessions/${id}`),
      backend.get(`/comments/invoice/summary/${id}`),
    ]);

    const comments = commentsResponse.data;
    const sessions = sessionResponse.data;
    const summary = summaryResponse.data;
    let booking = {};
    let room = [];

    if (comments.length > 0 && comments[0].bookingId) {
      const bookingResponse = await backend.get(
        `/bookings/${comments[0].bookingId}`
      );
      booking = bookingResponse.data[0];

      const roomResponse = await backend.get(`/rooms/${booking.roomId}`);
      room = roomResponse.data;
    }

    const unpaidTotals = await Promise.all(
      unpaidInvoicesResponse.data.map((invoice) =>
        backend.get(`/invoices/total/${invoice.id}`)
      )
    );
    const partiallyPaidTotals = await Promise.all(
      unpaidInvoicesResponse.data.map((invoice) =>
        backend.get(`/invoices/paid/${invoice.id}`)
      )
    );

    const unpaidTotal = unpaidTotals.reduce(
      (sum, res) => sum + res.data.total,
      0
    );
    const unpaidPartiallyPaidTotal = partiallyPaidTotals.reduce((sum, res) => {
      return res.data.total ? sum + Number(res.data.total) : sum;
    }, 0);

    const remainingBalance = unpaidTotal - unpaidPartiallyPaidTotal;

    let subtotalSum = 0;
    if (
      comments.length &&
      booking.startTime &&
      booking.endTime &&
      room[0]?.rate
    ) {
      const total = handleSubtotalSum(
        booking.startTime,
        booking.endTime,
        room[0].rate
      );
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
      id,
      sessions,
      summary,
    };
  };

  const fetchData = async () => {
    try {
      const response = await backend.get("/invoices/24");
      setInvoice(response.data);

      const invoiceDataResponse = await fetchInvoiceData(response, backend, 40);
      setInvoiceData(invoiceDataResponse);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching invoice data:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Box>
      {loading ? (
        <Flex
          align="center"
          gap={2}
        >
          <Spinner size="sm" />
          <Text fontSize="sm">Generating PDF...</Text>
        </Flex>
      ) : (
        <Box
          height="100vh"
          width="100%"
        >
          <PDFViewer
            width="100%"
            height="100%"
          >
            <InvoicePDFDocument
              invoice={invoice}
              {...invoiceData}
            />
          </PDFViewer>
        </Box>
      )}
    </Box>
  );
};

export { TestPDFViewer, PDFButtonInvoice };
