import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { Button, Flex, Text } from "@chakra-ui/react";

export const PaginationComponent = ({
  totalPages,
  goToNextPage,
  goToPreviousPage,
  currentPage,
}) => {
  return (
    <>
      {totalPages > 0 && (
        <Flex
          alignItems="center"
          justifyContent="flex-end"
          mt={4}
          mb={4}
          width="100%"
        >
          <Text
            mr={2}
            fontSize="sm"
            color="#718096"
            fontFamily="Inter, sans-serif"
          >
            {currentPage} of {totalPages}
          </Text>
          <Button
            onClick={goToPreviousPage}
            isDisabled={currentPage === 1}
            h="40px"
            variant="ghost"
            padding="0px 9px"
            minWidth="auto"
            color="gray.500"
            mr="16px"
          >
            <ChevronLeftIcon />
          </Button>
          <Button
            onClick={goToNextPage}
            isDisabled={currentPage === totalPages}
            h="40px"
            variant="ghost"
            padding="0px 9px"
            minWidth="auto"
            color="gray.500"
          >
            <ChevronRightIcon />
          </Button>
        </Flex>
      )}
    </>
  );
};