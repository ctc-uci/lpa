import React from "react";

import {
  Box,
  HStack,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Text,
} from "@chakra-ui/react";

import activeSvg from "../../assets/icons/active.svg";
import pastSvg from "../../assets/icons/past.svg";

const StatusTooltip = () => {
  return (
    <Popover
      trigger="hover"
      placement="top"
    >
      <PopoverTrigger>
        <Text
          cursor="pointer"
          className="table-header-text"
        >
          Status
        </Text>
      </PopoverTrigger>
      <PopoverContent
        w="120px"
        p={2}
        borderRadius="lg"
        boxShadow="md"
      >
        <PopoverBody>
          <HStack>
            <Box
              as="img"
              src={activeSvg}
              boxSize="10px"
            />
            <Text
              fontSize="sm"
              fontFamily="var(--font-inter)"
              fontWeight="600"
              color="var(--medium-grey)"
            >
              Active
            </Text>
          </HStack>
          <HStack mt={2}>
            <Box
              as="img"
              src={pastSvg}
              boxSize="10px"
            />
            <Text
              fontSize="sm"
              fontFamily="var(--font-inter)"
              fontWeight="600"
              color="var(--medium-grey)"
            >
              Past
            </Text>
          </HStack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

export default StatusTooltip;
