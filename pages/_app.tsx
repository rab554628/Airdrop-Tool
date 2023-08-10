import type { AppProps } from "next/app";
import { ThirdwebProvider } from "@thirdweb-dev/react";
import "../styles/globals.css";
import { Mumbai } from "@thirdweb-dev/chains"
import { Navbar } from "../components/Navbar/Navbar";

// This is the chainId your dApp will work on.
const activeChain = 137;

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThirdwebProvider activeChain={activeChain}
      clientId={process.env.THIRDWEB_CLIENTID}
    >
      <Navbar />
      <Component {...pageProps} />
    </ThirdwebProvider>
  );
}

export default MyApp;
