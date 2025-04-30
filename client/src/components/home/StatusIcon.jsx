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
import noneSvg from "../../assets/icons/none.svg";
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
          STATUS
        </Text>
      </PopoverTrigger>
      <PopoverContent
        w="fit-content"
        p={2}
        borderRadius="lg"
        boxShadow="md"
      >
        <PopoverBody>
          <HStack>
            <Box
              as="img"
              src={activeSvg}
              alt="Active"
              boxSize="10px"
            />
            <Text className="status-tooltip-text">Active</Text>
          </HStack>
          <HStack mt={2}>
            <Box
              as="img"
              src={pastSvg}
              alt="Past"
              boxSize="10px"
            />
            <Text className="status-tooltip-text">Past</Text>
          </HStack>
          <HStack mt={2}>
            <Box
              as="img"
              src={noneSvg}
              alt="Past"
              boxSize="10px"
            />
            <Text className="status-tooltip-text">No Bookings</Text>
          </HStack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

export default StatusTooltip;
