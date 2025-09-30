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

import { useBackendContext } from "../../contexts/hooks/useBackendContext";
import { InvoicePDFDocument } from "./InvoicePDFDocument";
import { useInvoiceSessions } from "../../contexts/hooks/useInvoiceSessions";
import { useSessionStore } from "../../stores/useSessionStore";
import { getPastDue } from "../../utils/pastDueCalc"

const PDFButtonInvoice = ({
  id,
  onlyIcon = false,
}) => {
  const [loading, setLoading] = useState(false);
  const [invoice, setInvoice] = useState(null);

  useInvoiceSessions(id);
  const { sessions } = useSessionStore();
  const { backend } = useBackendContext();

  const downloadToast = useToast();

  const fetchInvoiceData = async () => {
    const invoiceResponse = await backend.get(`/invoices/${id}`);
    setInvoice(invoiceResponse.data[0]);

    const eventId = invoiceResponse.data[0]?.eventId;

    const [
      instructorResponse,
      programNameResponse,
      payeesResponse,
      unpaidInvoicesResponse,
      summaryResponse
    ] = await Promise.all([
      backend.get(`/assignments/instructors/${eventId}`),
      backend.get(`/events/${eventId}`),
      backend.get(`/invoices/payees/${id}`),
      backend.get(`/events/remaining/${eventId}`),
      backend.get(`/comments/invoice/summary/${id}`)
    ]);

    // const unpaidTotals = await Promise.all(
    //   unpaidInvoicesResponse.data.map((invoice) =>
    //     backend.get(`/invoices/total/${invoice.id}`)
    //   )
    // );
    // const partiallyPaidTotals = await Promise.all(
    //   unpaidInvoicesResponse.data.map((invoice) =>
    //     backend.get(`/invoices/paid/${invoice.id}`)
    //   )
    // );

    // const unpaidTotal = unpaidTotals.reduce(
    //   (sum, res) => sum + res.data.total,
    //   0
    // );
    // const unpaidPartiallyPaidTotal = partiallyPaidTotals.reduce((sum, res) => {
    //   return res.data.total ? sum + Number(res.data.total) : sum;
    // }, 0);

    const totalCustomRow = summaryResponse.data[0]?.total?.reduce((acc, total) => {
      return acc + Number(total.value);
    }, 0);


    // const remainingBalance = unpaidTotal - unpaidPartiallyPaidTotal + totalCustomRow;

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

  const getGeneratedDate = (sessions = [], includeDay = true) => {
    if (sessions.length === 0) {
      return "No Date Found";
    }
  
    const latestSession = sessions.slice().sort(  
      (a, b) => new Date(b.datetime) - new Date(a.datetime)
    )[0];
  

    const latestDate = new Date(latestSession.datetime);
    latestDate.setMinutes(
      latestDate.getMinutes() + latestDate.getTimezoneOffset()
    );
    
    const month = latestDate.toLocaleString("default", { month: "long" });
    const day = latestDate.getDate();
    const year = latestDate.getFullYear();
  
    return includeDay ? `${month} ${day}, ${year}` : `${month} ${year}`;
  };

  const handleDownload = async () => {
    try {
      setLoading(true);
      const invoiceData = await fetchInvoiceData();

      const blob = await pdf(
        <InvoicePDFDocument
              sessions={sessions}
              invoice={invoice}
              {...invoiceData}
            />
      ).toBlob();


      saveAs(
        blob,
        `${invoiceData?.programName?.split(" ").slice(0, 3).join(" ").trim()}, ${getGeneratedDate(sessions, false)} Invoice`
      );
      downloadToast({
        title: "Invoice Downloaded",
        description: `${invoiceData?.programName?.split(" ").slice(0, 3).join(" ").trim()}_${getGeneratedDate(sessions, false)}`,
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

  return (
    <Box>
      {onlyIcon ? (
        <IconButton
          onClick={handleDownload}
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

const TestPDFViewer = ({ id }) => {
  const [loading, setLoading] = useState(false);
  const [invoice, setInvoice] = useState(null);
  const [invoiceData, setInvoiceData] = useState({});

  useInvoiceSessions(id);
  const { sessions } = useSessionStore();

  const { backend } = useBackendContext();


  const fetchInvoiceData = async () => {
    const invoiceResponse = await backend.get(`/invoices/${id}`);
    setInvoice(invoiceResponse.data[0]);

    const eventId = invoiceResponse.data[0]?.eventId;

    const [
      instructorResponse,
      programNameResponse,
      payeesResponse,
      unpaidInvoicesResponse,
      summaryResponse
    ] = await Promise.all([
      backend.get(`/assignments/instructors/${eventId}`),
      backend.get(`/events/${eventId}`),
      backend.get(`/invoices/payees/${id}`),
      backend.get(`/events/remaining/${eventId}`),
      backend.get(`/comments/invoice/summary/${id}`)
    ]);

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

    const totalCustomRow = summaryResponse.data[0]?.total?.reduce((acc, total) => {
      return acc + Number(total.value);
    }, 0);

    // setLoading(false);
    return {
      instructors: instructorResponse.data,
      programName: programNameResponse.data[0].name,
      payees: payeesResponse.data,
      remainingBalance: remainingBalance,
      summary: summaryResponse.data[0],
      totalCustomRow: totalCustomRow,
    }


  };

  useEffect(() => {
    const fetchData = async () => {
      const invoiceData = await fetchInvoiceData();
      setInvoiceData(invoiceData);
    }
    fetchData();
  }, [id]);
  
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
              sessions={sessions}
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
