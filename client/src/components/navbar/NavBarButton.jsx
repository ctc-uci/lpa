import React, { useState } from "react";


import { Box, Flex, Icon, Text } from "@chakra-ui/react";

import { Link as RouterLink } from "react-router-dom";

import { CalendarSelected } from "../../assets/CalendarSelected";
import { InvoiceSelected } from "../../assets/InvoiceSelected";

const NavBarButton = ({ item, isActive }) => {
  const [isHovered, setIsHovered] = useState(false);


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
          position="relative"
          className="nav-item-wrapper"
        >
          {/* Icon Container - Always in DOM but hidden with opacity when hovered */}
          <Flex
            alignItems="center"
            justifyContent="flex-start"
            width="100%"
            marginLeft="15%"
            py={3}
            rounded="lg"
            className="navLink icon-container"
            // opacity={isHovered ? 0 : 1}
            // visibility={isHovered ? "hidden" : "visible"}
            // background={isActive ? "red" : "transparent"}
            // padding="20px 0px" //this makes popup uneven
          >
            <Icon
              className="navIcon"
              fontSize="xl"
              mr={2}
              color={isActive ? "#4441C8" : "#718096"}
              fill={isActive ? "#4441C8" : "#718096"}
            >
              {item.name === "Programs" ? (
                <CalendarSelected fill={isActive ? "#4441C8" : "#718096"}/>
              ) : item.name === "Invoices" ? (
                <InvoiceSelected fill={ isActive ? "#4441C8" : "#718096"}/>
              ) : (
                React.cloneElement(item.icon, { size: "23px" })
              )}
            </Icon>
            <Text
              opacity={isHovered || isActive ? 1 : 0}
              fontWeight="700"
              color= {isActive ? "#4441C8" : "#767778"}
              fontFamily={"Inter, sans-serif"}
              fontSize={"14px"}
              overflow={"hidden"}
            >
              {item.name}
            </Text>
            {/* {React.cloneElement(item.icon, {
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
              </Box> */}
            {/* )} */}
          </Flex>

          {/* Popup Button - Always in DOM but controlled with opacity */}
          {/* <Box
            className="popup-button"
            // bg="#EDF2F7"
            bg={"yellow"}
            boxShadow="md"
            borderRadius="md"
            position="absolute"
            top="0"
            left="5"
            // right="calc(100% - 20px)"
            zIndex={isHovered ? 20 : -1}
            px={4}
            py={3}
            display="flex"
            alignItems="center"
            width="auto"
            opacity={isHovered ? 1 : 0}
            pointerEvents={isHovered ? "auto" : "none"}
            overflow={"hidden"}
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
              fontSize={"14px"}
              overflow={"hidden"}
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
            )} */}
          {/* </Box> */}
        </Box>
      </RouterLink>
    </div>
  );
};

export default NavBarButton;
