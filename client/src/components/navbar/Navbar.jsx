import { Box, Flex, Icon, Link, Text, VStack } from "@chakra-ui/react";
import { Logo } from '../../assets/logo/Logo';
import { MdNotifications } from "react-icons/md";
import { MdSettings } from "react-icons/md";
import { IoMdCalendar } from "react-icons/io";
import { TbInvoice } from "react-icons/tb";
import './Navbar.css';


export const Navbar = ({ children }) => {
  const menuItems = [
    { name: "Programs", path: "/programs", icon: <IoMdCalendar/>},
    { name: "Invoices", path: "/invoices", icon: <TbInvoice/> },
    { name: "Notifications", path: "/notifications", icon: <MdNotifications/> },
    { name: "Settings", path: "/settings", icon:<MdSettings/> }
  ];

  return (
    <div id="navbarBody"

    >
    <Box
      w="64"
      bg="white"
      boxShadow="lg"
      bgColor="#F6F6F6"
    >
      {/* Logo Section */}
      <Flex
        justify="center"
        p={10}
        pb={7}
      >
        <Logo></Logo>
      </Flex>

      {/* Navigation Links */}
      <VStack
        spacing={2}
        align="stretch"
        px={4}
      >
        {menuItems.map((item) => (
          <div key={item.name} className="navItem" color="#474849" _hover={{ color: "#4E4AE7" }}>
            <Link
              href={item.path}
              display="flex"
              alignItems="center"
              px={4}
              py={3}
              rounded="lg"
              _hover={{ color: "#4E4AE7" }}
              className="navLink"
            >
              <Icon className="navIcon"  fontSize="2xl">{item.icon}</Icon>
              <Text className="navText">{item.name}</Text>
            </Link>
          </div>
        ))}
      </VStack>
    </Box>
    {children}
    </div>
  );
};

export default Navbar;
