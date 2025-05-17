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
    "Notifications": 180,
    "Settings": 115
  };

  const handleNavigation = (event) => {
    event.preventDefault();
    onNavigateAttempt(item.path);
  };
  
  return (
    <div
      className={`navItem ${isActive ? "active" : ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Box
        as={RouterLink}
        to={item.path}
        onClick={handleNavigation}
        className="nav-item-wrapper"
        width="auto"
        overflow="visible"
        position="relative"
      >
        <Flex
          alignItems="center"
          justifyContent="flex-start"
          className="navLink icon-container"
          height="40px"
          padding="0px 12px"
          gap="8px"
          borderRadius="6px"
          bg={isHovered && !isActive ? "#EDF2F7" : "none"}
          width={isHovered || isActive ? `${widthMap[item.name]}px` : "40px"}
          zIndex="-1"
        >
          <Icon
            className="navIcon"
            fontSize="xl"
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
                left="34px"
              >
                {item.count}
              </Box>
            )}
          
          <Text
            opacity={isHovered || isActive ? 1 : 0}
            fontWeight="700"
            color={isActive ? "#4441C8" : "#718096"}
            fontFamily="Inter"
            fontSize="14px"
            fontStyle="normal"
            lineHeight="normal"
            letterSpacing="0.07px"
            overflow="visible"
            whiteSpace="nowrap"
          >
            {item.name}
          </Text>
          
                    {/* For hovered/active state with notification count */}
            {item.count !== null && item.count !== undefined && (isHovered || isActive) && (
              <Box
                marginLeft="2px"
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
                flexShrink={0}
              >
                {item.count}
              </Box>
            )}
        </Flex>
      </Box>
    </div>
  );
};

export default NavBarButton;