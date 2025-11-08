'use client';

import Link from 'next/link';
import { TooltipButton } from '@/components/TooltipButton';
import { formatTokenNameAndAmount, tokenIcon } from '@/lib/utils';
import type { Service } from '@/hooks/subsquid/useService';
import {
  PiCoin,
  PiTimer,
  PiInfo,
  PiPackage,
  PiShieldCheck,
  PiWarning,
} from 'react-icons/pi';
import { ShoppingCart, AlertCircle, CheckCircle2, Pause } from 'lucide-react';
import { useState, useCallback, useRef, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { SERVICE_MARKETPLACE_V1_ABI } from '@effectiveacceleration/contracts/wagmi/ServiceMarketplaceV1';
import { useConfig } from '@/hooks/useConfig';
import { toast } from 'sonner';
import { parseUnits, erc20Abi } from 'viem';
import useUser from '@/hooks/subsquid/useUser';

type ServiceSidebarProps = {
  service: Service;
  address: `0x${string}` | undefined;
  isOwner: boolean;
};

export default function ServiceSidebar({
  service,
  address,
  isOwner,
}: ServiceSidebarProps) {
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [requirements, setRequirements] = useState('');
  const [showRequirementsModal, setShowRequirementsModal] = useState(false);
  const { data: user } = useUser(address || '');
  const Config = useConfig();

  const contractLoadingToastIdRef = useRef<string | number | null>(null);

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  // Dismiss loading toast and show success/error
  const dismissLoadingToast = useCallback(() => {
    if (contractLoadingToastIdRef.current !== null) {
      toast.dismiss(contractLoadingToastIdRef.current);
      contractLoadingToastIdRef.current = null;
    }
  }, []);

  const showSuccess = useCallback(
    (message: string) => {
      dismissLoadingToast();
      toast.success(message);
    },
    [dismissLoadingToast]
  );

  const showError = useCallback(
    (message: string) => {
      dismissLoadingToast();
      toast.error(message);
    },
    [dismissLoadingToast]
  );

  const showLoading = useCallback((message: string) => {
    contractLoadingToastIdRef.current = toast.loading(message);
  }, []);

  // Handle transaction confirmation
  useEffect(() => {
    if (isConfirmed) {
      showSuccess('Service purchased successfully! Your order has been created.');
      setIsPurchasing(false);
      setRequirements('');
      setShowRequirementsModal(false);
    }
  }, [isConfirmed, showSuccess]);

  // Enhanced section component with gradient backgrounds
  const InfoSection = ({
    title,
    icon: Icon,
    children,
    className = '',
    variant = 'default',
  }: {
    title?: string;
    icon?: any;
    children: React.ReactNode;
    className?: string;
    variant?: 'default' | 'highlight' | 'warning' | 'success';
  }) => {
    const variantStyles = {
      default: 'bg-white dark:bg-gray-900/50',
      highlight:
        'bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20',
      warning:
        'bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20',
      success:
        'bg-gradient-to-br from-emerald-50/50 to-green-50/50 dark:from-emerald-950/20 dark:to-green-950/20',
    };

    return (
      <div
        className={`relative overflow-hidden ${variantStyles[variant]} border-b border-gray-100 p-6 transition-all duration-200 hover:shadow-lg hover:shadow-black/5 dark:border-gray-800 dark:hover:shadow-black/20 ${className}`}
      >
        {/* Decorative gradient overlay */}
        <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 transition-opacity duration-300 hover:opacity-100' />

        <div className='relative'>
          {title && (
            <div className='mb-4 flex items-center gap-2'>
              {Icon && (
                <div className='rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/10 p-2 dark:from-green-500/20 dark:to-emerald-500/20'>
                  <Icon className='h-4 w-4 text-green-600 dark:text-green-400' />
                </div>
              )}
              <h3 className='text-base font-semibold text-gray-900 dark:text-white'>
                {title}
              </h3>
            </div>
          )}
          {children}
        </div>
      </div>
    );
  };

  // Enhanced detail row with better styling
  const DetailRow = ({
    label,
    value,
    icon: Icon,
    highlighted = false,
  }: {
    label: string;
    value: React.ReactNode;
    icon?: React.ElementType;
    highlighted?: boolean;
  }) => (
    <div
      className={`-mx-3 flex items-center justify-between rounded-lg px-3 py-3 transition-all duration-200 ${highlighted ? 'bg-green-50/50 dark:bg-green-950/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
    >
      <span className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400'>
        {Icon && <Icon className='h-4 w-4 text-gray-400 dark:text-gray-500' />}
        {label}
      </span>
      <div className='flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-gray-100'>
        {value}
      </div>
    </div>
  );

  // Format delivery time
  const formatDeliveryTime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    if (days === 1) return '1 day delivery';
    if (days > 1) return `${days} days delivery`;
    const hours = Math.floor(seconds / 3600);
    if (hours === 1) return '1 hour delivery';
    if (hours > 1) return `${hours} hours delivery`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes} minutes delivery`;
  };

  // Get service state badge
  const getServiceStateBadge = () => {
    switch (service.state) {
      case 0: // Active
        return (
          <div className='flex items-center gap-2 rounded-lg bg-green-100 px-3 py-2 dark:bg-green-900/30'>
            <CheckCircle2 className='h-4 w-4 text-green-600 dark:text-green-400' />
            <span className='text-sm font-medium text-green-700 dark:text-green-300'>
              Available
            </span>
          </div>
        );
      case 1: // Paused
        return (
          <div className='flex items-center gap-2 rounded-lg bg-amber-100 px-3 py-2 dark:bg-amber-900/30'>
            <Pause className='h-4 w-4 text-amber-600 dark:text-amber-400' />
            <span className='text-sm font-medium text-amber-700 dark:text-amber-300'>
              Paused
            </span>
          </div>
        );
      case 2: // Deleted
        return (
          <div className='flex items-center gap-2 rounded-lg bg-red-100 px-3 py-2 dark:bg-red-900/30'>
            <AlertCircle className='h-4 w-4 text-red-600 dark:text-red-400' />
            <span className='text-sm font-medium text-red-700 dark:text-red-300'>
              Unavailable
            </span>
          </div>
        );
      default:
        return null;
    }
  };

  // Handle purchase
  const handlePurchaseClick = () => {
    if (!address) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!user) {
      toast.error('Please register your account first');
      return;
    }

    if (isOwner) {
      toast.error("You can't purchase your own service");
      return;
    }

    if (service.state !== 0) {
      toast.error('This service is not available');
      return;
    }

    setShowRequirementsModal(true);
  };

  const handlePurchaseConfirm = async () => {
    if (!requirements.trim()) {
      toast.error('Please provide requirements for this service');
      return;
    }

    try {
      setIsPurchasing(true);
      showLoading('Preparing purchase transaction...');

      // First, approve the token transfer
      const tokenAddress = service.paymentToken as `0x${string}`;
      const serviceMarketplaceAddress = (Config as any)?.serviceMarketplaceAddress as `0x${string}`;

      // Check allowance first
      showLoading('Checking token allowance...');

      // Request token approval
      showLoading('Requesting token approval...');
      writeContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'approve',
        args: [serviceMarketplaceAddress, service.price],
      });

      // Wait a bit for approval to process
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Now purchase the service
      showLoading('Purchasing service...');
      writeContract({
        address: serviceMarketplaceAddress,
        abi: SERVICE_MARKETPLACE_V1_ABI,
        functionName: 'purchaseService',
        args: [BigInt(service.id), requirements],
      });
    } catch (error: any) {
      console.error('Purchase error:', error);
      showError(error.message || 'Failed to purchase service');
      setIsPurchasing(false);
    }
  };

  return (
    <>
      <div className='overflow-hidden rounded-xl bg-white shadow-xl dark:bg-gray-900 dark:shadow-2xl dark:shadow-black/20'>
        {/* Service Status */}
        <InfoSection variant={service.state === 0 ? 'highlight' : 'warning'}>
          {getServiceStateBadge()}
        </InfoSection>

        {/* Price Section */}
        <InfoSection title='Price' icon={PiCoin} variant='highlight'>
          <div className='rounded-lg bg-gradient-to-br from-green-100 to-emerald-100 p-4 dark:from-green-900/30 dark:to-emerald-900/30'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <img
                  src={tokenIcon(service.paymentToken)}
                  alt='Token'
                  className='h-8 w-8 rounded-full'
                />
                <div>
                  <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                    {formatTokenNameAndAmount(
                      service.paymentToken,
                      service.price
                    ).split(' ')[0]}
                  </p>
                  <p className='text-sm text-gray-600 dark:text-gray-400'>
                    {formatTokenNameAndAmount(
                      service.paymentToken,
                      service.price
                    ).split(' ')[1]}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </InfoSection>

        {/* Service Details */}
        <InfoSection title='Service Details' icon={PiInfo}>
          <div className='space-y-1'>
            <DetailRow
              label='Delivery Time'
              value={formatDeliveryTime(service.deliveryTime)}
              icon={PiTimer}
            />
            <DetailRow
              label='Total Orders'
              value={service.totalOrders}
              icon={PiPackage}
            />
            <DetailRow
              label='Completed'
              value={service.completedOrders}
              icon={CheckCircle2}
            />
            {service.arbitrator !== '0x0000000000000000000000000000000000000000' && (
              <DetailRow
                label='Arbitrator'
                value={
                  <Link
                    href={`/profile/${service.arbitrator}`}
                    className='text-green-600 hover:underline dark:text-green-400'
                  >
                    {service.arbitrator.slice(0, 6)}...
                    {service.arbitrator.slice(-4)}
                  </Link>
                }
                icon={PiShieldCheck}
              />
            )}
          </div>
        </InfoSection>

        {/* Purchase Button */}
        <div className='p-6'>
          {isOwner ? (
            <div className='rounded-lg bg-amber-50 p-4 text-center dark:bg-amber-900/20'>
              <p className='text-sm text-amber-700 dark:text-amber-300'>
                This is your service
              </p>
            </div>
          ) : service.state !== 0 ? (
            <div className='rounded-lg bg-red-50 p-4 text-center dark:bg-red-900/20'>
              <p className='text-sm text-red-700 dark:text-red-300'>
                This service is not available
              </p>
            </div>
          ) : !address ? (
            <div className='rounded-lg bg-blue-50 p-4 text-center dark:bg-blue-900/20'>
              <p className='text-sm text-blue-700 dark:text-blue-300'>
                Connect wallet to purchase
              </p>
            </div>
          ) : (
            <button
              onClick={handlePurchaseClick}
              disabled={isPurchasing || isPending || isConfirming}
              className='group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-4 font-semibold text-white shadow-lg shadow-green-500/25 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-green-500/40 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100'
            >
              <div className='absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100' />
              <div className='relative flex items-center justify-center gap-2'>
                <ShoppingCart className='h-5 w-5' />
                <span>
                  {isPurchasing || isPending || isConfirming
                    ? 'Processing...'
                    : 'Purchase Service'}
                </span>
              </div>
            </button>
          )}
        </div>

        {/* Warning for buyers */}
        {!isOwner && service.state === 0 && address && (
          <div className='border-t border-gray-100 p-4 dark:border-gray-800'>
            <div className='flex items-start gap-2 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20'>
              <PiWarning className='mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600 dark:text-blue-400' />
              <p className='text-xs text-blue-700 dark:text-blue-300'>
                Payment will be held in escrow until you approve the delivered work
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Requirements Modal */}
      {showRequirementsModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
          <div className='w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-800'>
            <h3 className='mb-4 text-xl font-semibold text-gray-900 dark:text-white'>
              Provide Service Requirements
            </h3>
            <p className='mb-4 text-sm text-gray-600 dark:text-gray-400'>
              Please describe your requirements for this service. Be as detailed as
              possible to help the seller understand what you need.
            </p>
            <textarea
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder='Enter your requirements here...'
              className='mb-4 h-40 w-full rounded-lg border border-gray-300 p-3 text-sm text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-green-400'
            />
            <div className='flex gap-3'>
              <button
                onClick={() => {
                  setShowRequirementsModal(false);
                  setRequirements('');
                  setIsPurchasing(false);
                }}
                className='flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
              >
                Cancel
              </button>
              <button
                onClick={handlePurchaseConfirm}
                disabled={!requirements.trim() || isPurchasing}
                className='flex-1 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2 font-medium text-white shadow-lg shadow-green-500/25 transition-all hover:shadow-xl hover:shadow-green-500/40 disabled:cursor-not-allowed disabled:opacity-50'
              >
                {isPurchasing ? 'Processing...' : 'Confirm Purchase'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
