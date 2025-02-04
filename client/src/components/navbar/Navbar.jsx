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
    >
      {/* Logo Section */}
      <Flex
        justify="center"
        p={6}
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
          <div key={item.name}>
            <Link
              href={item.path}
              display="flex"
              alignItems="center"
              px={4}
              py={3}
              color="gray.700"
              _hover={{ bg: "gray.100" }}
              rounded="lg"
            >
              {item.icon}
              <Text>{item.name}</Text>
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
