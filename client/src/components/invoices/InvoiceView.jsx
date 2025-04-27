import React from "react";

import {
  Box,
  VStack,
  Image,
  Flex,
} from "@chakra-ui/react";


import InvoiceFooterBackground from "../../assets/background/InvoiceFooter.png";
import InvoiceHeaderBackground from "../../assets/background/InvoiceHeader.png";
import { EditInvoiceTitle, EditInvoiceDetails, FooterDescription } from "./EditInvoiceComponents";
import { SavedInvoiceSummary, SavedStatementComments } from "./SavedEditInvoiceComponent";

const InvoiceView = ({
  comments = [],
  booking = [],
  room = [],
  payees = [],
  subtotal = 0.0,
  setSubtotal,
  pastDue,
  instructors = [],
  invoice,
  programName,
  sessions = [],
  summary = [],
}) => {

  return (
      <Flex direction="column" alignItems="center" w="80%">
        <Image
          position="relative"
          src={InvoiceHeaderBackground}
          backgroundSize="100%"
          backgroundRepeat="no-repeat"
        />
        <VStack
          width="100%"
          spacing={4}
          px={8}
        >
          <Box w="100%">
            <EditInvoiceTitle
                comments={comments}
                invoice={invoice?.data}
              />
            <EditInvoiceDetails
                instructors={instructors}
                programName={programName}
                payees={payees}
                comments={comments}
                invoice={invoice?.data}
              />
            <SavedStatementComments
                comments={comments}
                sessions={sessions}
                booking={booking}
                room={room}
                subtotal={subtotal}
                setSubtotal={setSubtotal}
              />
            <SavedInvoiceSummary
              comments={comments}
              booking={booking}
              room={room}
              subtotal={subtotal}
              setSubtotal={setSubtotal}
              pastDue={pastDue}
              summary={summary}
            />
            <FooterDescription />
          </Box>
        </VStack>
        <Image
          w="100%"
          position="relative"
          src={InvoiceFooterBackground}
          backgroundSize="100%"
          backgroundRepeat="no-repeat"
        />
    </Flex>
  )

}

export {
InvoiceView,
};
