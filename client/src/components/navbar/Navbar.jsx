import { Box, Flex, Icon, Link, Text, VStack } from "@chakra-ui/react";

import { IoMdCalendar } from "react-icons/io";
import { MdNotifications, MdSettings } from "react-icons/md";
import { TbInvoice } from "react-icons/tb";

import { Logo } from "../../assets/logo/Logo";

import "./Navbar.css";

const Navbar = ({ children, notificationsCount, currentPage = "" }) => {
  const menuItems = [
    { name: "Programs", path: "/programs", icon: <IoMdCalendar /> },
    { name: "Invoices", path: "/invoices", icon: <TbInvoice /> },
    {
      name: "Notifications",
      path: "/notifications",
      icon: <MdNotifications />,
      count: notificationsCount,
    },
    { name: "Settings", path: "/settings", icon: <MdSettings /> },
  ];

  console.log(currentPage)
  return (
    <div id="navbarBody">
      <Box
        w="18%"
        maxW={250}
        bg="white"
        boxShadow="lg"
        bgColor="#F6F6F6"
        height="100vh"
        position="fixed"
      >
        <Flex
          justify="center"
          p={10}
          pb={7}
        >
          <Logo></Logo>
        </Flex>

        <VStack
          spacing={2}
          align="stretch"
          px={4}
        >
          {menuItems.map((item) => (
            <div
              key={item.name}
              className="navItem"
              color={
                currentPage === item.name.toLowerCase() ? "#4441C8" : "#767778"
              }
            >
              <Link
                href={item.path}
                display="flex"
                alignItems="center"
                px={4}
                py={3}
                rounded="lg"
                className="navLink"
              >
                <Icon
                  className="navIcon"
                  fontSize="2xl"
                  color={
                    currentPage === item.name.toLowerCase()
                      ? "#4441C8"
                      : "#767778"
                  }
                >
                  {item.icon}
                </Icon>
                <Text className={currentPage === item.name.toLowerCase() ? "navTextChosen" : "navText"} >{item.name}</Text>
                {item.count !== null && item.count !== undefined && (
                  <Box
                    marginLeft="10px"
                    height="30px"
                    textAlign="center"
                    fontSize="15px"
                    fontWeight="medium"
                    color="#FFF"
                    padding="5px"
                    borderRadius="5px"
                    background="#4E4AE7"
                    width="auto"
                  >
                    {item.count}
                  </Box>
                )}
              </Link>
            </div>
          ))}
        </VStack>
      </Box>
      <div style={{ width: "100%", paddingLeft: "min(18%, 250px)" }}>
        {children}
      </div>
    </div>
  );
};

export default Navbar;
