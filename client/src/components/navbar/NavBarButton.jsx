import React, { useState } from "react";
import { Box, Flex, Icon, Text } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { CalendarSelected } from "../../assets/CalendarSelected";
import { InvoiceSelected } from "../../assets/InvoiceSelected";

const NavBarButton = ({ item, isActive, onNavigateAttempt }) => {
  const [isHovered, setIsHovered] = useState(false);

  const widthMap = {
    "Programs": 123,
    "Invoices": 114, 
    "Notifications": 169,
    "Settings": 115
  };

  const handleNavigation = (event) => {
    event.preventDefault(); // Prevent immediate navigation by RouterLink
    onNavigateAttempt(item.path); // Call the handler in the parent
  };
  
  // Get width based on hover or active state
  const getButtonWidth = () => {
    // Always use the full width when hovered or active to prevent layout shifts
    if (isHovered || isActive) {
      return `${widthMap[item.name]}px`;
    }
    
    // When not hovered/active, we still use the SAME width but hide the text
    // This prevents layout shifts when hovering
    return `${widthMap[item.name]}px`;
  };
  
  return (
    <div
      className={`navItem ${isActive ? "active" : ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* <RouterLink to={item.path}> */}
        <Box
          bg={isHovered && !isActive ? "#EDF2F7" : "none"}
          as={RouterLink}
          to={item.path}
          onClick={handleNavigation}
          borderRadius={isActive ? "none" : "6px"}
          className="nav-item-wrapper"
          width={getButtonWidth()}
          transition="none" // Prevent width transitions
          overflow="hidden"
          position="relative" // Important for absolute positioning
        >
          <Flex
            alignItems="center"
            justifyContent="flex-start"
            width="100%"
            rounded="lg"
            className="navLink icon-container"
            height="40px"
            ml={2}
          >
            <Icon
              className="navIcon"
              fontSize="xl"
              mr={2}
              color={isActive ? "#4441C8" : "#718096"}
              fill={isActive ? "#4441C8" : "#718096"}
              flexShrink={0}
            >
              {item.name === "Programs" ? (
                <CalendarSelected fill={isActive ? "#4441C8" : "#718096"}/>
              ) : item.name === "Invoices" ? (
                <InvoiceSelected fill={isActive ? "#4441C8" : "#718096"}/>
              ) : (
                React.cloneElement(item.icon, { size: "23px" })
              )}
            </Icon>
            
            {/* Show the non-hovered count badge only when not hovered/active AND when we have a count */}
            {item.count !== null && item.count !== undefined && !isActive && !isHovered && (
              <Box
                height="17px"
                width="17px"
                textAlign="center"
                fontSize="14px"
                fontFamily="Inter"
                fontStyle="normal"
                fontWeight="300"
                color="#FFF"
                padding="0px 5px"
                borderRadius="50%"
                background="#4441C8"
                lineHeight="normal"
                minWidth="16px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                position="absolute"
                left="30px" // Position it consistently
              >
                {item.count}
              </Box>
            )}
            
            <Text
              opacity={isHovered || isActive ? 1 : 0}
              fontWeight="700"
              color={isActive ? "#4441C8" : "#718096"}
              fontFamily={"Inter, sans-serif"}
              fontSize={"14px"}
              overflow="hidden"
              whiteSpace="nowrap"
              transition="opacity 0.2s ease"
              ml={0} // Keep margin consistent
            >
              {item.name}
            </Text>
            
            {/* For hovered/active state with notification count */}
            {item.count !== null && item.count !== undefined && (isHovered || isActive) && (
              <Box
                marginLeft="10px"
                height="17px"
                width="17px"
                textAlign="center"
                fontSize="15px"
                fontStyle="normal"
                fontWeight="350"
                color="#FFF"
                padding="0px 5px"
                borderRadius="50%"
                background="#4441C8"
                lineHeight="normal"
                minWidth="16px"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                {item.count}
              </Box>
            )}
          </Flex>
        </Box>
      {/* </RouterLink> */}
    </div>
  );
};

export default NavBarButton;