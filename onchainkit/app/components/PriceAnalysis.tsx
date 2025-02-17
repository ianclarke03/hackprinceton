'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';

interface TokenPrice {
  symbol: string;
  currentPrice: number;
  averagePrice: number;
  priceChange24h: number;
  lastUpdate: string;
  buySignal: 'STRONG_BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG_SELL';
}

export default function PriceAnalysis() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [tokens, setTokens] = useState<TokenPrice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'24h' | '7d' | '30d'>('24h');

  const mockTokens: TokenPrice[] = [
    {
      symbol: 'ETH',
      currentPrice: 3184.00,
      averagePrice: 2720.00,
      priceChange24h: +17.06, // (3184 - 2720) / 2720 * 100
      lastUpdate: new Date().toISOString(),
      buySignal: 'STRONG_BUY' // Significant increase over 15%
    },
    {
      symbol: 'USDC',
      currentPrice: 1.00,
      averagePrice: 1.00,
      priceChange24h: 0, // (1 - 1) / 1 * 100
      lastUpdate: new Date().toISOString(),
      buySignal: 'NEUTRAL' // Stable stablecoin
    },
    {
      symbol: 'BTC',
      currentPrice: 79228.00,
      averagePrice: 76550.00,
      priceChange24h: +3.50, // (79228 - 76550) / 76550 * 100
      lastUpdate: new Date().toISOString(),
      buySignal: 'BUY' // Moderate positive increase
    },
    {
      symbol: 'SOL',
      currentPrice: 206.00,
      averagePrice: 209.00,
      priceChange24h: -1.44, // (206 - 209) / 209 * 100
      lastUpdate: new Date().toISOString(),
      buySignal: 'SELL' // Price decrease
    },
    {
      symbol: 'LINK',
      currentPrice: 13.50,
      averagePrice: 16.80,
      priceChange24h: -19.64, // (13.50 - 16.80) / 16.80 * 100
      lastUpdate: new Date().toISOString(),
      buySignal: 'STRONG_SELL' // Significant decrease over 15%
    }
    // Add more tokens as needed
  ];

  useEffect(() => {
    // Simulate API call
    setIsLoading(true);
    setTimeout(() => {
      setTokens(mockTokens);
      setIsLoading(false);
    }, 1000);
  }, [selectedTimeframe]);

  const getBuySignalColor = (signal: TokenPrice['buySignal']) => {
    const colors = {
      STRONG_BUY: 'bg-green-100 text-green-800',
      BUY: 'bg-green-50 text-green-600',
      NEUTRAL: 'bg-gray-100 text-gray-600',
      SELL: 'bg-red-50 text-red-600',
      STRONG_SELL: 'bg-red-100 text-red-800'
    };
    return colors[signal];
  };


  if (!isConnected) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg p-6 max-w-sm mx-4 shadow-xl transform transition-all animate-fadeIn">
          <div className="flex flex-col items-center">
            <div className="mb-4 text-3xl">🔒</div>
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              Wallet Connection Required
            </h3>
            <div className="mb-4 text-sm text-gray-500 text-center">
              Connect your wallet to view price analysis
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                router.push('/');
              }}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors duration-200"
            >
              Connect Wallet
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 bg-gray-100">
      {/* Header with Navigation */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Price Analysis</h1>
        <button 
          onClick={(e) => {
            e.preventDefault();
            router.push('/');
          }}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Back to Wallet
        </button>
      </div>

      {/* Timeframe Selector */}
      <div className="mb-6">
        <div className="inline-flex rounded-md shadow-sm" role="group">
          {(['24h', '7d', '30d'] as const).map((timeframe) => (
            <button
              key={timeframe}
              onClick={() => setSelectedTimeframe(timeframe)}
              className={`px-4 py-2 text-sm font-medium border ${
                selectedTimeframe === timeframe
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } ${
                timeframe === '24h' ? 'rounded-l-lg' : ''
              } ${
                timeframe === '30d' ? 'rounded-r-lg' : ''
              }`}
            >
              {timeframe}
            </button>
          ))}
        </div>
      </div>

      {/* Price Analysis Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Token
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Current Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Avg Price ({selectedTimeframe})
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Change
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Signal
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  Loading price data...
                </td>
              </tr>
            ) : (
              tokens.map((token) => (
                <tr key={token.symbol} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{token.symbol}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                    ${token.currentPrice.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                    ${token.averagePrice.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={token.priceChange24h >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {token.priceChange24h >= 0 ? '+' : ''}{token.priceChange24h}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getBuySignalColor(token.buySignal)}`}>
                      {token.buySignal.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}