import React, { useState } from "react";
import { Box, Flex, Icon, Text } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { CalendarSelected } from "../../assets/CalendarSelected";
import { InvoiceSelected } from "../../assets/InvoiceSelected";

const NavBarButton = ({ item, isActive }) => {
  const [isHovered, setIsHovered] = useState(false);

  const widthMap = {
    "Programs": 123,
    "Invoices": 114, 
    "Notifications": 169,
    "Settings": 115
  };

  // Get width based on hover state
  const getButtonWidth = () => {
    if (!isHovered && !isActive) return "40px"; // Icon-only width when not hovered/active
    return `${widthMap[item.name]}px`;
  };

  return (
    <div
      className={`navItem ${isActive ? "active" : ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <RouterLink to={item.path}>
        <Box
          bg={isHovered && !isActive ? "#EDF2F7" : "none"}
          borderRadius={isActive ? "none" : "6px"}
          className="nav-item-wrapper"
          width={getButtonWidth()}
          // transition="width 0.2s ease"
          overflow="hidden"
          // border="1px"
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
            <Text
              opacity={isHovered || isActive ? 1 : 0}
              fontWeight="700"
              color={isActive ? "#4441C8" : "#767778"}
              fontFamily={"Inter, sans-serif"}
              fontSize={"14px"}
              overflow="hidden"
              whiteSpace="nowrap"
              // textOverflow="ellipsis"
              // transition="opacity 0.2s ease"
              // flexGrow={1}
              // flexShrink={0}
            >
              {item.name}
            </Text>
          </Flex>
        </Box>
      </RouterLink>
    </div>
  );
};

export default NavBarButton;