import React, { useState } from "react";


import { Box, Flex, Icon, Text } from "@chakra-ui/react";

import { Link as RouterLink } from "react-router-dom";

import { CalendarSelected } from "../../assets/CalendarSelected";
import { InvoiceSelected } from "../../assets/InvoiceSelected";

const NavBarButton = ({ item, isActive, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = (e) => {
    e.preventDefault(); // Prevent default <a> behavior if using <Link>
    if (onClick) {
      onClick(item);
    }
  };


  return (
    <div
      className={`navItem ${isActive ? "active" : ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* <RouterLink to={item.path}> */}
        <Box
          position="relative"
          className="nav-item-wrapper"
        >
          {/* Icon Container - Always in DOM but hidden with opacity when hovered */}
          <Flex
            alignItems="center"
            justifyContent="center"
            width="70%"
            marginLeft="15%"
            py={3}
            rounded="lg"
            className="navLink icon-container"
            opacity={isHovered ? 0 : 1}
            visibility={isHovered ? "hidden" : "visible"}
            background={isActive ? "#EDF2F7" : "transparent"}
            padding="20px 0px"
          >
            {React.cloneElement(item.icon, {
              color: isActive ? "#4441C8" : "#767778",
              className: "navIcon",
              fontSize: "xl",
            })}
            {item.count !== null && item.count !== undefined && (
              <Box
                position="absolute"
                top="32px"
                right="19px"
                height="24px"
                minWidth="24px"
                textAlign="center"
                fontSize="14px"
                fontWeight="medium"
                color="#FFF"
                padding="2px 5px"
                borderRadius="30px"
                background="#4E4AE7"
              >
                {item.count}
              </Box>
            )}
          </Flex>

          {/* Popup Button - Always in DOM but controlled with opacity */}
          <Box
            className="popup-button"
            bg="#EDF2F7"
            boxShadow="md"
            borderRadius="md"
            position="absolute"
            top="0"
            left="5"
            zIndex={isHovered ? 20 : -1}
            px={4}
            py={3}
            display="flex"
            alignItems="center"
            width="auto"
            opacity={isHovered ? 1 : 0}
            pointerEvents={isHovered ? "auto" : "none"}
          >
            <Icon
              className="navIcon"
              fontSize="xl"
              mr={2}
              color={isActive ? "#4441C8" : "#767778"}
              fill={isActive ? "#4441C8" : "#767778"}
            >
              {item.name === "Programs" ? (
                <CalendarSelected />
              ) : item.name === "Invoices" ? (
                <InvoiceSelected />
              ) : (
                React.cloneElement(item.icon, { size: "23px" })
              )}
            </Icon>
            <Text
              fontWeight="700"
              color="#4441C8"
              fontFamily={"Inter, sans-serif"}
              fontSize={"17px"}
            >
              {item.name}
            </Text>
            {item.count !== null && item.count !== undefined && (
              <Box
                marginLeft="10px"
                height="20px"
                textAlign="center"
                fontSize="12px"
                fontWeight="medium"
                color="#FFF"
                padding="0px 6px"
                borderRadius="30px"
                background="#4E4AE7"
                minWidth="20px"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                {item.count}
              </Box>
            )}
          </Box>
        </Box>
      {/* </RouterLink> */}
    </div>
  );
};

export default NavBarButton;
