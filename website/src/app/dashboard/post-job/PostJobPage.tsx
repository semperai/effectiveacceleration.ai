'use client';
import { AddToHomescreen } from '@/components/AddToHomescreen';
import { ConnectButton } from '@/components/ConnectButton';
import {
  Field,
  FieldGroup,
  Fieldset,
  Label,
} from '@/components/Fieldset';
import { Input } from '@/components/Input';
import { Radio, RadioGroup } from '@/components/Radio';
import TagsInput from '@/components/TagsInput';
import { Textarea } from '@/components/Textarea';
import { DeliveryTimelineInput } from '@/components/DeliveryTimelineInput';
import { PaymentInput } from '@/components/PaymentInput';
import { ArbitratorSelector } from '@/components/ArbitratorSelector';
import ListBox from '@/components/ListBox';
import useArbitrators from '@/hooks/subsquid/useArbitrators';
import useUser from '@/hooks/subsquid/useUser';
import { useConfig } from '@/hooks/useConfig';
import type { ComboBoxOption, Tag } from '@/service/FormsTypes';
import { type Token, tokens } from '@/tokens';
import { jobMeceTags } from '@/utils/jobMeceTags';
import {
  convertToSeconds,
  unitsDeliveryTime,
  getUnitAndValueFromSeconds,
} from '@/utils/utils';
import React from 'react';
import { type ChangeEvent, useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as ReactDOM from 'react-dom';
import { zeroAddress } from 'viem';
import { useAccount } from 'wagmi';
import LoadingModal from './LoadingModal';
import RegisterModal from './RegisterModal';
import JobSummary from './JobSummary';
import MinimalField from './MinimalField';
import {
  PiSparkle,
  PiBriefcase,
  PiCurrencyDollar,
  PiClock,
  PiScales,
  PiTag,
  PiPaperPlaneTilt,
  PiWarningCircle,
  PiTruck,
} from 'react-icons/pi';
import { AlertCircle, ArrowRight, ExternalLink } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import EventProfileImage from '@/components/Events/Components/EventProfileImage';

export interface PostJobParams {
  title?: string;
  amount?: string;
  content?: string;
  token?: string;
  maxTime?: string;
  deliveryMethod?: string;
  roles?: {
    arbitrator?: string;
  };
  tags: string[];
}

const deliveryMethods = [
  { name: 'IPFS', id: 'ipfs' },
  { name: 'Courier', id: 'courier' },
  { name: 'Digital Proof', id: 'digital_proof' },
  { name: 'Other', id: 'other' },
];

const PostJob = () => {
  const Config = useConfig();
  const { address, isConnected } = useAccount();
  const { data: user } = useUser(address!);
  const { data: arbitrators } = useArbitrators();
  const [tokenBalance, setTokenBalance] = useState<string | undefined>(undefined);
  const searchParams = useSearchParams();

  const arbitratorAddresses = useMemo(() => [
    zeroAddress,
    ...(arbitrators?.map((worker) => worker.address_) ?? []),
  ], [arbitrators]);

  const arbitratorNames = useMemo(() => [
    'None',
    ...(arbitrators?.map((worker) => worker.name) ?? []),
  ], [arbitrators]);

  const arbitratorFees = useMemo(() => [
    '0',
    ...(arbitrators?.map((worker) => worker.fee) ?? []),
  ], [arbitrators]);

  // Convert between utils format and DeliveryTimelineInput format
  // DeliveryTimelineInput uses different IDs: '1'=Minute, '2'=Hour, '3'=Day, '4'=Week
  const convertUnitForDisplay = (unit: ComboBoxOption): ComboBoxOption => {
    const nameMap: { [key: string]: { name: string; id: string } } = {
      'minutes': { name: 'Minute', id: '1' },
      'hours': { name: 'Hour', id: '2' },
      'days': { name: 'Day', id: '3' },
      'weeks': { name: 'Week', id: '4' },
      'months': { name: 'Day', id: '3' }, // Fallback months to days since component doesn't support months
      'years': { name: 'Day', id: '3' }  // Fallback years to days since component doesn't support years
    };

    const mapped = nameMap[unit.name];
    return mapped ? { ...unit, name: mapped.name, id: mapped.id } : unit;
  };

  const convertUnitFromDisplay = (unit: ComboBoxOption): ComboBoxOption => {
    // Map back based on the ID from DeliveryTimelineInput
    const idMap: { [key: string]: { name: string; id: string } } = {
      '1': { name: 'minutes', id: '0' },
      '2': { name: 'hours', id: '1' },
      '3': { name: 'days', id: '2' },
      '4': { name: 'weeks', id: '3' }
    };

    const mapped = idMap[unit.id];
    if (mapped) {
      return { ...unit, name: mapped.name, id: mapped.id };
    }

    // Also handle by name for safety
    const nameMap: { [key: string]: string } = {
      'Minute': 'minutes',
      'Minutes': 'minutes',
      'Hour': 'hours',
      'Hours': 'hours',
      'Day': 'days',
      'Days': 'days',
      'Week': 'weeks',
      'Weeks': 'weeks'
    };

    return {
      ...unit,
      name: nameMap[unit.name] || unit.name
    };
  };

  const getInitialValues = useCallback(() => {
    const title = searchParams.get('title') || '';
    const content = searchParams.get('content') || '';
    const tokenAddress = searchParams.get('token');
    const maxTime = searchParams.get('maxTime');
    const deliveryMethod = searchParams.get('deliveryMethod') || deliveryMethods[0].id;
    const arbitrator = searchParams.get('arbitrator') || zeroAddress;
    const tags = searchParams.getAll('tags');
    const amount = searchParams.get('amount') || '';

    let initialToken = tokens.find((token) => token.symbol === 'USDC');
    if (tokenAddress) {
      const foundToken = tokens.find((token) => token.id.toLowerCase() === tokenAddress.toLowerCase());
      if (foundToken) initialToken = foundToken;
    }

    // Fixed: Default to 1 day, matching the lowercase format from unitsDeliveryTime
    let deadline = 1;
    // unitsDeliveryTime uses lowercase 'days' at index 2
    let unit = unitsDeliveryTime[2]; // This is { id: '2', name: 'days' }

    if (maxTime) {
      const seconds = parseInt(maxTime);
      if (!isNaN(seconds)) {
        // Use the getUnitAndValueFromSeconds utility function from utils
        const result = getUnitAndValueFromSeconds(seconds);
        deadline = result.value;
        // Find the matching unit in unitsDeliveryTime
        unit = unitsDeliveryTime.find(u => u.name === result.unit) || unitsDeliveryTime[2];
      }
    }

    let category: { id: string; name: string } | undefined;
    const remainingTags: Tag[] = [];
    tags.forEach((tag, idx) => {
      const foundCategory = jobMeceTags.find(cat => cat.id === tag);
      if (foundCategory && !category) {
        category = foundCategory;
      } else {
        remainingTags.push({ id: Date.now() + idx, name: tag });
      }
    });

    return { title, content, token: initialToken, deadline, unit, deliveryMethod, arbitrator, tags: remainingTags, category, amount };
  }, [searchParams]);

  const initialValues = useMemo(() => getInitialValues(), [getInitialValues]);

  const [selectedToken, setSelectedToken] = useState<Token | undefined>(initialValues.token);
  const noYes = ['No', 'Yes'];
  const [showSummary, setShowSummary] = useState(false);
  const [title, setTitle] = useState<string>(initialValues.title);
  const [deliveryMethod, setDeliveryMethod] = useState(initialValues.deliveryMethod);
  const [description, setDescription] = useState<string>(initialValues.content);
  const [amount, setAmount] = useState(initialValues.amount);
  const [deadline, setDeadline] = useState<number>(initialValues.deadline || 1);
  const [imFeelingLucky, setImFeelingLucky] = useState(noYes[0]);
  const [selectedUnitTime, setselectedUnitTime] = useState<ComboBoxOption>(
    convertUnitForDisplay(initialValues.unit || unitsDeliveryTime[2]) // Convert to display format
  );
  const [tags, setTags] = useState<Tag[]>(initialValues.tags);
  const [selectedCategory, setSelectedCategory] = useState<{ id: string; name: string } | undefined>(initialValues.category);
  const [selectedArbitratorAddress, setSelectedArbitratorAddress] = useState<string>(initialValues.arbitrator);

  const [titleError, setTitleError] = useState<string>('');
  const [descriptionError, setDescriptionError] = useState<string>('');
  const [categoryError, setCategoryError] = useState<string>('');
  const [paymentTokenError, setPaymentTokenError] = useState<string>('');
  const [arbitratorError, setArbitratorError] = useState<string>('');
  const [deadlineError, setDeadlineError] = useState<string>('');
  const [validationAttempted, setValidationAttempted] = useState(false);

  const jobTitleRef = useRef<HTMLDivElement>(null);
  const jobDescriptionRef = useRef<HTMLDivElement>(null);
  const jobCategoryRef = useRef<HTMLDivElement>(null);
  const jobAmountRef = useRef<HTMLDivElement>(null);
  const jobDeadlineRef = useRef<HTMLDivElement>(null);
  const jobArbitratorRef = useRef<HTMLDivElement>(null);

  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isLoadingModalOpen, setIsLoadingModalOpen] = useState(false);

  // Function to handle transaction submission from JobSummary
  const handleTransactionSubmit = useCallback(() => {
    setIsLoadingModalOpen(true);
  }, []);

  // Function to handle transaction completion
  const handleTransactionComplete = useCallback(() => {
    setIsLoadingModalOpen(false);
  }, []);

  // Handle balance updates from PaymentInput
  const handleBalanceUpdate = useCallback((balance: string | undefined) => {
    setTokenBalance(balance);
    // Re-validate amount when balance updates
    if (amount && balance) {
      const amountValue = parseFloat(amount);
      const balanceValue = parseFloat(balance);
      if (!isNaN(amountValue) && !isNaN(balanceValue)) {
        if (amountValue > balanceValue) {
          setPaymentTokenError('Amount exceeds available balance');
        } else if (paymentTokenError === 'Amount exceeds available balance' || paymentTokenError === 'Insufficient balance') {
          setPaymentTokenError('');
        }
      }
    }
  }, [amount, paymentTokenError]);

  const handleSummary = useCallback(() => {
    if (!user) {
      setIsRegisterModalOpen(true);
      return;
    }
    setShowSummary(!showSummary);
    // Don't show loading modal here - only show it when actually submitting the transaction
  }, [user, showSummary]);

  const validateTitle = useCallback((value: string) => {
    setTitle(value);
    if (value === '') {
      setTitleError('This field is required');
      return;
    }
    if (value.length < 3) {
      setTitleError('Must be at least 3 characters long');
      return;
    }
    setTitleError('');
  }, []);

  // Updated validatePaymentAmount to consider balance
  const validatePaymentAmount = useCallback((paymentAmount: string) => {
    setAmount(paymentAmount);
    const value = parseFloat(paymentAmount);

    if (paymentAmount === '' || isNaN(value) || value === 0) {
      setPaymentTokenError('Please enter a valid amount');
      return;
    }

    // Check against balance if available
    if (tokenBalance) {
      const balanceValue = parseFloat(tokenBalance);
      if (!isNaN(balanceValue) && value > balanceValue) {
        setPaymentTokenError('Amount exceeds available balance');
        return;
      }
    }

    setPaymentTokenError('');
  }, [tokenBalance]);

  const validateArbitrator = useCallback((addr: string) => {
    setSelectedArbitratorAddress(addr);
    if (addr == address) {
      setArbitratorError('You cannot be your own arbitrator');
      return;
    }
    setArbitratorError('');
  }, [address]);

  const validateDeadline = useCallback((deadlineStr: string) => {
    if (deadlineStr === '') {
      setDeadline(NaN);
      setDeadlineError('');
      return;
    }
    let deadline = parseInt(deadlineStr);
    if (deadline < 0) deadline = -deadline;
    if (deadline === 0 || isNaN(deadline)) {
      setDeadlineError('Please enter a valid deadline');
      return;
    }
    setDeadline(deadline);
    setDeadlineError('');
  }, []);

  useEffect(() => {
    if (validationAttempted) {
      if (title && title.length >= 3) setTitleError('');
      if (selectedCategory) setCategoryError('');
      if (amount && parseFloat(amount) > 0) {
        // Re-validate amount when balance changes
        const value = parseFloat(amount);
        if (tokenBalance) {
          const balanceValue = parseFloat(tokenBalance);
          if (!isNaN(value) && !isNaN(balanceValue) && value > balanceValue) {
            setPaymentTokenError('Amount exceeds available balance');
          } else {
            setPaymentTokenError('');
          }
        } else {
          setPaymentTokenError('');
        }
      }
      if (deadline && !isNaN(deadline) && deadline > 0) setDeadlineError('');
      // Simplified: no need to check arbitratorRequired anymore
      if (selectedArbitratorAddress && selectedArbitratorAddress !== address) {
        setArbitratorError('');
      }
    }
  }, [title, selectedCategory, amount, tokenBalance, deadline, selectedArbitratorAddress, address, validationAttempted]);

  useEffect(() => {
    if (initialValues.title) validateTitle(initialValues.title);
    if (initialValues.amount) validatePaymentAmount(initialValues.amount);
    if (initialValues.arbitrator) validateArbitrator(initialValues.arbitrator);
    if (initialValues.deadline) validateDeadline(initialValues.deadline.toString());
  }, [initialValues.title, initialValues.amount, initialValues.arbitrator, initialValues.deadline, validateTitle, validatePaymentAmount, validateArbitrator, validateDeadline]);

  // Updated handleSubmit - removed arbitratorRequired validation
  const handleSubmit = useCallback(() => {
    setValidationAttempted(true);
    setTitleError('');
    setDescriptionError('');
    setCategoryError('');
    setPaymentTokenError('');
    setArbitratorError('');
    setDeadlineError('');

    let hasErrors = false;
    const errorFields: Array<{ ref: React.RefObject<HTMLDivElement>, setter: (msg: string) => void, message: string }> = [];

    if (!title || title.length < 3) {
      const msg = !title ? 'Job title is required' : 'Job title must be at least 3 characters';
      errorFields.push({ ref: jobTitleRef, setter: setTitleError, message: msg });
      hasErrors = true;
    }

    if (!selectedCategory) {
      errorFields.push({ ref: jobCategoryRef, setter: setCategoryError, message: 'Please select a category' });
      hasErrors = true;
    }

    if (!amount || parseFloat(amount) <= 0) {
      errorFields.push({ ref: jobAmountRef, setter: setPaymentTokenError, message: 'Please enter a valid payment amount' });
      hasErrors = true;
    } else if (tokenBalance) {
      // Additional balance check at submit time
      const amountValue = parseFloat(amount);
      const balanceValue = parseFloat(tokenBalance);
      if (!isNaN(amountValue) && !isNaN(balanceValue) && amountValue > balanceValue) {
        errorFields.push({ ref: jobAmountRef, setter: setPaymentTokenError, message: 'Amount exceeds available balance' });
        hasErrors = true;
      }
    }

    if (!deadline || isNaN(deadline) || deadline <= 0) {
      errorFields.push({ ref: jobDeadlineRef, setter: setDeadlineError, message: 'Please enter a valid deadline' });
      hasErrors = true;
    }

    // Simplified: Only check if user selected themselves as arbitrator
    if (selectedArbitratorAddress && selectedArbitratorAddress === address) {
      errorFields.push({ ref: jobArbitratorRef, setter: setArbitratorError, message: 'You cannot be your own arbitrator' });
      hasErrors = true;
    }

    if (hasErrors) {
      errorFields.forEach(({ setter, message }) => setter(message));
      if (errorFields.length > 0 && errorFields[0].ref.current) {
        errorFields[0].ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    handleSummary();
  }, [title, amount, tokenBalance, selectedCategory, deadline, selectedArbitratorAddress, address, handleSummary]);

  return (
    <div className='relative min-h-screen overflow-x-hidden'>
      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            max-height: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            max-height: 300px;
            transform: translateY(0);
          }
        }
        .slide-down-enter {
          animation: slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        .arbitrator-section {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>

      {/* Fixed blur elements with proper mobile constraints */}
      <div className='fixed top-40 right-4 sm:right-20 w-64 sm:w-96 h-64 sm:h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none' />
      <div className='fixed bottom-40 left-4 sm:left-20 w-64 sm:w-96 h-64 sm:h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none' />

      {!showSummary && (
        <Fieldset className='w-full relative px-2 sm:px-0'>
          <div className='mb-10'>
            <div className='flex items-center gap-3 mb-4'>
              <div className='p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-sm border border-blue-500/20 flex-shrink-0'>
                <PiPaperPlaneTilt className='h-7 w-7 text-blue-500' />
              </div>
              <div className='min-w-0 flex-1'>
                <h1 className='text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100'>Create a Job Post</h1>
                <span className='text-sm sm:text-base text-gray-600 dark:text-gray-400 block'>
                  Complete the form below to post your job and connect with potential candidates.
                </span>
              </div>
            </div>
            {/* Progress bar with proper container constraints */}
            <div className='flex gap-2 mt-6'>
              <div className='h-1 flex-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500' />
              <div className='h-1 flex-1 rounded-full bg-gray-200 dark:bg-gray-700' />
            </div>
          </div>

          <div className='flex w-full flex-col gap-8 lg:flex-row lg:gap-12'>
            <div className='flex-1 min-w-0'>
              <div className='rounded-2xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 p-3 sm:p-6 shadow-xl'>
                <h2 className='text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2'>
                  <PiBriefcase className='h-5 w-5 text-blue-500 flex-shrink-0' />
                  <span className='min-w-0'>Job Details</span>
                </h2>

                <FieldGroup className='space-y-6'>
                  <MinimalField error={titleError} label='Job Title' helperText='A short descriptive title for the job post' required>
                    <div className='scroll-mt-20' ref={jobTitleRef} />
                    <Input
                      name='title'
                      value={title}
                      placeholder='e.g., Build a React dashboard'
                      required
                      minLength={3}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => validateTitle(e.target.value)}
                      className={`bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50 ${
                        titleError ? '!border-red-500 focus:!border-red-500 focus:!ring-2 focus:!ring-red-500/30' : 'focus:border-blue-500/50 dark:focus:border-blue-400/50'
                      }`}
                    />
                  </MinimalField>

                  <MinimalField error={descriptionError} label='Description' helperText='Provide a thorough description of the job'>
                    <div className='scroll-mt-20' ref={jobDescriptionRef} />
                    <Textarea
                      rows={10}
                      name='description'
                      placeholder='Describe what needs to be done, deliverables, requirements...'
                      value={description}
                      onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                      className='bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50 focus:border-blue-500/50 dark:focus:border-blue-400/50'
                    />
                  </MinimalField>

                  <div className='p-4 rounded-xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 border border-blue-500/10'>
                    <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
                      <div className='min-w-0 flex-1'>
                        <Label className='text-gray-700 dark:text-gray-300 flex items-center gap-2'>
                          <PiSparkle className='h-4 w-4 text-yellow-500 flex-shrink-0' />
                          <span>I'm feeling lucky</span>
                        </Label>
                        <p className='text-gray-500 dark:text-gray-400 text-xs mt-1'>
                          Allow workers to start automatically without approval
                        </p>
                      </div>
                      <RadioGroup
                        className='!mt-0 flex gap-4'
                        value={imFeelingLucky}
                        onChange={setImFeelingLucky}
                        aria-label='Auto-accept workers'
                      >
                        {noYes.map((option) => (
                          <Field className='!mt-0 flex items-center' key={option}>
                            <Radio className='mr-2' color='default' value={option}>
                              <span>{option}</span>
                            </Radio>
                            <Label className='text-gray-700 dark:text-gray-300'>{option}</Label>
                          </Field>
                        ))}
                      </RadioGroup>
                    </div>
                  </div>

                  <MinimalField error={categoryError} label='Category' icon={<PiTag className='h-4 w-4' />} helperText='Select the category that best describes your job' required>
                    <div ref={jobCategoryRef} className='scroll-mt-20' />
                    <ListBox
                      placeholder='Select Category'
                      value={selectedCategory}
                      onChange={(category) => {
                        if (typeof category !== 'string') {
                          setSelectedCategory(category);
                          setCategoryError('');
                        }
                      }}
                      options={jobMeceTags}
                    />
                  </MinimalField>

                  <MinimalField label='Tags' helperText='Add relevant tags to help workers find your job'>
                    <TagsInput tags={tags} setTags={setTags} />
                  </MinimalField>
                </FieldGroup>
              </div>
            </div>

            <div className='flex-1 min-w-0'>
              <div className='rounded-2xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 p-3 sm:p-6 shadow-xl'>
                <h2 className='text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2'>
                  <PiCurrencyDollar className='h-5 w-5 text-green-500 flex-shrink-0' />
                  <span className='min-w-0'>Payment & Delivery</span>
                </h2>

                <FieldGroup className='space-y-6'>
                  {/* Payment Input with Balance Update */}
                  <div className='relative'>
                    <div className='flex items-center gap-2 mb-2'>
                      <PiCurrencyDollar className={`h-4 w-4 transition-colors duration-200 flex-shrink-0 ${paymentTokenError ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'}`} />
                      <Label className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                        Payment Amount
                        <span className='ml-1 text-red-500 font-bold text-base'>*</span>
                      </Label>
                    </div>
                    <div className='scroll-mt-20' ref={jobAmountRef} />
                    <div className='relative'>
                      <div className={`
                        relative rounded-xl transition-all duration-300
                        ${paymentTokenError
                          ? 'ring-2 ring-red-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-900 shadow-[0_0_20px_rgba(239,68,68,0.3)]'
                          : ''
                        }
                      `}>
                        {paymentTokenError && (
                          <div className='absolute -top-3 -right-3 z-20'>
                            <div className='relative'>
                              <span className='absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75' />
                              <span className='relative flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-lg'>
                                <PiWarningCircle className='h-4 w-4' />
                              </span>
                            </div>
                          </div>
                        )}
                        <div className={`
                          rounded-xl transition-all duration-200
                          ${paymentTokenError ? 'bg-red-50/50 dark:bg-red-950/20' : ''}
                        `}>
                          <PaymentInput
                            amount={amount}
                            onAmountChange={validatePaymentAmount}
                            selectedToken={selectedToken}
                            onTokenSelect={setSelectedToken}
                            onBalanceUpdate={handleBalanceUpdate}
                            placeholder='Enter amount'
                            helperText={!paymentTokenError ? 'Set the payment amount for this job' : undefined}
                            required
                            validateAmount={true}
                          />
                        </div>
                      </div>
                      {paymentTokenError && (
                        <div className='mt-2.5 flex items-center gap-2'>
                          <div className='flex items-center gap-1.5 text-sm font-semibold text-red-600 dark:text-red-400'>
                            <AlertCircle className='h-4 w-4 flex-shrink-0 animate-pulse' />
                            <span className='break-words'>{paymentTokenError}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <MinimalField label='Delivery Method' icon={<PiTruck className='h-4 w-4' />} helperText='Choose how the work should be delivered'>
                    <ListBox
                      placeholder='Select Delivery Method'
                      value={deliveryMethod}
                      onChange={(method) => {
                        if (typeof method !== 'string') {
                          setDeliveryMethod(method.id);
                        }
                      }}
                      options={deliveryMethods}
                    />
                  </MinimalField>

                  <div className='relative'>
                    <Label className='text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2'>
                      <PiClock className={`h-4 w-4 transition-colors duration-200 flex-shrink-0 ${deadlineError ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'}`} />
                      <span>Delivery Timeline</span>
                      <span className='ml-1 text-red-500 font-bold text-base'>*</span>
                    </Label>
                    <div className='scroll-mt-20' ref={jobDeadlineRef} />
                    <div className='relative'>
                      <div className={`relative rounded-xl transition-all duration-300 ${deadlineError ? 'ring-2 ring-red-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-900 shadow-[0_0_20px_rgba(239,68,68,0.3)]' : ''}`}>
                        {deadlineError && (
                          <div className='absolute -top-3 -right-3 z-20'>
                            <div className='relative'>
                              <span className='absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75' />
                              <span className='relative flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-lg'>
                                <PiWarningCircle className='h-4 w-4' />
                              </span>
                            </div>
                          </div>
                        )}
                        <div className={`rounded-xl transition-all duration-200 ${deadlineError ? 'bg-red-50/50 dark:bg-red-950/20' : ''}`}>
                          <DeliveryTimelineInput
                            value={deadline}
                            onValueChange={validateDeadline}
                            selectedUnit={selectedUnitTime}
                            onUnitChange={(unit) => {
                              setselectedUnitTime(unit);
                            }}
                            placeholder='Enter time'
                            helperText={!deadlineError ? 'Set the expected delivery time for this job' : undefined}
                          />
                        </div>
                      </div>
                    </div>
                    {deadlineError && (
                      <div className='mt-2.5 flex items-center gap-2'>
                        <div className='flex items-center gap-1.5 text-sm font-semibold text-red-600 dark:text-red-400'>
                          <AlertCircle className='h-4 w-4 flex-shrink-0 animate-pulse' />
                          <span>{deadlineError}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Simplified Arbitrator Section */}
                  <MinimalField
                    error={arbitratorError}
                    label='Dispute Resolution'
                    icon={<PiScales className='h-4 w-4' />}
                    helperText={selectedArbitratorAddress && selectedArbitratorAddress !== zeroAddress
                      ? 'An arbitrator can help resolve disputes if they arise'
                      : 'Select an arbitrator for third-party dispute resolution (optional)'
                    }
                  >
                    <div className='scroll-mt-20' ref={jobArbitratorRef} />
                    <ArbitratorSelector
                      arbitrators={arbitrators || []}
                      selectedAddress={selectedArbitratorAddress}
                      onChange={validateArbitrator}
                      disabled={false}
                      showExternalLink={true}
                      showNoArbitrator={true}
                    />

                    {selectedArbitratorAddress && selectedArbitratorAddress !== zeroAddress && !arbitratorError && (
                      <div className='mt-3 px-3 py-2 bg-purple-500/10 border border-purple-500/20 rounded-lg'>
                        <p className='text-xs text-purple-600 dark:text-purple-400'>
                          The arbitrator will receive their fee upon successful dispute resolution
                        </p>
                      </div>
                    )}
                  </MinimalField>
                </FieldGroup>
              </div>
            </div>
          </div>

          {!showSummary && (
            <div className='mt-8 flex justify-end gap-4 pb-20 px-2 sm:px-0'>
              {isConnected ? (
                <button
                  onClick={handleSubmit}
                  className='group relative px-6 sm:px-8 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg border border-white/10 bg-slate-800'
                >
                  <span className='relative flex items-center gap-2 text-white'>
                    <span className='text-white'>Continue to Review</span>
                    <ArrowRight className='h-4 w-4 group-hover:translate-x-0.5 transition-transform text-white' />
                  </span>
                </button>
              ) : (
                <ConnectButton />
              )}
            </div>
          )}
        </Fieldset>
      )}

      {showSummary && (
        <JobSummary
          handleSummary={handleSummary}
          title={title}
          description={description}
          imFeelingLucky={imFeelingLucky}
          tags={tags}
          deliveryMethod={deliveryMethod}
          selectedToken={selectedToken}
          amount={amount}
          selectedCategory={selectedCategory as { id: string; name: string }}
          deadline={convertToSeconds(deadline, convertUnitFromDisplay(selectedUnitTime).name)}
          selectedArbitratorAddress={selectedArbitratorAddress}
          onTransactionStart={handleTransactionSubmit}
          onTransactionComplete={handleTransactionComplete}
        />
      )}

      <RegisterModal open={isRegisterModalOpen} close={() => setIsRegisterModalOpen(false)} />
      <LoadingModal open={isLoadingModalOpen} close={() => setIsLoadingModalOpen(false)} />
      <AddToHomescreen />
    </div>
  );
};

export default PostJob;
