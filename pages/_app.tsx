import type { AppProps } from "next/app";
import { ThirdwebProvider } from "@thirdweb-dev/react";
import "../styles/globals.css";
import { Ethereum } from "@thirdweb-dev/chains"
import { Navbar } from "../components/Navbar/Navbar";


function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThirdwebProvider activeChain={Ethereum}
      clientId={process.env.THIRDWEB_CLIENTID}
    >
      <Navbar />
      <Component {...pageProps} />
    </ThirdwebProvider>
  );
}

export default MyApp;
