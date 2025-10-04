import { useAAWallet } from '../hooks/useAAWallet';
import { useState } from 'react';
import { AAWalletModal } from './AAWalletModal';
import { ChevronDown } from 'lucide-react';
import Image from 'next/image';
import { useAccount } from 'wagmi';

interface AAWalletDisplayProps {
  arbiusLogoSrc?: string;
}

export function AAWalletDisplay({ arbiusLogoSrc }: AAWalletDisplayProps) {
  const { isConnected } = useAccount();
  const { smartAccountAddress, isInitializing, initializeWallet, error } = useAAWallet();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClick = async () => {
    if (smartAccountAddress) {
      // Already initialized, open modal
      setIsModalOpen(true);
    } else if (!isInitializing) {
      // Not initialized, trigger initialization
      try {
        await initializeWallet();
        // After successful initialization, open modal
        setIsModalOpen(true);
      } catch (err) {
        // Error is already handled in the hook
        console.error('Failed to initialize wallet:', err);
      }
    }
  };

  // Don't show anything if wallet is not connected
  if (!isConnected) {
    return null;
  }

  if (isInitializing) {
    return (
      <div className="text-base text-gray-900 px-4 py-2 bg-white rounded-xl shadow-sm h-10 flex items-center font-[family-name:var(--font-family-fredoka)] font-medium">
        Initializing...
      </div>
    );
  }

  // Show activation button if not initialized
  if (!smartAccountAddress) {
    return (
      <button
        onClick={handleClick}
        className="text-sm text-gray-700 font-[family-name:var(--font-family-fredoka)] font-medium bg-white rounded-xl px-3 py-2 shadow-sm h-10 flex items-center gap-2 hover:scale-105 transition-all cursor-pointer"
        title="Activate Arbius Wallet"
      >
        {arbiusLogoSrc && (
          <Image src={arbiusLogoSrc} alt="Arbius" className="h-6 w-6 rounded-full opacity-50" width={24} height={24} />
        )}
        <span className="hidden md:inline">Arbius Wallet</span>
        <span className="md:hidden">Arbius</span>
      </button>
    );
  }

  // Show wallet address if initialized
  return (
    <>
      <button
        onClick={handleClick}
        className="text-base text-gray-700 font-[family-name:var(--font-family-fredoka)] font-bold bg-white rounded-xl px-3 py-2 shadow-sm h-10 flex items-center gap-2 hover:scale-105 transition-all cursor-pointer"
      >
        {arbiusLogoSrc && (
          <Image src={arbiusLogoSrc} alt="Arbius" className="h-6 w-6 rounded-full" width={24} height={24} />
        )}
        <span className="hidden md:inline">
          0x{smartAccountAddress.slice(2, 4)}...{smartAccountAddress.slice(-4)}
        </span>
        <ChevronDown className="h-5 w-5 -ml-1" strokeWidth={2.5} />
      </button>

      <AAWalletModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        smartAccountAddress={smartAccountAddress}
      />
    </>
  );
}
