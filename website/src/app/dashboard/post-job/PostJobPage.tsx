'use client';
import ERC20Abi from '@/abis/ERC20.json';
import { AddToHomescreen } from '@/components/AddToHomescreen';
import { Button } from '@/components/Button';
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
import { Text } from '@/components/Text';
import { Textarea } from '@/components/Textarea';
import { TokenSelector } from '@/components/TokenSelector';
import { DeliveryTimelineInput } from '@/components/DeliveryTimelineInput';
import { PaymentInput } from '@/components/PaymentInput';
import useArbitrators from '@/hooks/subsquid/useArbitrators';
import useUser from '@/hooks/subsquid/useUser';
import { useConfig } from '@/hooks/useConfig';
import type { ComboBoxOption, Tag } from '@/service/FormsTypes';
import { type Token, tokens } from '@/tokens';
import { jobMeceTags } from '@/utils/jobMeceTags';
import {
  convertToSeconds,
  shortenText,
  unitsDeliveryTime,
} from '@/utils/utils';
import { ethers } from 'ethers';
import moment from 'moment';
import Link from 'next/link';
import React from 'react';
import { type ChangeEvent, useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { zeroAddress } from 'viem';
import { useAccount, useReadContract } from 'wagmi';
import LoadingModal from './LoadingModal';
import RegisterModal from './RegisterModal';
import { SubmitJobButton } from './SubmitJobButton';
import { Combobox } from '@/components/ComboBox';
import ListBox from '@/components/ListBox';
import {
  PiSparkle,
  PiBriefcase,
  PiCurrencyDollar,
  PiClock,
  PiScales,
  PiTag,
  PiPaperPlaneTilt,
  PiCheckCircle,
  PiWarningCircle,
  PiFileText,
  PiTruck
} from 'react-icons/pi';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

const deliveryMethods = [
  {
    name: 'IPFS',
    id: 'ipfs',
  },
  {
    name: 'Courier',
    id: 'courier',
  },
  {
    name: 'Digital Proof',
    id: 'digital_proof',
  },
  {
    name: 'Other',
    id: 'other',
  },
];

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

// Move StyledField outside of component to prevent recreation
const StyledField = React.memo(({ children, error }: { children: React.ReactNode; error?: string }) => (
  <div className='relative group'>
    <div className={`
      rounded-xl transition-all duration-200
      ${error
        ? 'bg-red-50 border border-red-200'
        : 'bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300'
      }
      p-4
    `}>
      {children}
    </div>
    {error && (
      <div className='mt-2 flex items-center gap-1 text-xs text-red-600'>
        <AlertCircle className='h-3 w-3' />
        {error}
      </div>
    )}
  </div>
));

StyledField.displayName = 'StyledField';

interface JobSummaryProps {
  title: string;
  description: string;
  imFeelingLucky: string;
  tags: Tag[];
  selectedToken: Token | undefined;
  amount: string;
  deliveryMethod: string;
  deadline: number;
  selectedArbitratorAddress: string | undefined;
  selectedCategory: { id: string; name: string };
  handleSummary: () => void;
}

const JobSummary = ({
  title,
  description,
  imFeelingLucky,
  tags,
  selectedToken,
  amount,
  deliveryMethod,
  deadline,
  selectedArbitratorAddress,
  selectedCategory,
  handleSummary,
}: JobSummaryProps) => {
  const Row = ({
    label,
    icon,
    children,
  }: {
    label: string;
    icon?: React.ReactNode;
    children?: React.ReactNode;
  }) => (
    <div className='group relative py-4 first:pt-0 last:pb-0 transition-all duration-200 hover:bg-gray-50 -mx-4 px-4 rounded-lg'>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
        <div className='flex items-center gap-2'>
          {icon && <span className='text-gray-500'>{icon}</span>}
          <span className='text-sm font-medium text-gray-600'>{label}</span>
        </div>
        <div className='text-sm text-gray-900 md:col-span-2'>{children}</div>
      </div>
    </div>
  );

  const deliveryMethodName = deliveryMethods.find(method => method.id === deliveryMethod)?.name;

  return (
    <div className='mx-auto max-w-4xl'>
      {/* Header with gradient */}
      <div className='mb-8'>
        <div className='flex items-center gap-3 mb-2'>
          <div className='p-2 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100'>
            <PiCheckCircle className='h-6 w-6 text-blue-600' />
          </div>
          <h1 className='text-3xl font-bold text-gray-900'>
            Review Your Job Post
          </h1>
        </div>
        <p className='text-gray-600 ml-11'>
          Please review all details before submitting your job post.
        </p>
      </div>

      {/* Summary Card */}
      <div className='relative mb-8'>
        {/* Background gradient orbs */}
        <div className='absolute top-0 right-0 w-40 h-40 bg-blue-100/50 rounded-full blur-3xl' />
        <div className='absolute bottom-0 left-0 w-40 h-40 bg-purple-100/50 rounded-full blur-3xl' />

        {/* Card content */}
        <div className='relative rounded-2xl bg-white/80 backdrop-blur-sm border border-gray-200 p-8 shadow-lg'>
          <div className='divide-y divide-gray-200'>
            <Row label='Job Title' icon={<PiBriefcase className='h-4 w-4' />}>
              <span className='font-medium'>{title}</span>
            </Row>
            <Row label='Description' icon={<PiFileText className='h-4 w-4' />}>
              <span className='text-gray-700 line-clamp-3'>{description}</span>
            </Row>
            <Row label='Category' icon={<PiTag className='h-4 w-4' />}>
              <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200'>
                {selectedCategory.name}
              </span>
            </Row>
            <Row label='Payment' icon={<PiCurrencyDollar className='h-4 w-4' />}>
              <div className='flex items-center gap-2'>
                <span className='font-bold text-md'>{amount}</span>
                <span className='text-gray-600'>{selectedToken?.symbol}</span>
                {selectedToken?.icon && (
                  <img
                    className='inline h-6 w-6 rounded-full'
                    alt={selectedToken.symbol}
                    src={selectedToken.icon}
                  />
                )}
              </div>
            </Row>
            <Row label='Delivery Method' icon={<PiTruck className='h-4 w-4' />}>
              <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200'>
                {deliveryMethodName}
              </span>
            </Row>
            <Row label='Deadline' icon={<PiClock className='h-4 w-4' />}>
              <span className='font-medium'>
                {moment.duration(deadline, 'seconds').humanize()}
              </span>
            </Row>
            <Row label='Arbitrator' icon={<PiScales className='h-4 w-4' />}>
              {selectedArbitratorAddress && selectedArbitratorAddress !== zeroAddress ? (
                <span className='font-mono text-xs bg-gray-100 px-2 py-1 rounded'>
                  {shortenText({ text: selectedArbitratorAddress, maxLength: 20 })}
                </span>
              ) : (
                <span className='text-gray-500 italic'>No arbitrator</span>
              )}
            </Row>
            {imFeelingLucky === 'Yes' && (
              <Row label='Auto-Accept' icon={<PiSparkle className='h-4 w-4 text-yellow-500' />}>
                <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200'>
                  Enabled - Workers can start immediately
                </span>
              </Row>
            )}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className='flex justify-end gap-4 pb-16'>
        <Button
          outline
          onClick={handleSummary}
          className='px-6'
        >
          Go Back
        </Button>
        <SubmitJobButton
          title={title}
          description={description}
          multipleApplicants={imFeelingLucky === 'No'}
          tags={[selectedCategory.id, ...tags.map((tag) => tag.name)]}
          token={selectedToken?.id as string}
          amount={ethers.parseUnits(amount, selectedToken?.decimals!)}
          deadline={BigInt(deadline)}
          deliveryMethod={deliveryMethod}
          arbitrator={selectedArbitratorAddress as string}
        />
      </div>
    </div>
  );
};

const PostJob = () => {
  const Config = useConfig();
  const { address, isConnected } = useAccount();
  const { data: user } = useUser(address!);
  const { data: arbitrators } = useArbitrators();
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

  // Parse URL parameters
  const getInitialValues = useCallback(() => {
    const title = searchParams.get('title') || '';
    const content = searchParams.get('content') || '';
    const tokenAddress = searchParams.get('token');
    const maxTime = searchParams.get('maxTime');
    const deliveryMethod = searchParams.get('deliveryMethod') || deliveryMethods[0].id;
    const arbitrator = searchParams.get('arbitrator') || zeroAddress;
    const tags = searchParams.getAll('tags');
    const amount = searchParams.get('amount') || '';

    // Find token from address
    let initialToken = tokens.find((token) => token.symbol === 'USDC');
    if (tokenAddress) {
      const foundToken = tokens.find((token) =>
        token.id.toLowerCase() === tokenAddress.toLowerCase()
      );
      if (foundToken) {
        initialToken = foundToken;
      }
    }

    // Parse maxTime to determine deadline and unit
    let deadline = 1;
    let unit = unitsDeliveryTime[2]; // Default to days
    if (maxTime) {
      const seconds = parseInt(maxTime);
      if (!isNaN(seconds)) {
        // Convert seconds to appropriate unit
        if (seconds % 86400 === 0) {
          deadline = seconds / 86400;
          unit = unitsDeliveryTime.find(u => u.name === 'Days') || unitsDeliveryTime[2];
        } else if (seconds % 3600 === 0) {
          deadline = seconds / 3600;
          unit = unitsDeliveryTime.find(u => u.name === 'Hours') || unitsDeliveryTime[1];
        } else if (seconds % 60 === 0) {
          deadline = seconds / 60;
          unit = unitsDeliveryTime.find(u => u.name === 'Minutes') || unitsDeliveryTime[0];
        } else {
          deadline = seconds;
          unit = unitsDeliveryTime.find(u => u.name === 'Seconds') || unitsDeliveryTime[0];
        }
      }
    }

    // Parse tags to find category
    let category: { id: string; name: string } | undefined ;
    const remainingTags: Tag[] = [];
    tags.forEach((tag, idx) => {
      const foundCategory = jobMeceTags.find(cat => cat.id === tag);
      if (foundCategory && !category) {
        category = foundCategory;
      } else {
        remainingTags.push({ id: Date.now() + idx, name: tag });
      }
    });

    return {
      title,
      content,
      token: initialToken,
      deadline,
      unit,
      deliveryMethod,
      arbitrator,
      tags: remainingTags,
      category,
      amount,
    };
  }, [searchParams]);

  const initialValues = useMemo(() => getInitialValues(), [getInitialValues]);

  const [selectedToken, setSelectedToken] = useState<Token | undefined>(initialValues.token);
  const noYes = ['No', 'Yes'];
  const [showSummary, setShowSummary] = useState(false);
  const [title, setTitle] = useState<string>(initialValues.title);
  const [deliveryMethod, setDeliveryMethod] = useState(initialValues.deliveryMethod);
  const [description, setDescription] = useState<string>(initialValues.content);
  const [amount, setAmount] = useState(initialValues.amount);
  const [deadline, setDeadline] = useState<number>(initialValues.deadline);
  const [imFeelingLucky, setImFeelingLucky] = useState(noYes[0]);
  const [arbitratorRequired, setArbitratorRequired] = useState(
    initialValues.arbitrator && initialValues.arbitrator !== zeroAddress ? noYes[1] : noYes[0]
  );
  const [selectedUnitTime, setselectedUnitTime] = useState<ComboBoxOption>(initialValues.unit);

  const [tags, setTags] = useState<Tag[]>(initialValues.tags);
  const [selectedCategory, setSelectedCategory] = useState<{
    id: string;
    name: string;
  } | undefined>(initialValues.category);
  const [selectedArbitratorAddress, setSelectedArbitratorAddress] =
    useState<string>(initialValues.arbitrator);
  const [titleError, setTitleError] = useState<string>('');
  const [descriptionError, setDescriptionError] = useState<string>('');
  const [categoryError, setCategoryError] = useState<string>('');
  const [paymentTokenError, setPaymentTokenError] = useState<string>('');
  const [arbitratorError, setArbitratorError] = useState<string>('');
  const [deadlineError, setDeadlineError] = useState<string>('');
  const [continueButtonDisabled, setContinueButtonDisabled] = useState(true);
  const jobTitleRef = useRef<HTMLDivElement>(null);
  const jobDescriptionRef = useRef<HTMLDivElement>(null);
  const jobCategoryRef = useRef<HTMLDivElement>(null);
  const jobAmountRef = useRef<HTMLDivElement>(null);
  const jobDeadlineRef = useRef<HTMLDivElement>(null);
  const jobArbitratorRef = useRef<HTMLDivElement>(null);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isLoadingModalOpen, setIsLoadingModalOpen] = useState(false);

  const { data: balanceData } = useReadContract({
    account: address,
    abi: ERC20Abi,
    address: selectedToken?.id as string | undefined,
    functionName: 'balanceOf',
    args: [address],
  });

  const handleSummary = useCallback(() => {
    if (!user) {
      setIsRegisterModalOpen(true);
      return;
    }

    setShowSummary(!showSummary);
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

  const validatePaymentAmount = useCallback((paymentAmount: string) => {
    setAmount(paymentAmount);

    if (balanceData === null || balanceData === undefined) {
      setPaymentTokenError('Balance data is not available');
      return;
    }

    const balance = parseFloat(
      ethers.formatUnits(
        balanceData as ethers.BigNumberish,
        selectedToken?.decimals || '0'
      )
    );
    const value = parseFloat(paymentAmount);

    if (isNaN(value)) {
      setPaymentTokenError('Please enter a valid amount');
      return;
    }

    if (value === 0) {
      setPaymentTokenError('Please enter a valid amount');
      return;
    }

    if (value > balance) {
      setPaymentTokenError('Insufficient balance of the selected token');
      return;
    }

    setPaymentTokenError('');
  }, [balanceData, selectedToken]);

  const validateArbitratorRequired = useCallback((required: string) => {
    setArbitratorRequired(required);

    if (required === 'No') {
      setSelectedArbitratorAddress(zeroAddress);
      setArbitratorError('');
      return;
    }

    // required is 'Yes'
    if (required === 'Yes' && !selectedArbitratorAddress) {
      setArbitratorError('Please select an arbitrator');
      return;
    }

    setArbitratorError('');
  }, [selectedArbitratorAddress]);

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

    if (deadline < 0) {
      deadline = -deadline;
    }

    if (deadline === 0 || isNaN(deadline)) {
      setDeadlineError('Please enter a valid deadline');
      return;
    }

    setDeadline(deadline);
    setDeadlineError('');
  }, []);

  const validateAllFields = useCallback(() => {
    validateTitle(title);
    validatePaymentAmount(amount);
    validateArbitratorRequired(arbitratorRequired);
    validateDeadline(deadline.toString());

    if (!selectedCategory) {
      setCategoryError('Please select a category');
      return false;
    } else {
      setCategoryError('');
    }

    if (titleError || paymentTokenError || arbitratorError || deadlineError || categoryError) {
      setContinueButtonDisabled(true);
      return false;
    }

    if (!title || !amount || !selectedCategory || !deadline) {
      setContinueButtonDisabled(true);
      return false;
    }

    setContinueButtonDisabled(false);
    return true;
  }, [
    title,
    amount,
    selectedCategory,
    arbitratorRequired,
    deadline,
    titleError,
    paymentTokenError,
    arbitratorError,
    deadlineError,
    categoryError,
    validateTitle,
    validatePaymentAmount,
    validateArbitratorRequired,
    validateDeadline,
  ]);

  // Validate fields on initial load if URL params are present
  useEffect(() => {
    if (initialValues.title) validateTitle(initialValues.title);
    if (initialValues.amount) validatePaymentAmount(initialValues.amount);
    if (initialValues.arbitrator) validateArbitrator(initialValues.arbitrator);
    if (initialValues.deadline) validateDeadline(initialValues.deadline.toString());
  }, []);

  useEffect(() => {
    validateAllFields();
  }, [validateAllFields]);

  const handleSubmit = useCallback(() => {
    if (!balanceData) {
      throw new Error('Balance data is not available');
    }

    if (validateAllFields()) {
      handleSummary();
      return;
    }

    if (titleError) {
      jobTitleRef.current?.focus();
      jobTitleRef.current?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    if (descriptionError) {
      jobDescriptionRef.current?.focus();
      jobDescriptionRef.current?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    if (categoryError) {
      jobCategoryRef.current?.focus();
      jobCategoryRef.current?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    if (paymentTokenError) {
      jobAmountRef.current?.focus();
      jobAmountRef.current?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    if (arbitratorError) {
      jobArbitratorRef.current?.focus();
      jobArbitratorRef.current?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
  }, [
    balanceData,
    validateAllFields,
    handleSummary,
    titleError,
    descriptionError,
    categoryError,
    paymentTokenError,
    arbitratorError,
  ]);

  return (
    <div className='relative'>
      {/* Add custom styles for animations */}
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

        .arbitrator-section-expanded {
          background: linear-gradient(to bottom, rgba(249, 250, 251, 0), rgba(249, 250, 251, 0.5));
          padding-bottom: 0.5rem;
        }
      `}</style>

      {/* Background gradient effects */}
      <div className='fixed top-20 right-20 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl pointer-events-none' />
      <div className='fixed bottom-20 left-20 w-96 h-96 bg-purple-100/30 rounded-full blur-3xl pointer-events-none' />

      {!showSummary && (
        <Fieldset className='w-full relative'>
          {/* Header */}
          <div className='mb-10'>
            <div className='flex items-center gap-3 mb-4'>
              <div className='p-3 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100'>
                <PiPaperPlaneTilt className='h-7 w-7 text-blue-600' />
              </div>
              <div>
                <h1 className='text-3xl font-bold text-gray-900'>
                  Create a Job Post
                </h1>
                <span className='text-gray-600'>
                  Complete the form below to post your job and connect with potential candidates.
                </span>
              </div>
            </div>
            {/* Progress indicator */}
            <div className='flex gap-2 mt-6'>
              <div className='h-1 flex-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500' />
              <div className='h-1 flex-1 rounded-full bg-gray-200' />
            </div>
          </div>

          <div className='flex w-full flex-col gap-8 lg:flex-row lg:gap-12'>
            {/* Left Column */}
            <div className='flex-1 space-y-6'>
              <div className='rounded-2xl bg-white border border-gray-200 p-6 shadow-sm'>
                <h2 className='text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2'>
                  <PiBriefcase className='h-5 w-5 text-blue-600' />
                  Job Details
                </h2>

                <FieldGroup className='space-y-4'>
                  <StyledField error={titleError}>
                    <Label className='text-gray-700 mb-2'>Job Title</Label>
                    <div className='scroll-mt-20' ref={jobTitleRef} />
                    <Input
                      name='title'
                      value={title}
                      placeholder='A short descriptive title for the job post'
                      required
                      minLength={3}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        validateTitle(e.target.value)
                      }
                      className='bg-transparent border-0 text-gray-900 placeholder-gray-400 focus:ring-0'
                    />
                  </StyledField>

                  <StyledField error={descriptionError}>
                    <Label className='text-gray-700 mb-2'>Description</Label>
                    <div className='scroll-mt-20' ref={jobDescriptionRef} />
                    <Textarea
                      rows={10}
                      name='description'
                      placeholder='Provide a thorough description of the job...'
                      value={description}
                      onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
                        setDescription(e.target.value);
                      }}
                      className='bg-transparent border-0 text-gray-900 placeholder-gray-400 focus:ring-0'
                    />
                  </StyledField>

                  <StyledField>
                    <div className='flex flex-row items-center justify-between'>
                      <div>
                        <Label className='text-gray-700'>I'm feeling lucky</Label>
                        <p className='text-gray-500 text-xs mt-1'>
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
                          <Field
                            className='!mt-0 flex items-center'
                            key={option}
                          >
                            <Radio
                              className='mr-2'
                              color='default'
                              value={option}
                            >
                              <span>{option}</span>
                            </Radio>
                            <Label className='text-gray-700'>{option}</Label>
                          </Field>
                        ))}
                      </RadioGroup>
                    </div>
                  </StyledField>

                  <StyledField error={categoryError}>
                    <Label className='text-gray-700 mb-2'>Category</Label>
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
                  </StyledField>

                  <StyledField>
                    <Label className='text-gray-700 mb-2'>Tags</Label>
                    <TagsInput tags={tags} setTags={setTags} />
                    <p className='text-gray-500 text-xs mt-2'>
                      Add relevant tags to help workers find your job
                    </p>
                  </StyledField>
                </FieldGroup>
              </div>
            </div>

            {/* Right Column */}
            <div className='flex-1 space-y-6'>
              <div className='rounded-2xl bg-white border border-gray-200 p-6 shadow-sm'>
                <h2 className='text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2'>
                  <PiCurrencyDollar className='h-5 w-5 text-green-600' />
                  Payment & Delivery
                </h2>
            
                <FieldGroup className='space-y-6'>
                  {/* Payment Input - Combined Amount and Token Selector */}
                  <div>
                    <PaymentInput
                      amount={amount}
                      onAmountChange={validatePaymentAmount}
                      selectedToken={selectedToken}
                      onTokenSelect={setSelectedToken}
                      balance={
                        balanceData !== null && balanceData !== undefined
                          ? ethers.formatUnits(
                              balanceData as ethers.BigNumberish,
                              selectedToken?.decimals || '0'
                            )
                          : undefined
                      }
                      error={paymentTokenError}
                      label='Payment Amount'
                      placeholder='Enter amount'
                      helperText={!paymentTokenError ? 'Set the payment amount for this job' : undefined}
                      required
                    />
                  </div>
            
                  {/* Delivery Method */}
                  <StyledField>
                    <Label className='text-gray-700 mb-2'>Delivery Method</Label>
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
                    <p className='text-gray-500 text-xs mt-2'>
                      Choose how the work should be delivered
                    </p>
                  </StyledField>
            
                  {/* Deadline Section */}
                  <div>
                    <Label className='text-gray-700 mb-2'>Delivery Timeline</Label>
                    <div className='scroll-mt-20' ref={jobDeadlineRef} />
                    <DeliveryTimelineInput
                      value={deadline}
                      onValueChange={validateDeadline}
                      selectedUnit={selectedUnitTime}
                      onUnitChange={setselectedUnitTime}
                      error={deadlineError}
                      placeholder='Enter time'
                      helperText={!deadlineError ? 'Set the expected delivery time for this job' : undefined}
                    />
                  </div>

            
                  {/* Enhanced Arbitrator Section with Animation */}
                  <div className={`
                    arbitrator-section rounded-xl border transition-all duration-300
                    ${arbitratorRequired === 'Yes' 
                      ? 'border-purple-300 bg-gradient-to-b from-purple-50/50 to-white shadow-sm' 
                      : 'border-gray-200 bg-gray-50'
                    }
                  `}>
                    <div className='p-4'>
                      <div className='flex flex-row items-center justify-between'>
                        <div className='flex items-center gap-2'>
                          <PiScales className={`h-4 w-4 transition-colors duration-300 ${
                            arbitratorRequired === 'Yes' ? 'text-purple-600' : 'text-gray-500'
                          }`} />
                          <div>
                            <Label className='text-gray-700'>Arbitrator Required</Label>
                            <p className='text-gray-500 text-xs mt-1'>
                              Enable third-party dispute resolution
                            </p>
                          </div>
                        </div>
                        <RadioGroup
                          className='!mt-0 flex gap-3'
                          value={arbitratorRequired}
                          onChange={(value) => validateArbitratorRequired(value)}
                          aria-label='Arbitrator Required'
                        >
                          {noYes.map((option) => (
                            <Field
                              className='!mt-0 flex items-center'
                              key={option}
                            >
                              <Radio
                                color='default'
                                className='mr-1.5'
                                value={option}
                              >
                                <span>{option}</span>
                              </Radio>
                              <Label className='text-gray-700 cursor-pointer'>
                                {option}
                              </Label>
                            </Field>
                          ))}
                        </RadioGroup>
                      </div>
                    
                      {/* Animated Arbitrator Selection */}
                      <div 
                        className={`
                          overflow-hidden transition-all duration-300 ease-in-out
                          ${arbitratorRequired === 'Yes' 
                            ? 'max-h-96 opacity-100 mt-4' 
                            : 'max-h-0 opacity-0'
                          }
                        `}
                      >
                        <div className={`
                          transition-transform duration-300
                          ${arbitratorRequired === 'Yes' ? 'translate-y-0' : '-translate-y-4'}
                        `}>
                          <div className='border-t border-purple-200/50 pt-4'>
                            <div className='scroll-mt-20' ref={jobArbitratorRef} />
                            <Combobox
                              placeholder='Choose an arbitrator'
                              value={selectedArbitratorAddress || ''}
                              options={arbitratorAddresses.map((address, index) => ({
                                value: address,
                                label: address === zeroAddress 
                                  ? 'No Arbitrator' 
                                  : `${arbitratorNames[index]} • ${shortenText({ text: address, maxLength: 11 })} • ${+arbitratorFees[index] / 100}% fee`,
                              }))}
                              onChange={(addr) => validateArbitrator(addr)}
                            />
                            {arbitratorError && (
                              <div className='mt-2 flex items-center gap-1 text-xs text-red-600'>
                                <AlertCircle className='h-3 w-3' />
                                {arbitratorError}
                              </div>
                            )}
                            {selectedArbitratorAddress && selectedArbitratorAddress !== zeroAddress && !arbitratorError && (
                              <div className='mt-3 px-3 py-2 bg-purple-50 border border-purple-200 rounded-lg'>
                                <p className='text-xs text-purple-700'>
                                  The arbitrator will receive their fee upon successful dispute resolution
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </FieldGroup>
              </div>
            </div>
          </div>

          {/* Submit button */}
          {!showSummary && (
            <div className='mt-8 flex justify-end gap-4 pb-20'>
              {isConnected ? (
                <Button
                  disabled={continueButtonDisabled}
                  onClick={handleSubmit}
                  className={`
                    px-8 py-3 rounded-xl font-medium transition-all duration-200
                    ${continueButtonDisabled
                      ? 'bg-gray-100 text-gray-500 border border-gray-200 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                    }
                  `}
                >
                  <span className='flex items-center gap-2 text-white'>
                    Continue to Review
                    <CheckCircle2 className='h-4 w-4' />
                  </span>
                </Button>
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
          deadline={convertToSeconds(deadline, selectedUnitTime.name)}
          selectedArbitratorAddress={selectedArbitratorAddress}
        />
      )}

      <RegisterModal
        open={isRegisterModalOpen}
        close={() => {
          setIsRegisterModalOpen(false);
        }}
      />
      <LoadingModal
        open={isLoadingModalOpen}
        close={() => {
          setIsLoadingModalOpen(false);
        }}
      />
      <AddToHomescreen />
    </div>
  );
};

export default PostJob;
