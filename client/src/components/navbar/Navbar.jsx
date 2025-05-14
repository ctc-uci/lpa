import { Box, VStack } from "@chakra-ui/react";
import { MdNotifications, MdSettings } from "react-icons/md";
import { useLocation } from "react-router-dom";
import { DocumentIcon } from "../../assets/DocumentIcon";
import NavBarButton from "./NavBarButton";
import "./Navbar.css";
import { NavCalendarIcon } from "../../assets/NavCalendarIcon";
import { useState, useEffect } from "react";
import { useBackendContext } from "../../contexts/hooks/useBackendContext";
import { useNavigate } from "react-router-dom";

const Navbar = ({ children, handleNavbarClick, hasUnsavedChanges }) => {
  const { backend } = useBackendContext();
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const [count, setCount] = useState(0); // Initialize with 0 instead of undefined

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

    // Set up a refresh interval (e.g., every 60 seconds)
    const intervalId = setInterval(fetchCount, 60000);

    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, []); // Empty dependency array so it only runs on mount

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

  const handleNavigateAttempt = (path) => {
    if (hasUnsavedChanges) { // Function to check unsaved changes in SingleInvoice
      handleNavbarClick(path);
    } else {
      navigate(path);
    }
  };

  return (
    <div id="navbarBody">
      {/* Fixed width container to prevent layout shifts */}
      <Box
        bg="#F0F0FF"
        bgColor="#FFF"
        className="navbar-container"
        paddingTop="26px"
        paddingBottom="26px"
        paddingLeft="26px"
        paddingRight="8px"
        minWidth="209px"
        width="auto"
        h="260px"
        flexShrink={0}
      >
        <VStack
          spacing="0px"
          margin="0"
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
              onNavigateAttempt={handleNavigateAttempt}
            />
          ))}
        </VStack>
      </Box>
      <div style={{ width: "100%" }}>{children}</div>
    </div>
  );
};

export default Navbar;
