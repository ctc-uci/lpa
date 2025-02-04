import { Box, Flex, Link, Text, VStack } from "@chakra-ui/react";
import { Logo } from "../assets/logo/Logo";
import image from "../assets/logo/logo.png"

export const Navbar = ({ children }) => {
  const menuItems = [
    { name: "Home", path: "/home" },
    { name: "Events", path: "/events" },
    { name: "Invoices", path: "/invoices" },
    { name: "Settings", path: "/settings" },
    {
      name: "Google Calendar",
      path: "/calendar",
      external: true,
    },
  ];

  return (
    <div style={{
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
    }}
    >
    <Box
      w="64"
      bg="white"
      boxShadow="lg"
      h="100vh"
    >
      {/* Logo Section */}
      <Flex
        justify="center"
        p={6}
      >
        <Logo/>
          <Text
            fontSize="xl"
            fontWeight="semibold"
          >
          </Text>
      </Flex>

      {/* Navigation Links */}
      <VStack
        spacing={2}
        align="stretch"
        px={4}
      >
        {menuItems.map((item) => (
          <Link
            key={item.name}
            href={item.path}
            display="flex"
            alignItems="center"
            px={4}
            py={3}
            color={item.name === "Invoices" ? "#4E4AE7": "gray.700"}
            _hover={{ bg: "gray.100" }}
            rounded="lg"
          >
            <Text>{item.name}</Text>
          </Link>
        ))}
      </VStack>
    </Box>
    {children}
    </div>
  );
};

export default Navbar;
