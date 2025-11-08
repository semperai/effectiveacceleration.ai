'use client';

import { formatTokenNameAndAmount, tokenIcon } from '@/lib/utils';
import type { ServiceOrder } from '@/hooks/subsquid/useServiceOrder';
import type { Service } from '@/hooks/subsquid/useService';
import {
  PiCoin,
  PiTimer,
  PiInfo,
  PiPackage,
  PiWarning,
} from 'react-icons/pi';
import { Play, Package, CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useState, useCallback, useRef, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { SERVICE_MARKETPLACE_V1_ABI } from '@effectiveacceleration/contracts/wagmi/ServiceMarketplaceV1';
import { useConfig } from '@/hooks/useConfig';
import { toast } from 'sonner';
import moment from 'moment';

type OrderSidebarProps = {
  order: ServiceOrder;
  service: Service | undefined;
  address: `0x${string}` | undefined;
  isBuyer: boolean;
  isSeller: boolean;
};

export default function OrderSidebar({
  order,
  service,
  address,
  isBuyer,
  isSeller,
}: OrderSidebarProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [deliveryResult, setDeliveryResult] = useState('');
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const Config = useConfig();

  const contractLoadingToastIdRef = useRef<string | number | null>(null);

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  // Toast helpers
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
      showSuccess('Transaction completed successfully!');
      setIsProcessing(false);
      setDeliveryResult('');
      setShowDeliveryModal(false);
    }
  }, [isConfirmed, showSuccess]);

  // InfoSection component
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

  // DetailRow component
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
    if (days === 1) return '1 day';
    if (days > 1) return `${days} days`;
    const hours = Math.floor(seconds / 3600);
    if (hours === 1) return '1 hour';
    if (hours > 1) return `${hours} hours`;
    return `${Math.floor(seconds / 60)} minutes`;
  };

  // Action handlers
  const handleStartOrder = async () => {
    try {
      setIsProcessing(true);
      showLoading('Starting order...');

      writeContract({
        address: (Config as any)?.serviceMarketplaceAddress as `0x${string}`,
        abi: SERVICE_MARKETPLACE_V1_ABI,
        functionName: 'startOrder',
        args: [BigInt(order.id)],
      });
    } catch (error: any) {
      console.error('Start order error:', error);
      showError(error.message || 'Failed to start order');
      setIsProcessing(false);
    }
  };

  const handleDeliverClick = () => {
    setShowDeliveryModal(true);
  };

  const handleDeliverConfirm = async () => {
    if (!deliveryResult.trim()) {
      toast.error('Please provide delivery details');
      return;
    }

    try {
      setIsProcessing(true);
      showLoading('Submitting delivery...');

      writeContract({
        address: (Config as any)?.serviceMarketplaceAddress as `0x${string}`,
        abi: SERVICE_MARKETPLACE_V1_ABI,
        functionName: 'deliverOrder',
        args: [BigInt(order.id), deliveryResult],
      });
    } catch (error: any) {
      console.error('Deliver error:', error);
      showError(error.message || 'Failed to deliver order');
      setIsProcessing(false);
    }
  };

  const handleApprove = async () => {
    try {
      setIsProcessing(true);
      showLoading('Approving order...');

      // For now, use default rating (5 stars = 50) and empty review
      // TODO: Add modal to collect rating and review from user
      writeContract({
        address: (Config as any)?.serviceMarketplaceAddress as `0x${string}`,
        abi: SERVICE_MARKETPLACE_V1_ABI,
        functionName: 'approveOrder',
        args: [BigInt(order.id), 50, ''], // 5 stars, empty review
      });
    } catch (error: any) {
      console.error('Approve error:', error);
      showError(error.message || 'Failed to approve order');
      setIsProcessing(false);
    }
  };

  const handleRefund = async () => {
    try {
      setIsProcessing(true);
      showLoading('Processing refund...');

      writeContract({
        address: (Config as any)?.serviceMarketplaceAddress as `0x${string}`,
        abi: SERVICE_MARKETPLACE_V1_ABI,
        functionName: 'refundOrder',
        args: [BigInt(order.id)],
      });
    } catch (error: any) {
      console.error('Refund error:', error);
      showError(error.message || 'Failed to process refund');
      setIsProcessing(false);
    }
  };

  const handleDispute = async () => {
    try {
      setIsProcessing(true);
      showLoading('Raising dispute...');

      // TODO: Implement proper session key and encrypted content
      // For now use empty values
      writeContract({
        address: (Config as any)?.serviceMarketplaceAddress as `0x${string}`,
        abi: SERVICE_MARKETPLACE_V1_ABI,
        functionName: 'disputeOrder',
        args: [BigInt(order.id), '0x', '0x'], // orderId, sessionKey, content
      });
    } catch (error: any) {
      console.error('Dispute error:', error);
      showError(error.message || 'Failed to raise dispute');
      setIsProcessing(false);
    }
  };

  // Determine available actions
  const canStart = isSeller && order.state === 0; // Pending
  const canDeliver = isSeller && order.state === 1; // InProgress
  const canApprove = isBuyer && order.state === 2; // Delivered
  const canRefund = isSeller && order.state < 3; // Before Completed
  const canDispute = (isBuyer || isSeller) && order.state < 3 && !order.disputed;

  return (
    <>
      <div className='overflow-hidden rounded-xl bg-white shadow-xl dark:bg-gray-900 dark:shadow-2xl dark:shadow-black/20'>
        {/* Price Section */}
        {service && (
          <InfoSection title='Order Price' icon={PiCoin} variant='highlight'>
            <div className='rounded-lg bg-gradient-to-br from-green-100 to-emerald-100 p-4 dark:from-green-900/30 dark:to-emerald-900/30'>
              <div className='flex items-center gap-2'>
                <img
                  src={tokenIcon(service.paymentToken)}
                  alt='Token'
                  className='h-8 w-8 rounded-full'
                />
                <div>
                  <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                    {formatTokenNameAndAmount(service.paymentToken, order.price).split(' ')[0]}
                  </p>
                  <p className='text-sm text-gray-600 dark:text-gray-400'>
                    {formatTokenNameAndAmount(service.paymentToken, order.price).split(' ')[1]}
                  </p>
                </div>
              </div>
            </div>
          </InfoSection>
        )}

        {/* Order Details */}
        <InfoSection title='Order Details' icon={PiInfo}>
          <div className='space-y-1'>
            <DetailRow
              label='Order ID'
              value={`#${order.id}`}
              icon={PiPackage}
            />
            <DetailRow
              label='Created'
              value={moment.unix(order.createdAt).format('MMM D, YYYY')}
              icon={PiTimer}
            />
            {service && (
              <DetailRow
                label='Delivery Time'
                value={formatDeliveryTime(service.deliveryTime)}
                icon={PiTimer}
              />
            )}
            <DetailRow
              label='Escrow ID'
              value={`#${order.escrowId.toString()}`}
            />
          </div>
        </InfoSection>

        {/* Actions */}
        {(canStart || canDeliver || canApprove || canRefund || canDispute) && (
          <div className='p-6'>
            <div className='space-y-3'>
              {canStart && (
                <button
                  onClick={handleStartOrder}
                  disabled={isProcessing || isPending || isConfirming}
                  className='group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100'
                >
                  <div className='relative flex items-center justify-center gap-2'>
                    {isProcessing || isPending || isConfirming ? (
                      <Loader2 className='h-5 w-5 animate-spin' />
                    ) : (
                      <Play className='h-5 w-5' />
                    )}
                    <span>Start Order</span>
                  </div>
                </button>
              )}

              {canDeliver && (
                <button
                  onClick={handleDeliverClick}
                  disabled={isProcessing || isPending || isConfirming}
                  className='group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100'
                >
                  <div className='relative flex items-center justify-center gap-2'>
                    {isProcessing || isPending || isConfirming ? (
                      <Loader2 className='h-5 w-5 animate-spin' />
                    ) : (
                      <Package className='h-5 w-5' />
                    )}
                    <span>Deliver Work</span>
                  </div>
                </button>
              )}

              {canApprove && (
                <button
                  onClick={handleApprove}
                  disabled={isProcessing || isPending || isConfirming}
                  className='group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100'
                >
                  <div className='relative flex items-center justify-center gap-2'>
                    {isProcessing || isPending || isConfirming ? (
                      <Loader2 className='h-5 w-5 animate-spin' />
                    ) : (
                      <CheckCircle2 className='h-5 w-5' />
                    )}
                    <span>Approve & Release Payment</span>
                  </div>
                </button>
              )}

              {canRefund && (
                <button
                  onClick={handleRefund}
                  disabled={isProcessing || isPending || isConfirming}
                  className='group relative w-full overflow-hidden rounded-xl border-2 border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition-all duration-300 hover:border-gray-400 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-500 dark:hover:bg-gray-700'
                >
                  <div className='relative flex items-center justify-center gap-2'>
                    {isProcessing || isPending || isConfirming ? (
                      <Loader2 className='h-5 w-5 animate-spin' />
                    ) : (
                      <XCircle className='h-5 w-5' />
                    )}
                    <span>Refund Order</span>
                  </div>
                </button>
              )}

              {canDispute && (
                <button
                  onClick={handleDispute}
                  disabled={isProcessing || isPending || isConfirming}
                  className='group relative w-full overflow-hidden rounded-xl border-2 border-red-300 bg-white px-6 py-3 font-semibold text-red-700 transition-all duration-300 hover:border-red-400 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-600 dark:bg-gray-800 dark:text-red-400 dark:hover:border-red-500 dark:hover:bg-gray-700'
                >
                  <div className='relative flex items-center justify-center gap-2'>
                    {isProcessing || isPending || isConfirming ? (
                      <Loader2 className='h-5 w-5 animate-spin' />
                    ) : (
                      <AlertCircle className='h-5 w-5' />
                    )}
                    <span>Raise Dispute</span>
                  </div>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Escrow Info */}
        <div className='border-t border-gray-100 p-4 dark:border-gray-800'>
          <div className='flex items-start gap-2 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20'>
            <PiWarning className='mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600 dark:text-blue-400' />
            <p className='text-xs text-blue-700 dark:text-blue-300'>
              Payment is secured in escrow until the buyer approves delivery
            </p>
          </div>
        </div>
      </div>

      {/* Delivery Modal */}
      {showDeliveryModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
          <div className='w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-800'>
            <h3 className='mb-4 text-xl font-semibold text-gray-900 dark:text-white'>
              Deliver Work
            </h3>
            <p className='mb-4 text-sm text-gray-600 dark:text-gray-400'>
              Provide details of your completed work, including links to files, deliverables,
              or instructions for the buyer.
            </p>
            <textarea
              value={deliveryResult}
              onChange={(e) => setDeliveryResult(e.target.value)}
              placeholder='Enter delivery details and links...'
              className='mb-4 h-40 w-full rounded-lg border border-gray-300 p-3 text-sm text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-green-400'
            />
            <div className='flex gap-3'>
              <button
                onClick={() => {
                  setShowDeliveryModal(false);
                  setDeliveryResult('');
                  setIsProcessing(false);
                }}
                className='flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
              >
                Cancel
              </button>
              <button
                onClick={handleDeliverConfirm}
                disabled={!deliveryResult.trim() || isProcessing}
                className='flex-1 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2 font-medium text-white shadow-lg transition-all hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50'
              >
                {isProcessing ? 'Processing...' : 'Submit Delivery'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
