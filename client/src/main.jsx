import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { ChakraProvider, extendTheme } from "@chakra-ui/react";

import App from "./App.jsx";

const colors = {
  brand: {},
};

// Custom scrollbar LOL (Feel free to remove/edit though, just added cuz I noticed ygs still had default)
const theme = extendTheme({
  colors,
  styles: {
    global: {
      "&::-webkit-scrollbar": {
        WebkitAppearance: "none",
        width: "5px",
      },
      "&::-webkit-scrollbar-thumb": {
        borderRadius: "5px",
        backgroundColor: "blackAlpha.500",
        WebkitBoxShadow: "0 0 1px whiteAlpha.500",
      },
      "&::-webkit-scrollbar-thumb:hover": {
        borderRadius: "5px",
        opacity: 0.5,
      },
    },
  },
});

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(
    <StrictMode>
      <ChakraProvider theme={theme}>
        <App />
      </ChakraProvider>
    </StrictMode>
  );
}
