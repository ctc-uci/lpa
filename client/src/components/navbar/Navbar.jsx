import { Box, Flex, VStack } from "@chakra-ui/react";
import { createContext } from "react";
import { IoMdCalendar } from "react-icons/io";
import { MdNotifications, MdSettings } from "react-icons/md";
import { useLocation } from "react-router-dom";
import { DocumentIcon } from "../../assets/DocumentIcon";
import NavBarButton from "./NavBarButton";
import "./Navbar.css";
import { NavCalendarIcon } from "../../assets/NavCalendarIcon";
import { useState, useEffect } from "react";
import { useBackendContext } from "../../contexts/hooks/useBackendContext";



const Navbar = ({ children }) => {
  // Get current location from React Router
  const { backend } = useBackendContext();
  const location = useLocation();
  const currentPath = location.pathname;
  const [count, setCount] = useState()

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const response = await backend.get('/invoices/notificationCount');
        setCount(response.data[0].notificationcount);
      } catch (error) {
        console.error('Error fetching count:', error);
      }
    };

    fetchCount();
  });

  const menuItems = [
    { name: "Programs", path: "/programs", icon: <NavCalendarIcon /> },
    { name: "Invoices", path: "/invoices", icon: <DocumentIcon /> },
    {
      name: "Notifications",
      path: "/notifications",
      icon: <MdNotifications />,
      count: count,
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
        w="240px"
        bg="#F0F0FF"
        // boxShadow="xl" // REMOVE THIS AFTER TESTING
        bgColor="#FFF"
        height="100vh"
        // position="fixed"
        className="navbar-container"
        marginTop="32px"
      >
        <VStack
          spacing={4}
          align="stretch"
          px={2}
          mr={15}
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
      <div style={{ width: "100%" }}>{children}</div>
    </div>
  );
};

export default Navbar;
