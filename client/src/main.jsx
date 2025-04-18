import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { ChakraProvider, extendTheme } from "@chakra-ui/react";

import App from "./App.jsx";

const colors = {
  brand: {},
};

const theme = extendTheme({ colors });

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <StrictMode>
      <ChakraProvider theme={theme}>
        <App />
      </ChakraProvider>
    </StrictMode>
  );
}
