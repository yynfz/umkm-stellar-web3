import type { Metadata } from "next";
import { WalletContextProvider } from "@/context/WalletContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "umkm-stellar-web3 — Fund Indonesian UMKM on Stellar",
  description:
    "A Stellar Testnet dApp that lets you connect a Freighter wallet, check your XLM balance, and send micro-contributions to Indonesian UMKM campaigns with transparent, on-chain tracking.",
  keywords: [
    "Stellar",
    "UMKM",
    "MSME",
    "Indonesia",
    "Web3",
    "dApp",
    "Freighter",
    "XLM",
    "micro-investment",
  ],
  openGraph: {
    title: "umkm-stellar-web3 — Fund Indonesian UMKM on Stellar",
    description:
      "Connect your Stellar wallet and support Indonesian UMKM through transparent, on-chain micro-contributions.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <WalletContextProvider>{children}</WalletContextProvider>
      </body>
    </html>
  );
}
