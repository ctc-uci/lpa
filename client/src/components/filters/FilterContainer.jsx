import { React, useEffect, useState } from "react";
import {
    Box,
    Button,
    ButtonGroup,
    Checkbox,
    Drawer,
    DrawerBody,
    DrawerFooter,
    DrawerHeader,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
    Flex,
    FormControl,
    FormLabel,
    HStack,
    Icon,
    Input,
    InputGroup,
    Tag,
    Text,
    VStack,
    useColorModeValue,
    useDisclosure
  } from "@chakra-ui/react";

import { FilterIcon } from "../../assets/FilterIcons";

// Children will be the different filterModals to be passed in
export const FilterContainer = ({ onApply, onReset, pageName, children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isFiltering, setIsFiltering] = useState(false);


  const handleApply = () => {
    onApply();
    onClose();
  };

  const handleReset = () => {
    onReset();
    setIsFiltering(false);
  };

  return (
    <>
      <Button
        onClick={onOpen}
        leftIcon={<Icon as={FilterIcon}/>}
        width="100px"
      >
        Filters
      </Button>
      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={onClose}
        size="md"
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader color="#718096" fontSize="md"> {pageName} Filters</DrawerHeader>

          <DrawerBody>
            <VStack spacing={4} align="stretch">
              {children}
            </VStack>
          </DrawerBody>

          <DrawerFooter>
            <Button variant="outline" mr={3} onClick={handleReset}>
              Clear
            </Button>
            <Button backgroundColor="#4441C8" color="white" onClick={handleApply}>
              Apply
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
};

