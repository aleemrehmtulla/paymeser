import { ChakraProvider } from "@chakra-ui/react";
import "../styles/globals.css";

import { ChainId, ThirdwebProvider } from "@thirdweb-dev/react";

function MyApp({ Component, pageProps }) {
  return (
    <ChakraProvider>
      <ThirdwebProvider desiredChainId={ChainId.Mainnet}>
        <Component {...pageProps} />
      </ThirdwebProvider>
    </ChakraProvider>
  );
}

export default MyApp;
