import {TableContainer, Table, Tr, Td, Thead, Th, Tbody, Image, Button, Flex, Heading, PopoverTrigger, Popover, PopoverContent, Input, Text, Select} from '@chakra-ui/react'
import filterIcon from  "../../assets/filter.svg";
import { useEffect, useState } from 'react';
import { CalendarIcon } from '@chakra-ui/icons';
import personIcon from "../../assets/person.svg"
import PDFButtonInvoice from "./PDFButtonInvoice"

function InvoicesTable({filteredInvoices, isPaidColor, isPaid}){
  return (
    <TableContainer paddingTop="8px" border='1px solid var(--gray-200, #E2E8F0)' borderRadius='12px' >
      <Table variant='simple'>
        <Thead>
          <Tr>
            <Th textAlign='center'>Program</Th>
            <Th textAlign='center'>Status</Th>
            <Th textAlign='center'>Payee</Th>
            <Th textAlign='center'>Date Due</Th>
            <Th textAlign='center'>Download</Th>
          </Tr>
        </Thead>
        <Tbody>
        {filteredInvoices.map((invoice, index) => (
            <Tr key={index}>
              <Td textAlign='center'>{invoice.eventName}</Td>
              <Td textAlign='center' bg={isPaidColor(invoice)}>{isPaid(invoice)}</Td>
              <Td textAlign='center'>{invoice.name}</Td>
              <Td textAlign="center">
                {new Date(invoice.endDate).toLocaleDateString("en-US", {
                  month: "2-digit", day: "2-digit", year: "numeric"
                })}
              </Td>
              <Td>
                <Flex justifyContent="center">
                  <PDFButtonInvoice invoice={invoice} />
                </Flex>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
}

function InvoicesFilter({invoices, filter, setFilter}) {

  return (
    <>
      <Popover placement='bottom-start'>
        <PopoverTrigger>
          <Button
            backgroundColor="transparent"
            border="1px solid rgba(71, 72, 73, 0.20)"
            borderRadius="15px"
            h="48px"
            px="12px" 
            >
              <Image src={filterIcon} alt="Filter" boxSize="20px" mr="4px" /> Filter 
          </Button>
        </PopoverTrigger>
         <PopoverContent h='auto' w='sm' borderRadius='15px' box-shadow='0px 4px 4px 0px rgba(0, 0, 0, 0.25)' border='1px solid #D2D2D2' padding='16px' display='inline-flex' flexDirection='column' gap='16px'>
          <Flex alignItems='center' gap='8px'>
            <CalendarIcon color='#767778'/>
            <Text size='sm' as='b' color='#767778'>Date Range</Text>
          </Flex>
          <Flex justifyContent='space-evenly' alignItems='center'>
            <Input type='date' w='150px' backgroundColor='#F6F6F6' value={filter.startDate} onChange={(e) => setFilter({...filter, startDate: e.target.value})}/> 
            to
            <Input type='date' w='150px' backgroundColor='#F6F6F6' value={filter.endDate} onChange={(e) => setFilter({...filter, endDate: e.target.value})}/>
          </Flex>

          <Text size='sm' as='b' color='#767778'>Status</Text>
          <Flex justifyContent='space-between' padding='4px 12px'>
          {['All', 'Paid', 'Not Paid', 'Past Due'].map((label, index) => (
              <Button
                key={index}
                borderRadius="30px"
                background="#F6F6F6"
                border={filter.status === label.toLowerCase() ? '1px solid var(--indigo, #4E4AE7)' : '1px solid transparent'}
                onClick={() => setFilter(filter => ({...filter, status: label.toLowerCase()}))
                }
              >
                {label}
              </Button>
            ))}
          </Flex>

          <Flex justifyContent="space-between" alignItems="center" mb={4}>
            <Flex alignItems="center">
              <Image src={personIcon} alt="Instructor" boxSize="20px" mr="4px" />
              <Text as="b" color="#767778">Instructor(s)</Text>
            </Flex>
            <Select w="50%" backgroundColor='#F6F6F6' value={filter.instructor} onChange={(e) => setFilter({...filter, instructor : e.target.value})}>
              <option>All</option>
              {invoices
              .filter(invoice => invoice.role === "instructor")
              .reduce((uniqueNames, invoice) => {
                if (!uniqueNames.includes(invoice.name)) {
                  uniqueNames.push(invoice.name);
                }
                return uniqueNames;
              }, [])
              .map((name, index) => (
                <option key={index}>{name}</option>
              ))}
            </Select>
          </Flex>

          <Flex justifyContent="space-between" alignItems="center">
            <Flex alignItems="center">
              <Image src={personIcon} alt="Payee" boxSize="20px" mr="4px" />
              <Text as="b" color="#767778">Payee(s)</Text>
            </Flex>
            <Select w="50%" backgroundColor='#F6F6F6' value={filter.payee} onChange={(e) => setFilter({...filter, payee : e.target.value})}>
              <option>All</option>
            {invoices
              .filter(invoice => invoice.role === "payee")
              .reduce((uniqueNames, invoice) => {
                if (!uniqueNames.includes(invoice.name)) {
                  uniqueNames.push(invoice.name);
                }
                return uniqueNames;
              }, [])
              .map((name, index) => (
                <option key={index}>{name}</option>
              ))}
            </Select>
          </Flex>


         </PopoverContent>
      </Popover>  
    </>
  )
}

export { InvoicesTable, InvoicesFilter }