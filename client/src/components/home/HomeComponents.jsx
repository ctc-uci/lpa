import { Table, Thead, Tbody, Tfoot, Tr, Th, Td } from "@chakra-ui/react";

export const ProgramsTable = () => {
  return (
    <Table>
      <Thead>
        <Tr>
          <Th>Header</Th>  {/* Add column names */}
        </Tr>
      </Thead>
      <Tbody>
        <Tr>
          <Td>Data</Td> {/* Add data inside <Td> */}
        </Tr>
      </Tbody>
      <Tfoot>
        <Tr>
          <Td>Footer</Td>
        </Tr>
      </Tfoot>
    </Table>
  );
};
