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
  const [count, setCount] = useState();
  const [hoveredItem, setHoveredItem] = useState(null);

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
    { 
      name: "Programs", 
      path: "/programs", 
      icon: <NavCalendarIcon />,
    },
    { 
      name: "Invoices", 
      path: "/invoices", 
      icon: <DocumentIcon />,
    },
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
      icon: <MdSettings />,
      fontSize: "xl",
    },
  ];


  return (
    <div id="navbarBody">
      <Box
        bg="#F0F0FF"
        bgColor="#FFF"
        className="navbar-container"
        // border="1px"
        paddingTop="26px"
        paddingBottom="26px"
        paddingLeft="26px"
        paddingRight="8px"
        w="209px"
        h="260px"
        gap="16px"
      >
        <VStack
          spacing="0px"
          margin="0" // Remove any default margins
          padding="0"
          align="stretch"
        >
          {menuItems.map((item) => (
            <NavBarButton
              key={item.name}
              item={item}
              isActive={
                currentPath === item.path ||
                (currentPath.startsWith(item.path + "/") && item.path !== "/")
              }
              onMouseEnter={() => setHoveredItem(item.name)}
              onMouseLeave={() => setHoveredItem(null)}
            />
          ))}
        </VStack>
      </Box>
      <div style={{ width: "100%" }}>{children}</div>
    </div>
  );
};

export default Navbar;
