
import { useParams } from 'react-router';
import { ProgramSummary, Sessions } from './ProgramComponents';
import Navbar from '../Navbar';
import {
  Box,
  Text,
  Flex,
} from "@chakra-ui/react"

export const Program = () => {
  const {id}= useParams()
  return (
    <Flex>
      <Navbar/>
      <Box>
        <ProgramSummary />
        <Sessions />
      </Box>
    </Flex>
);
}

