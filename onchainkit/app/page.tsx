'use client'

import { Avatar, Identity, Name, Badge, Address } from '@coinbase/onchainkit/identity';
import { useAccount } from 'wagmi';
import Image from "next/image";
import WalletScreen from './components/WalletScreen';

export default function Home() {
  const { address, isConnected } = useAccount();

  // Add console logs to debug
  console.log('Wallet Status:', {
    isConnected,
    address,
    timestamp: new Date().toISOString()
  });

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        
        {/* Wallet Section */}
        <div className="flex flex-col items-center gap-4 w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Wallet Dashboard</h2>
          <WalletScreen />
        </div>

        {/* Identity Section */}
        <div className="flex flex-col items-center gap-4 w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Onchain Identity</h2>
          {isConnected && address ? (
            <>
              <div className="text-xs text-gray-500 mb-4 p-2 bg-gray-100 dark:bg-gray-700 rounded w-full">
                <div>Connected Address: {address}</div>
              </div>
              
              <Identity
                address={address}
                schemaId="0xfb65c79f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0de9"
              >
                <div className="flex flex-col items-center gap-3">
                  <Avatar className="w-24 h-24" />
                  <div className="flex items-center gap-2">
                    <Name className="text-lg font-medium" />
                    <Badge className="ml-2" />
                  </div>
                  <Address className="text-sm text-gray-600 dark:text-gray-400" />
                </div>
              </Identity>
            </>
          ) : (
            <div className="text-center text-gray-500">
              Connect your wallet to view your onchain identity
            </div>
          )}
        </div>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
            href="https://vercel.com/new"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={20}
              height={20}
            />
            Deploy now
          </a>
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44"
            href="https://docs.base.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Base Docs
          </a>
        </div>
      </main>

      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://docs.base.org/building-with-base/guides"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Base Guides
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://docs.base.org/base-camp/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Base Camp
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://base.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to base.org →
        </a>
      </footer>
    </div>
  );
}