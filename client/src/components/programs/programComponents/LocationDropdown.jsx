import { useEffect } from "react";

import {
  Box,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Text,
  VStack,
} from "@chakra-ui/react";

import { ArrowDropdown } from "../../../assets/ArrowDropdown";
import { DollarIcon } from "../../../assets/DollarIcon";
import { LocationPinIcon } from "../../../assets/LocationPinIcon";

const formatNumericString = (numericString) => {
  return !isNaN(numericString)
    ? parseFloat(numericString).toFixed(2)
    : numericString;
};

export const LocationDropdown = ({
  locations,
  locationRate,
  selectedLocation,
  selectedLocationId,
  setSelectedLocation,
  setSelectedLocationId,
  setRoomDescription,
  setLocationRate,
}) => {
  useEffect(() => {
    if (selectedLocation.length <= 0) {
      setSelectedLocation("Room");
    }
  }, []);

  return (
    <div id="location">
      <LocationPinIcon size="20px" />
      {locations && locations.length > 0 ? (
        <Popover placement="bottom-start">
          <PopoverTrigger>
            <Box
              width="350px"
              height="40px"
              backgroundColor="white"
              border="1px solid #E2E8F0"
              borderRadius="4px"
              paddingleft="2px"
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              padding="10px"
              fontFamily="Inter"
              fontSize="14px"
              color={selectedLocation === "Room" ? "#CBD5E0" : "#2D3748"}
              _hover={{ backgroundColor: "#EDF2F7" }}
              overflow="hidden"
              whiteSpace="nowrap"
              textOverflow="ellipsis"
            >
              {selectedLocation}
              <ArrowDropdown />
            </Box>
          </PopoverTrigger>
          <PopoverContent
            width="250px!important"
            boxShadow="none"
            outline="none"
            background="white"
          >
            <PopoverBody>
              <VStack
                align="start"
                spacing={2}
              >
                {locations.map((location) => (
                  <Box
                    key={location.id}
                    width="100%"
                    fontSize="14px"
                    borderRadius="4px"
                    cursor="pointer"
                    backgroundColor={
                      selectedLocationId === location.id ? "#EDF2F7" : "white"
                    }
                    _hover={{ backgroundColor: "#EDF2F7" }}
                    onClick={() => {
                      setSelectedLocation(location.name);
                      setSelectedLocationId(location.id);
                      setRoomDescription(location.description);
                      setLocationRate(formatNumericString(location.rate));
                    }}
                  >
                    <Text
                      margin="10px"
                      fontSize={"14px"}
                    >
                      {location.name}
                    </Text>
                  </Box>
                ))}
              </VStack>
            </PopoverBody>
          </PopoverContent>
        </Popover>
      ) : (
        <div></div>
      )}

      <div id="locationRate">
        <DollarIcon />
        <Text
          fontFamily={"Inter"}
          fontSize={"16px"}
        >
          {formatNumericString(locationRate)} / hour
        </Text>
      </div>
    </div>
  );
};
