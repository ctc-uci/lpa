import React, { useEffect, useState} from "react";

import { DownloadIcon } from "@chakra-ui/icons";
import { Box, Flex, IconButton, Spinner, useToast } from "@chakra-ui/react";

import {
  PDFViewer,
  Text,
} from "@react-pdf/renderer";
import { useBackendContext } from "../../contexts/hooks/useBackendContext";
import { InvoicePDFDocument } from "./InvoicePDFDocument";
import { pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";

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

const PDFButtonInvoice = ({ id, hasUnsavedChanges, handleOtherButtonClick}) => {
  // // get comments for the invoice, all relevant db data here
  const { backend } = useBackendContext();
  const [loading, setLoading] = useState(false);
  const [programName, setProgramName] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const downloadToast = useToast();


  const fetchInvoiceData = async (invoice, backend, id) => {
    const eventId = invoice?.data[0]?.eventId;

    const [
      instructorResponse,
      commentsResponse,
      programNameResponse,
      payeesResponse,
      unpaidInvoicesResponse,
    ] = await Promise.all([
      backend.get(`/assignments/instructors/${eventId}`),
      backend.get(`/comments/invoice/${id}`),
      backend.get(`/events/${eventId}`),
      backend.get(`/invoices/payees/${id}`),
      backend.get(`/events/remaining/${eventId}`),
      backend.get(`/invoices/total/${id}`),
    ]);

    const comments = commentsResponse.data;
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
    };
  };

  const getGeneratedDate = (comments, invoice) => {
    const date = new Date(invoice[0].endDate);
    const month = date.toLocaleDateString("default", { month: "long" });
    const year = date.getFullYear();

    if (month && year) {  
      return `${month} ${year}`;
    } else {
      return "No Date Found";
    }
  };

  const handleDownload = async () => {
  try {
    setLoading(true);
    const invoiceResponse = await backend.get(`/invoices/${id}`);
    const invoice = invoiceResponse.data;
    const invoiceData = await fetchInvoiceData(invoiceResponse, backend, id);
    setProgramName(invoiceData.programName)


    const blob = await pdf(
      <InvoicePDFDocument invoice={invoice} {...invoiceData} />
    ).toBlob();

    saveAs(blob, `${invoiceData.programName.split(" ").slice(0, 3).join(" ").trim()}, ${getGeneratedDate(invoiceData.comments, invoice, false)} Invoice`);
    downloadToast({
      title: 'Invoice Downloaded',
      description: `${invoiceData.programName.split(" ").slice(0, 3).join(" ").trim()}_${getGeneratedDate(invoiceData.comments, invoice, false)}`,
      status: 'success',
      duration: 6000,
      position: "bottom-right",
      variant: 'left-accent',
      isClosable: false,
    });
  } catch (err) {
    console.error("Error generating PDF:", err);
  } finally {
    setLoading(false);
  }
};

  return (
    <Box>
        <IconButton
        icon={loading ? <Spinner size="sm" /> : <DownloadIcon boxSize="20px" />}
        onClick={() => {
          if (hasUnsavedChanges) {
            handleOtherButtonClick(() => {
              handleDownload();
            })
          }
          else {
            handleDownload();
          }
        }
      }
        backgroundColor="transparent"
        aria-label="Download PDF"
        isDisabled={loading}
      />
    </Box>
  );
};

const TestPDFViewer = ({ id }) => {
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
    ] = await Promise.all([
      backend.get(`/assignments/instructors/${eventId}`),
      backend.get(`/comments/invoice/${id}`),
      backend.get(`/events/${eventId}`),
      backend.get(`/invoices/payees/${id}`),
      backend.get(`/events/remaining/${eventId}`),
      backend.get(`/invoices/total/${id}`),
    ]);

    const comments = commentsResponse.data;
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
    };
  };

  const fetchData = async () => {
    try {
      const response = await backend.get("/invoices/22");
      setInvoice(response.data);

      const invoiceDataResponse = await fetchInvoiceData(response, backend, 22);
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
