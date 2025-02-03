import React from "react";

import activeSvg from "../../assets/icons/active.svg";
import pastSvg from "../../assets/icons/past.svg";

import { Box, HStack, Popover, PopoverTrigger, PopoverContent, PopoverBody, Text } from "@chakra-ui/react";

const StatusTooltip = () => {
  return (
    <Popover trigger="hover" placement="top">
      <PopoverTrigger>
        <Text cursor="pointer" color="gray.600">
          Status
        </Text>
      </PopoverTrigger>
      <PopoverContent w="120px" p={2} borderRadius="lg" boxShadow="md">
        <PopoverBody>
          <HStack>
            <Box as="img" src={activeSvg} alt="Active Icon" boxSize="10px" />
            <Text fontSize="sm">Active</Text>
          </HStack>
          <HStack mt={2}>
            <Box as="img" src={pastSvg} alt="Past Icon" boxSize="10px" />
            <Text fontSize="sm">Past</Text>
          </HStack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

export default StatusTooltip;
