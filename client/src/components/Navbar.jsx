import { Box, Flex, Link, Text, VStack } from "@chakra-ui/react";

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
    >
      {/* Logo Section */}
      <Flex
        justify="center"
        p={6}
      >
        <Flex
          w="16"
          h="16"
          rounded="full"
          border="2px"
          borderColor="gray.300"
          align="center"
          justify="center"
        >
          <Text
            fontSize="xl"
            fontWeight="semibold"
          >
            LPA
          </Text>
        </Flex>
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
            color="gray.700"
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