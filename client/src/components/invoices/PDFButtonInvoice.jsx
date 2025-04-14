import React from 'react';
import { useState, useEffect } from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { useBackendContext } from '../../contexts/hooks/useBackendContext';
import { IconButton } from "@chakra-ui/react";
import { DownloadIcon } from "@chakra-ui/icons";


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

const MyDocument = ({ bookingData }) => { 
  return ( 
    <Document>
      <Page size="A4" style={styles.page}>
        {bookingData && bookingData.map((element) => (
          <View style={styles.section} key={element.id}>
            <Text>Archived: {element.archived}</Text>
            <Text>Date: {element.date}</Text>
            <Text>Event ID: {element.eventId}</Text>
            <Text>DB ID: {element.id}</Text>
            <Text>Room ID: {element.roomId}</Text>
            <Text>Start Time: {element.startTime}</Text>
            <Text>End Time: {element.endTime}</Text>
          </View>
        ))}
      </Page>
    </Document>
  );
};

const PDFButtonInvoice = ({invoice, toast}) => {
  const { backend } = useBackendContext();
  const [bookingData, setBookingData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const programTitle = invoice.eventName.split(" ").slice(0, 3).join(" ");
  const date = new Date(invoice.endDate);
  const month = date.toLocaleString("default", { month: "long" }); // e.g. "April"
  const year = date.getFullYear();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await backend.get("/bookings");
        setBookingData(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error("Error fetching bookings:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [backend]);

  if (isLoading) return <div>Loading...</div>;

  return (
    <PDFDownloadLink
        document={<MyDocument bookingData={bookingData} />}
        fileName="bookingdata.pdf"
      >
       <IconButton
        icon={<DownloadIcon boxSize="20px" />}
        backgroundColor="transparent"
        aria-label="Download PDF"
        onClick={() => toast({
          title: "PDF Downloaded",
          description: `${programTitle}, ${month} ${year} Invoice`,
          status: "success",
          duration: 2000,
          isClosable: true,
          position: "bottom-right"
        })}
      />
    </PDFDownloadLink>
  );
};
  
export default PDFButtonInvoice;