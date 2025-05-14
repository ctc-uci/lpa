import React, { useEffect, useState } from "react";

import { Box, Flex, Image, VStack } from "@chakra-ui/react";

import InvoiceFooterBackground from "../../assets/background/InvoiceFooter.png";
import InvoiceHeaderBackground from "../../assets/background/InvoiceHeader.png";
import {
  EditInvoiceDetails,
  EditInvoiceTitle,
  FooterDescription,
} from "./EditInvoiceComponents";
import {
  SavedInvoiceSummary,
  SavedStatementComments,
} from "./SavedEditInvoiceComponent";

const InvoiceView = ({
  comments = [],
  booking = [],
  payees = [],
  subtotal = 0.0,
  setSubtotal,
  pastDue,
  instructors = [],
  invoice,
  programName,
  sessions = [],
  setSessions,
  summary = [],
  compactView = false,
}) => {

  useEffect(() => {
    console.log("comments check", comments);
  }, [comments]);

  return (
    <Flex
      direction="column"
      alignItems="center"
      w={compactView ? "100%" : "80%"}
    >
      <Image
        position="relative"
        src={InvoiceHeaderBackground}
        backgroundSize="100%"
        backgroundRepeat="no-repeat"
        w="100%"
      />
      <Box px={compactView && "10"}>
        <EditInvoiceTitle
          comments={comments}
          invoice={invoice?.data}
          compactView={compactView}
        />
        <EditInvoiceDetails
          instructors={instructors}
          programName={programName}
          payees={payees}
          comments={comments}
          invoice={invoice?.data}
          compactView={compactView}
        />
        <SavedStatementComments
          comments={comments}
          sessions={sessions}
          booking={booking}
          subtotal={subtotal}
          setSubtotal={setSubtotal}
          session={sessions}
          summary={summary}
          compactView={compactView}
        />
        <SavedInvoiceSummary
          sessions={sessions}
          setSessions={setSessions}
          comments={comments}
          summary={summary}
          subtotal={subtotal}
          setSubtotal={setSubtotal}
          pastDue={pastDue}
          compactView={compactView}
        />
        <FooterDescription compactView={compactView} />
      </Box>
      <Image
        position="relative"
        src={InvoiceFooterBackground}
        backgroundSize="100%"
        backgroundRepeat="no-repeat"
      />
    </Flex>
  );
};

export { InvoiceView };
