import { React, useState } from "react";
import {
    Button,
    Drawer,
    DrawerBody,
    DrawerFooter,
    DrawerHeader,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
    Icon,
    VStack,
    useDisclosure
  } from "@chakra-ui/react";

import { FilterIcon } from "../../assets/FilterIcons";

// Children will be the different filterModals to be passed in
export const FilterContainer = ({ onApply, onReset, pageName, children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isClearing, setIsClearing] = useState(false);

  const handleApply = () => {
    onApply();
    onClose();
  };

  const handleReset = async () => {
    setIsClearing(true);    
    // Force a render cycle to update UI before continuing
    await new Promise(resolve => setTimeout(resolve, 0));
    
    try {
      onReset();
      await new Promise(resolve => setTimeout(resolve, 300));
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <>
      <Button
        onClick={onOpen}
        leftIcon={<Icon as={FilterIcon}/>}
        width="100px"
      >
        Filtersdfasd
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
            <Button 
              variant="outline" 
              mr={3} 
              onClick={handleReset}
              isLoading={isClearing}
            >
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

