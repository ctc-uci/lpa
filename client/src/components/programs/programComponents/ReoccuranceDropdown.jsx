import {
  Box,
  Flex,
  Icon,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Text,
  VStack,
} from "@chakra-ui/react";

import { ArrowDropdown } from "../../../assets/ArrowDropdown";
import { RepeatIcon } from "../../../assets/RepeatIcon";

export const ReoccuranceDropdown = ({
  repeatType = "Every week",
  setRepeatType,
}) => {
  return (
    <Box>
      {/* repeatability dropdown */}
      <Flex alignItems="center">
        <Icon
          fontSize={20}
          mr={3}
        >
          <RepeatIcon />
        </Icon>
        <Popover
          placement="bottom-start"
          matchWidth
        >
          <PopoverTrigger>
            <Box
              width="200px"
              height="40px"
              backgroundColor="white"
              border="1px solid #E2E8F0"
              borderRadius="4px"
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              padding="0px 16px"
              fontFamily="Inter"
              fontSize="14px"
              color="#2D3748"
              _hover={{ backgroundColor: "#EDF2F7" }}
              cursor="pointer"
              spacing="4px"
            >
              <Text width="148px">
                {repeatType && repeatType.length > 0
                  ? repeatType
                  : "Every week"}
              </Text>
              <ArrowDropdown />
            </Box>
          </PopoverTrigger>
          <PopoverContent
            width="200px"
            height="auto"
            _focus={{ outline: "none", boxShadow: "none" }}
            background="white"
          >
            <PopoverBody padding="4px">
              <VStack
                align="start"
                spacing="10px"
              >
                {["Every week", "Every month", "Every year"].map((option) => (
                  <Box
                    key={option}
                    width="100%"
                    fontFamily="Inter"
                    fontSize="14px"
                    color="#2D3748"
                    borderRadius="4px"
                    padding="6px 8px"
                    cursor="pointer"
                    backgroundColor={
                      repeatType === option ? "#EDF2F7" : "white"
                    }
                    _hover={{ backgroundColor: "#EDF2F7" }}
                    onClick={() => {
                      setRepeatType(option);
                    }}
                  >
                    <Text>{option}</Text>
                  </Box>
                ))}
              </VStack>
            </PopoverBody>
          </PopoverContent>
        </Popover>
      </Flex>
    </Box>
  );
};
