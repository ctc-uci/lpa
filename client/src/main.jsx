import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { ChakraProvider, extendTheme } from "@chakra-ui/react";

import App from "./App.jsx";

const colors = {
  brand: {},
};

const theme = extendTheme({ colors });

// For TSX
// createRoot(document.getElementById("root")!).render(
//   <StrictMode>
//     <ChakraProvider theme={theme}>
//       <App />
//     </ChakraProvider>
//   </StrictMode>
// );

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
