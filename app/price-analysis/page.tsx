'use client'
import PriceAnalysis from '../components/PriceAnalysis';

export default function PriceAnalysisPage() {
  return <PriceAnalysis />;
}




//'use client'

// import { useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { useAccount } from 'wagmi';
// import PriceAnalysis from '../components/PriceAnalysis';

// export default function PriceAnalysisPage() {
//   const router = useRouter();
//   const { isConnected } = useAccount();

//   useEffect(() => {
//     if (!isConnected) {
//       router.push('/PriceAnalysis');
//     }
//   }, [isConnected, router]);

//   if (!isConnected) {
//     return null; // or a loading state
//   }

//   return <PriceAnalysis />;
// }


