import { Box, Flex, VStack } from "@chakra-ui/react";

import { IoMdCalendar } from "react-icons/io";
import { MdNotifications, MdSettings } from "react-icons/md";
import { useLocation } from "react-router-dom";

import { DocumentIcon } from "../../assets/DocumentIcon";
import NavBarButton from "./NavBarButton";

import "./Navbar.css";

import { NavCalendarIcon } from "../../assets/NavCalendarIcon";

const Navbar = ({ children, notificationsCount }) => {
  // Get current location from React Router
  const location = useLocation();
  const currentPath = location.pathname;

  const menuItems = [
    { name: "Programs", path: "/programs", icon: <NavCalendarIcon /> },
    { name: "Invoices", path: "/invoices", icon: <DocumentIcon /> },
    {
      name: "Notifications",
      path: "/notifications",
      icon: <MdNotifications />,
      count: notificationsCount,
      fontSize: "xl",
    },
    {
      name: "Settings",
      path: "/settings",
      icon: <MdSettings size="23px" />,
      fontSize: "xl",
    },
  ];

  return (
    <div id="navbarBody">
      <Box
        w="112px"
        bg="white"
        boxShadow="lg"
        bgColor="#FFF"
        height="100vh"
        position="fixed"
        zIndex={10}
        className="navbar-container"
        marginTop="32px"
      >
        <VStack
          spacing={4}
          align="stretch"
          px={2}
        >
          {menuItems.map((item) => (
            <NavBarButton
              key={item.name}
              item={item}
              isActive={
                currentPath === item.path ||
                (currentPath.startsWith(item.path + "/") && item.path !== "/")
              }
            />
          ))}
        </VStack>
      </Box>
      <div style={{ width: "100%", paddingLeft: "112px" }}>{children}</div>
    </div>
  );
};

export default Navbar;
