"use client"
 
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { base } from 'viem/chains';
import { type ReactNode, useState } from 'react';
import { WagmiProvider } from 'wagmi';
import { config } from '../wagmi';

export function Providers({ 
  children 
}: {
  children: ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient());
 
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider
          apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
          chain={{
            id: base.id,
            name: base.name,
            rpcUrls: base.rpcUrls,
            nativeCurrency: base.nativeCurrency,
            blockExplorers: base.blockExplorers
          }}
        >
          {children}
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}