import { useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { type Hex, type PrivateKeyAccount } from 'viem';
import { AAWalletContext } from '../components/AAWalletProvider';
import { initDeterministicWallet, getCachedWalletAddress, getCachedWallet } from '../utils/viemWalletUtils';

export function useAAWallet() {
  const context = useContext(AAWalletContext);
  const { address: connectedAddress } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const [smartAccountAddress, setSmartAccountAddress] = useState<string | null>(null);
  const [derivedAccount, setDerivedAccount] = useState<PrivateKeyAccount | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initializingRef = useRef(false);
  const initializedForAddress = useRef<string | null>(null);

  // Check for cached wallet on mount/address change
  useEffect(() => {
    if (!connectedAddress) {
      // Clear state when disconnected
      setSmartAccountAddress(null);
      setDerivedAccount(null);
      initializedForAddress.current = null;
      return;
    }

    // Only load from cache, don't auto-initialize
    const cachedAddress = getCachedWalletAddress(connectedAddress);
    if (cachedAddress) {
      const cachedAccount = getCachedWallet(cachedAddress);
      if (cachedAccount) {
        setSmartAccountAddress(cachedAddress);
        setDerivedAccount(cachedAccount);
        initializedForAddress.current = connectedAddress;
      }
    }
  }, [connectedAddress]);

  const signMessageWithAAWallet = useCallback(async (message: string): Promise<Hex | null> => {
    if (!derivedAccount) {
      return null;
    }

    try {
      const signature = await derivedAccount.signMessage({ message });
      return signature;
    } catch (err) {
      console.error('Failed to sign message:', err instanceof Error ? err.message : 'Unknown error');
      return null;
    }
  }, [derivedAccount]);

  const estimateGas = useCallback(async (to: `0x${string}`, data: `0x${string}`, value: bigint = BigInt(0)): Promise<bigint | null> => {
    if (!smartAccountAddress || !publicClient) {
      return null;
    }

    try {
      const gasEstimate = await publicClient.estimateGas({
        account: smartAccountAddress as `0x${string}`,
        to,
        data,
        value,
      });
      return gasEstimate;
    } catch (err) {
      console.error('Failed to estimate gas:', err instanceof Error ? err.message : 'Unknown error');
      return null;
    }
  }, [smartAccountAddress, publicClient]);

  const initializeWallet = useCallback(async (): Promise<void> => {
    if (!connectedAddress || !walletClient) {
      throw new Error('Wallet not connected');
    }

    // Prevent multiple simultaneous initializations
    if (initializingRef.current) {
      throw new Error('Initialization already in progress');
    }

    // Check if already initialized for this address
    if (initializedForAddress.current === connectedAddress && derivedAccount) {
      return;
    }

    initializingRef.current = true;
    setIsInitializing(true);
    setError(null);

    try {
      const signMessage = async (message: string): Promise<Hex> => {
        const signature = await walletClient.signMessage({
          account: connectedAddress,
          message
        });
        return signature;
      };

      const account = await initDeterministicWallet(connectedAddress, signMessage);
      setDerivedAccount(account);
      setSmartAccountAddress(account.address);
      initializedForAddress.current = connectedAddress;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize AA wallet';
      setError(errorMessage);
      throw err;
    } finally {
      setIsInitializing(false);
      initializingRef.current = false;
    }
  }, [connectedAddress, walletClient, derivedAccount]);

  return {
    ...context,
    smartAccountAddress,
    derivedAccount,
    signMessageWithAAWallet,
    estimateGas,
    isInitializing,
    error,
    initializeWallet,
  };
}
