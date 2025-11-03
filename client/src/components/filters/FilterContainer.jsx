import { React, useState } from "react";

import {
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Icon,
  useDisclosure,
  VStack,
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
    await new Promise((resolve) => setTimeout(resolve, 0));

    try {
      onReset();
      await new Promise((resolve) => setTimeout(resolve, 300));
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <>
      <Button
        as="div"
        onClick={onOpen}
        leftIcon={<Icon as={FilterIcon} />}
        display="flex"
        width="99px"
        height="40px"
        padding="0px 16px"
        justifyContent="center"
        alignItems="center"
        gap="4px"
        flexShrink="0"
        borderRadius="6px"
        background="var(--Secondary-2-Default, #EDF2F7)"
        color="var(--Secondary-8, #2D3748)"
        fontFamily="Inter"
        fontSize="14px"
        fontStyle="normal"
        fontWeight="700"
        lineHeight="normal"
        letterSpacing="0.07px"
        _hover={{
          borderRadius: "6px",
          background: "var(--Secondary-3, #E2E8F0)"
        }}
        _active={{
          borderRadius: "6px",
          border: "1px solid var(--Primary-5-Default, #4441C8)",
          background: "var(--Secondary-2-Default, #EDF2F7)"
        }}
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
          <DrawerHeader
            color="#718096"
            fontSize="md"
          >
            {" "}
            {pageName} Filters
          </DrawerHeader>

          <DrawerBody>
            <VStack
              spacing={4}
              align="stretch"
            >
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
            <Button
              _hover={{ backgroundColor: "#312E8A" }}
              backgroundColor="#4441C8"
              color="white"
              onClick={handleApply}
            >
              Apply
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
};
