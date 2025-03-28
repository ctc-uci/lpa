import React from "react";

import {
  Box,
  VStack,
  Image,
} from "@chakra-ui/react";

import { format } from "date-fns";


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
  programName
}) => {

  return (
      <>
        <Image
          w="80%"
          position="relative"
          src={InvoiceHeaderBackground}
          backgroundSize="100%"
          backgroundRepeat="no-repeat"
        />
        <VStack
          width="80%"
          spacing={4}
          px={8}
          // mt={36}
        >
          <Box>
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
            />
            <FooterDescription />


          </Box>
        </VStack>
        <Image
          w="80%"
          position="relative"
          src={InvoiceFooterBackground}
          backgroundSize="100%"
          backgroundRepeat="no-repeat"
        />
    </>
  )

}

export {
InvoiceView,
};
