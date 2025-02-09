import { Box, Flex, Icon, Link, Text, VStack } from "@chakra-ui/react";

import { IoMdCalendar } from "react-icons/io";
import { MdNotifications, MdSettings } from "react-icons/md";
import { TbInvoice } from "react-icons/tb";

import { Logo } from "../../assets/logo/Logo";

import "./Navbar.css";

const Navbar = ({ children }) => {
  const menuItems = [
    { name: "Programs", path: "/programs", icon: <IoMdCalendar /> },
    { name: "Invoices", path: "/invoices", icon: <TbInvoice /> },
    {
      name: "Notifications",
      path: "/notifications",
      icon: <MdNotifications />,
    },
    { name: "Settings", path: "/settings", icon: <MdSettings /> },
  ];

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
                >
                  {item.icon}
                </Icon>
                <Text className="navText">{item.name}</Text>
              </Link>
            </div>
          ))}
        </VStack>
      </Box>
      <div style={{ width: "100%", marginLeft: "min(18%, 250px)" }}>
        {children}
      </div>
    </div>
  );
};

export default Navbar;
