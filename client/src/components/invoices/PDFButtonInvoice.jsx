import React from 'react';
import { useState, useEffect } from 'react';
import { Document, Page, Text, View, StyleSheet, Image, PDFViewer} from '@react-pdf/renderer';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { useBackendContext } from '../../contexts/hooks/useBackendContext';
import { Box, IconButton } from "@chakra-ui/react";
import { DownloadIcon } from "@chakra-ui/icons";
import InvoiceHeader from "../../assets/background/InvoiceHeader.png"
import InvoiceFooter from "../../assets/background/InvoiceFooter.png"


const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: '#ffffff'
  },
  section: {
    margin: 10,
    padding: 20,
    borderRadius: 5,
    backgroundColor: '#f8f9fa',
    borderBottom: '1px solid #eee'
  },
  header: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2c3e50'
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'center'
  },
  label: {
    width: 100,
    fontSize: 12,
    color: '#666',
    marginRight: 10
  },
  value: {
    flex: 1,
    fontSize: 12,
    color: '#333'
  },
  dateTime: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  timeBlock: {
    flex: 1
  }
});

const getGeneratedDate = () => {
  if (comments.length > 0) {
    const latestComment = comments?.sort(
      (a, b) => new Date(b.datetime) - new Date(a.datetime)
    )[0];

    const latestDate = new Date(latestComment.datetime);
    const month = latestDate.toLocaleString("default", { month: "long" });

    const year = latestDate.getFullYear();

    return `${month}  ${year}`;
  } else {
    return "No Date Found";
  }
};

const EditInvoiceTitle = ({ comments, invoice }) => {
  return (
    <Flex
      justifyContent="space-between"
      my="8"
      mx="4"
      fontFamily="Inter"
      color="#2D3748"
    >
      <Stack>
        <Heading
          color="#2D3748"
          fontWeight="600"
          fontSize="45px"
        >
          INVOICE
        </Heading>
        <Text
          color="#718096"
          fontSize="16px"
        >
          {getGeneratedDate(comments, invoice, true)}
        </Text>
      </Stack>
      <Flex
        direction={{ base: "column", md: "row" }}
        justify="end"
        align="center"
        gap="4"
      >
        <VStack
          align="flex-end"
          spacing={0}
        >
          <Text fontSize="16px">La Peña Cultural Center</Text>
          <Text fontSize="16px">3105 Shattuck Ave., Berkeley, CA 94705</Text>
          <Text fontSize="16px">lapena.org</Text>
        </VStack>
        <Image
          src={logo}
          alt="La Peña Logo"
          w="125px"
        />
      </Flex>
    </Flex>
  );
};

const MyDocument = ({ invoice }) => { 
  
  useEffect(() => {
    console.log("invoice ", invoice);
    }, [invoice]);

  return ( 
    <Document>
      <Page size="A4" style={styles.page}>
        <View>
          <Image src={InvoiceHeader}/>
            <View style={{
              justifyContent: "space-between",
              marginVertical: "8",
              marginHorizontal: "4",
              // fontFamily: "Inter",
              color: "#2D3748",
              flexDirection: 'row',
            }}>
              <View>
                <Text style={{
                  color: "#2D3748",
                  fontWeight: "600",
                  fontSize: "24px"
                }}>INVOICE</Text>
                <Text
                  style={{
                    color: "#718096",
                    fontSize: "16px",
                  }}
                >
                  Date
                </Text>
              </View>
            </View>

          {/* <Text>Recurring Program</Text>
          <Text>{invoice.eventName}</Text>
          <View>
            {invoice.payers.map((payer) => (
                <Text>
                  {payer}
                </Text>
              )
            )}
          </View> */}
          <Image src={InvoiceFooter}/>
        </View>
      </Page>
    </Document>
  );
};

const PDFButtonInvoice = ({invoice}) => {
  // get comments for the invoice, all relevant db data here

  


  return (
    // <PDFDownloadLink
    //     document={<MyDocument invoice={invoice} />}
    //     fileName="bookingdata.pdf"
    //   >
    //    <IconButton
    //     icon={<DownloadIcon boxSize="20px" />}
    //     backgroundColor="transparent"
    //     aria-label="Download PDF"
    //   />
    // </PDFDownloadLink>
    <Box>

      <PDFViewer width="100%" height="800">
        <MyDocument invoice={invoice} />
      </PDFViewer>
        <PDFDownloadLink
          document={<MyDocument invoice={invoice} />}
          fileName="bookingdata.pdf"
        >
          <IconButton
          icon={<DownloadIcon boxSize="20px" />}
          backgroundColor="transparent"
          aria-label="Download PDF"
        />
      </PDFDownloadLink>
    </Box>
  );
};
  
export default PDFButtonInvoice;