import { useState } from 'react';

import {
  Box,
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  Text,
  VStack,
  Select,
} from "@chakra-ui/react"

import {DollarIcon} from '../../../assets/DollarIcon';
import {LocationIcon} from '../../../assets/LocationIcon';
import {ArrowDropdown} from '../../../assets/ArrowDropdown';

export const LocationDropdown = ( { locations, locationRate, selectedLocationId, setSelectedLocation, setSelectedLocationId, setRoomDescription, setLocationRate }) => {
  const [selectedLocationName, setSelectedLocationName] = useState("Room");

  return (
    <div id="location">
        <LocationIcon />
        {locations && locations.length > 0 ? (
        <Popover placement="bottom-start" matchWidth>
          <PopoverTrigger>
            <Box
              width="200px"
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
              fontSize="16px"
              color={selectedLocationName==="Room" ? "#CBD5E0" : "#2D3748"}
              _hover={{ backgroundColor: "#EDF2F7" }}
              overflow="hidden"
              whiteSpace="nowrap"
              textOverflow="ellipsis"
            >
              {selectedLocationName}
            <ArrowDropdown />
            </Box>
          </PopoverTrigger>
          <PopoverContent width="200px" boxShadow="none" outline="none" background="white">
            <PopoverBody>
              <VStack align="start" spacing={2}>
                {locations.map((location) => (
                  <Box
                    key={location.id}
                    width="100%"
                    // padding="3px"
                    fontSize="14px"
                    borderRadius="4px"
                    cursor="pointer"
                    backgroundColor={selectedLocationId === location.id ? "#EDF2F7" : "white"}
                    _hover={{ backgroundColor: "#EDF2F7" }}
                    onClick={() => {
                      setSelectedLocationName(location.name);
                      setSelectedLocation(location.name);
                      setSelectedLocationId(location.id);
                      setRoomDescription(location.description);
                      setLocationRate(location.rate);
                    }}
                  >
                    <Text margin="10px">{location.name}</Text>
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
        <p>{locationRate} / hour</p>
      </div>
    </div>
  );
};