'use client'

import { ConnectWallet, Wallet, WalletDropdown, WalletDropdownDisconnect } from '@coinbase/onchainkit/wallet';
import { useAccount, useDisconnect, useBalance, useToken } from 'wagmi';
import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link'; // Add this import
import { useRouter } from 'next/navigation';

// Common Base tokens with their addresses
const COMMON_BASE_TOKENS = [
  { address: '0x4200000000000000000000000000000000000006', symbol: 'WETH' },
  { address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', symbol: 'USDC' },
  { address: '0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22', symbol: 'cbETH' },
  { address: '0x78a087d713Be963Bf307b18F2Ff8122EF9A63ae9', symbol: 'USDT' },
  { address: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb', symbol: 'DAI' },
  { address: '0x27d2DECb4bFC9C76F0309b8E88dec3a601Fe25a8', symbol: 'COMP' },
  { address: '0xaD67fE66660Fb8dFE9d6b1b4240d8650e30F6019', symbol: 'BAL' },
  { address: '0xCFD1D50ce23C46D3Cf6407487B2F8934e96DC8f9', symbol: 'LINK' },
  { address: '0x940181a94A35A4569E4529A3CDfB74e38FD98631', symbol: 'AAVE' },
];

interface TokenBalance {
  symbol: string;
  balance: string;
  address: string;
  valueUSD?: number;
}

export default function WalletScreen(): ReactNode {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [topTokens, setTopTokens] = useState<TokenBalance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0); // Add this for manual refresh
  const router = useRouter();

  // Get native ETH balance
  const { data: ethBalance, isLoading: ethLoading } = useBalance({
    address: address,
  });

  // Get token balances for all common tokens
  const tokenResults = COMMON_BASE_TOKENS.map(token => ({
    balance: useBalance({
      address: address,
      token: token.address as `0x${string}`,
    }),
    tokenInfo: useToken({
      address: token.address as `0x${string}`,
    }),
    symbol: token.symbol,
    address: token.address
  }));

  const handleRefresh = () => {
    setIsLoading(true);
    setRefreshKey(prev => prev + 1); // This will trigger the effect to run again
  };
  
  // Update token balances and sort by value
  useEffect(() => {
    if (!isConnected || !address) {
      setTopTokens([]);
      setIsLoading(false);
      return;
    }

    const balances: TokenBalance[] = [];

    // Add ETH balance if available
    if (ethBalance) {
      balances.push({
        symbol: 'ETH',
        balance: ethBalance.formatted,
        address: 'native',
        valueUSD: parseFloat(ethBalance.formatted) * 3500 // Example price, you'd want to fetch real price
      });
    }

    // Add token balances
    tokenResults.forEach(result => {
      if (result.balance.data && parseFloat(result.balance.data.formatted) > 0) {
        const balance = result.balance.data.formatted;
        // Example prices - in production you'd fetch these from an API
        const mockPrices: { [key: string]: number } = {
          'WETH': 3500,
          'USDC': 1,
          'cbETH': 3600,
          'USDT': 1,
          'DAI': 1,
          'COMP': 50,
          'BAL': 15,
          'LINK': 20,
          'AAVE': 100
        };

        balances.push({
          symbol: result.symbol,
          balance: balance,
          address: result.address,
          valueUSD: parseFloat(balance) * (mockPrices[result.symbol] || 0)
        });
      }
    });

    // Sort by value and take top 5
    const sortedBalances = balances
      .filter(token => (token.valueUSD || 0) > 0)
      .sort((a, b) => ((b.valueUSD || 0) - (a.valueUSD || 0)))
      .slice(0, 5);

    setTopTokens(sortedBalances);
    setIsLoading(false);
  }, [isConnected, address, ethBalance, tokenResults, refreshKey]);



  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Navigation Section */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <div className="flex justify-end">
          <button 
            onClick={() => window.location.href = '/price-analysis'}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            View Price Analysis →
          </button>
        </div>
      </div>

      {/* Wallet Connection UI */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-3">Wallet Status</h3>
        
        {!isConnected ? (
          <ConnectWallet />
        ) : (
          <div className="space-y-4">
            <Wallet>
              <WalletDropdown>
                <div className="p-2">
                  <p className="text-sm mb-2">Connected Address:</p>
                  <p className="font-mono text-xs break-all">{address}</p>
                  <WalletDropdownDisconnect className="mt-4" />
                </div>
              </WalletDropdown>
            </Wallet>
            
            <div className="flex gap-2">
              <button 
                onClick={() => disconnect()}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
              >
                Force Disconnect
              </button>
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
              >
                {isLoading ? 'Refreshing...' : 'Refresh Balances'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Top Tokens Section */}
      {isConnected && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Top 5 Tokens</h3>
          </div>

          {isLoading ? (
            <div className="text-center py-4">Loading wallet contents...</div>
          ) : topTokens.length > 0 ? (
            <div className="space-y-3">
              {topTokens.map((token) => (
                <div 
                  key={token.address}
                  className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded"
                >
                  <div>
                    <span className="font-medium">{token.symbol}</span>
                    {token.address !== 'native' && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {token.address.slice(0, 6)}...{token.address.slice(-4)}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-mono">{parseFloat(token.balance).toFixed(6)}</p>
                    {token.valueUSD && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        ≈ ${token.valueUSD.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              No tokens found in wallet
            </div>
          )}
        </div>
      )}

      {/* Connection Status */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">Connection Status</h3>
        <p className="text-sm">
          {isConnected 
            ? '✅ Wallet Connected' 
            : '❌ No Wallet Connected'}
        </p>
      </div>
    </div>
  );
}