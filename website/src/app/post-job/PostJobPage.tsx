'use client';
import { AddToHomescreen } from '@/components/AddToHomescreen';
import { ConnectButton } from '@/components/ConnectButton';
import { Field, FieldGroup, Fieldset, Label } from '@/components/Fieldset';
import { Input } from '@/components/Input';
import { Radio, RadioGroup } from '@/components/Radio';
import TagsInput from '@/components/TagsInput';
import { Textarea } from '@/components/Textarea';
import { DeliveryTimelineInput } from '@/components/DeliveryTimelineInput';
import { PaymentInput } from '@/components/PaymentInput';
import { ArbitratorSelector } from '@/components/ArbitratorSelector';
import ListBox from '@/components/ListBox';
import MinimalField from '@/components/MinimalField';
import useArbitrators from '@/hooks/subsquid/useArbitrators';
import useUser from '@/hooks/subsquid/useUser';
import { useConfig } from '@/hooks/useConfig';
import type { ComboBoxOption, Tag } from '@/service/FormsTypes';
import { type Token, tokens } from '@/lib/tokens';
import { jobMeceTags, deliveryMethods, noYesOptions } from '@/lib/constants';
import {
  convertToSeconds,
  unitsDeliveryTime,
  getUnitAndValueFromSeconds,
} from '@/lib/utils';
import React from 'react';
import {
  type ChangeEvent,
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from 'react';
import { zeroAddress } from 'viem';
import { useAccount } from 'wagmi';
import LoadingModal from './LoadingModal';
import RegisterModal from './RegisterModal';
import JobSummary from './JobSummary';
import {
  PiSparkle,
  PiBriefcase,
  PiCurrencyDollar,
  PiClock,
  PiScales,
  PiTag,
  PiPaperPlaneTilt,
  PiTruck,
} from 'react-icons/pi';
import { ArrowRight } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

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

const PostJob = () => {
  const Config = useConfig();
  const { address, isConnected } = useAccount();
  const { data: user } = useUser(address!);
  const { data: arbitrators } = useArbitrators();
  const [tokenBalance, setTokenBalance] = useState<string | undefined>(
    undefined
  );
  const searchParams = useSearchParams();

  const arbitratorAddresses = useMemo(
    () => [
      zeroAddress,
      ...(arbitrators?.map((worker) => worker.address_) ?? []),
    ],
    [arbitrators]
  );

  const arbitratorNames = useMemo(
    () => ['None', ...(arbitrators?.map((worker) => worker.name) ?? [])],
    [arbitrators]
  );

  const arbitratorFees = useMemo(
    () => ['0', ...(arbitrators?.map((worker) => worker.fee) ?? [])],
    [arbitrators]
  );

  // Convert between utils format and DeliveryTimelineInput format
  const convertUnitForDisplay = (unit: ComboBoxOption): ComboBoxOption => {
    const nameMap: { [key: string]: { name: string; id: string } } = {
      minutes: { name: 'Minute', id: '1' },
      hours: { name: 'Hour', id: '2' },
      days: { name: 'Day', id: '3' },
      weeks: { name: 'Week', id: '4' },
      months: { name: 'Day', id: '3' },
      years: { name: 'Day', id: '3' },
    };

    const mapped = nameMap[unit.name];
    return mapped ? { ...unit, name: mapped.name, id: mapped.id } : unit;
  };

  const convertUnitFromDisplay = (unit: ComboBoxOption): ComboBoxOption => {
    const idMap: { [key: string]: { name: string; id: string } } = {
      '1': { name: 'minutes', id: '0' },
      '2': { name: 'hours', id: '1' },
      '3': { name: 'days', id: '2' },
      '4': { name: 'weeks', id: '3' },
    };

    const mapped = idMap[unit.id];
    if (mapped) {
      return { ...unit, name: mapped.name, id: mapped.id };
    }

    const nameMap: { [key: string]: string } = {
      Minute: 'minutes',
      Minutes: 'minutes',
      Hour: 'hours',
      Hours: 'hours',
      Day: 'days',
      Days: 'days',
      Week: 'weeks',
      Weeks: 'weeks',
    };

    return {
      ...unit,
      name: nameMap[unit.name] || unit.name,
    };
  };

  const getInitialValues = useCallback(() => {
    const title = searchParams.get('title') || '';
    const content = searchParams.get('content') || '';
    const tokenAddress = searchParams.get('token');
    const maxTime = searchParams.get('maxTime');
    const deliveryMethod =
      searchParams.get('deliveryMethod') || deliveryMethods[0].id;
    const defaultHardcodedArbitrator = '0xa4DA2B49aDb3d1cFd1DbBB0Fb50803a2ea26cFdd';
    const arbitrator = searchParams.get('arbitrator') || defaultHardcodedArbitrator;
    const tags = searchParams.getAll('tags');
    const amount = searchParams.get('amount') || '';
    // Check for multipleApplicants param
    const multipleApplicants =
      searchParams.get('multipleApplicants') === 'false' ? false : true;

    let initialToken = tokens.find((token) => token.symbol === 'USDC');
    if (tokenAddress) {
      const foundToken = tokens.find(
        (token) => token.id.toLowerCase() === tokenAddress.toLowerCase()
      );
      if (foundToken) initialToken = foundToken;
    }

    let deadline = 1;
    let unit = unitsDeliveryTime[2];

    if (maxTime) {
      const seconds = parseInt(maxTime);
      if (!isNaN(seconds)) {
        const result = getUnitAndValueFromSeconds(seconds);
        deadline = result.value;
        unit =
          unitsDeliveryTime.find((u) => u.name === result.unit) ||
          unitsDeliveryTime[2];
      }
    }

    let category: { id: string; name: string } | undefined;
    const remainingTags: Tag[] = [];
    tags.forEach((tag, idx) => {
      const foundCategory = jobMeceTags.find((cat) => cat.id === tag);
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
      multipleApplicants,
    };
  }, [searchParams]);

  const initialValues = useMemo(() => getInitialValues(), [getInitialValues]);

  const [selectedToken, setSelectedToken] = useState<Token | undefined>(
    initialValues.token
  );
  const [showSummary, setShowSummary] = useState(false);
  const [title, setTitle] = useState<string>(initialValues.title);
  const [deliveryMethod, setDeliveryMethod] = useState(
    initialValues.deliveryMethod
  );
  const [description, setDescription] = useState<string>(initialValues.content);
  const [amount, setAmount] = useState(initialValues.amount);
  const [deadline, setDeadline] = useState<number>(initialValues.deadline || 1);
  const [imFeelingLucky, setImFeelingLucky] = useState(
    initialValues.multipleApplicants ? 'No' : 'Yes' // Inverted logic - "I'm feeling lucky" means NOT multiple applicants
  );
  const [selectedUnitTime, setselectedUnitTime] = useState<ComboBoxOption>(
    convertUnitForDisplay(initialValues.unit || unitsDeliveryTime[2])
  );
  const [tags, setTags] = useState<Tag[]>(initialValues.tags);
  const [selectedCategory, setSelectedCategory] = useState<
    { id: string; name: string } | undefined
  >(initialValues.category);
  const [selectedArbitratorAddress, setSelectedArbitratorAddress] =
    useState<string>(initialValues.arbitrator);

  const [titleError, setTitleError] = useState<string>('');
  const [descriptionError, setDescriptionError] = useState<string>('');
  const [categoryError, setCategoryError] = useState<string>('');
  const [paymentTokenError, setPaymentTokenError] = useState<string>('');
  const [arbitratorError, setArbitratorError] = useState<string>('');
  const [deadlineError, setDeadlineError] = useState<string>('');
  const [validationAttempted, setValidationAttempted] = useState(false);

  // Create wrapper divs for scroll refs
  const jobTitleRef = useRef<HTMLDivElement>(null);
  const jobDescriptionRef = useRef<HTMLDivElement>(null);
  const jobCategoryRef = useRef<HTMLDivElement>(null);
  const jobAmountRef = useRef<HTMLDivElement>(null);
  const jobDeadlineRef = useRef<HTMLDivElement>(null);
  const jobArbitratorRef = useRef<HTMLDivElement>(null);

  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isLoadingModalOpen, setIsLoadingModalOpen] = useState(false);

  const handleTransactionSubmit = useCallback(() => {
    setIsLoadingModalOpen(true);
  }, []);

  const handleTransactionComplete = useCallback(() => {
    setIsLoadingModalOpen(false);
  }, []);

  const handleBalanceUpdate = useCallback(
    (balance: string | undefined) => {
      setTokenBalance(balance);
      // Don't set balance-related errors here anymore
      // Let PaymentInput handle it internally
      // Only clear the error if it was a balance-related error
      if (
        paymentTokenError === 'Insufficient balance' ||
        paymentTokenError === 'Amount exceeds available balance'
      ) {
        setPaymentTokenError('');
      }
    },
    [paymentTokenError]
  );

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
    const value = parseFloat(paymentAmount);

    if (paymentAmount === '' || isNaN(value) || value === 0) {
      setPaymentTokenError('Please enter a valid amount');
      return;
    }

    // Don't validate balance here - let PaymentInput handle it
    // This prevents duplicate error messages
    setPaymentTokenError('');
  }, []);

  const validateArbitrator = useCallback(
    (addr: string) => {
      setSelectedArbitratorAddress(addr);
      if (addr == address) {
        setArbitratorError('You cannot be your own arbitrator');
        return;
      }
      setArbitratorError('');
    },
    [address]
  );

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
      // Only check for valid amount, not balance
      if (amount && parseFloat(amount) > 0) {
        setPaymentTokenError('');
      }
      if (deadline && !isNaN(deadline) && deadline > 0) setDeadlineError('');
      if (selectedArbitratorAddress && selectedArbitratorAddress !== address) {
        setArbitratorError('');
      }
    }
  }, [
    title,
    selectedCategory,
    amount,
    deadline,
    selectedArbitratorAddress,
    address,
    validationAttempted,
  ]);

  useEffect(() => {
    if (initialValues.title) validateTitle(initialValues.title);
    if (initialValues.amount) validatePaymentAmount(initialValues.amount);
    if (initialValues.arbitrator) validateArbitrator(initialValues.arbitrator);
    if (initialValues.deadline)
      validateDeadline(initialValues.deadline.toString());
  }, [
    initialValues.title,
    initialValues.amount,
    initialValues.arbitrator,
    initialValues.deadline,
    validateTitle,
    validatePaymentAmount,
    validateArbitrator,
    validateDeadline,
  ]);

  const handleSubmit = useCallback(() => {
    setValidationAttempted(true);
    setTitleError('');
    setDescriptionError('');
    setCategoryError('');
    setPaymentTokenError('');
    setArbitratorError('');
    setDeadlineError('');

    let hasErrors = false;
    const errorFields: Array<{
      ref: React.RefObject<HTMLDivElement | null>;
      setter: (msg: string) => void;
      message: string;
    }> = [];

    if (!title || title.length < 3) {
      const msg = !title
        ? 'Job title is required'
        : 'Job title must be at least 3 characters';
      errorFields.push({
        ref: jobTitleRef,
        setter: setTitleError,
        message: msg,
      });
      hasErrors = true;
    }

    if (!selectedCategory) {
      errorFields.push({
        ref: jobCategoryRef,
        setter: setCategoryError,
        message: 'Please select a category',
      });
      hasErrors = true;
    }

    if (!amount || parseFloat(amount) <= 0) {
      errorFields.push({
        ref: jobAmountRef,
        setter: setPaymentTokenError,
        message: 'Please enter a valid payment amount',
      });
      hasErrors = true;
    } else if (tokenBalance) {
      // Check for insufficient balance
      const amountValue = parseFloat(amount);
      const balanceValue = parseFloat(tokenBalance);
      if (
        !isNaN(amountValue) &&
        !isNaN(balanceValue) &&
        amountValue > balanceValue
      ) {
        // Don't set an error here - PaymentInput will handle the display
        // But we still prevent submission
        errorFields.push({
          ref: jobAmountRef,
          setter: () => {}, // No-op setter since PaymentInput handles the error
          message: '', // Empty message
        });
        hasErrors = true;
      }
    }

    if (!deadline || isNaN(deadline) || deadline <= 0) {
      errorFields.push({
        ref: jobDeadlineRef,
        setter: setDeadlineError,
        message: 'Please enter a valid deadline',
      });
      hasErrors = true;
    }

    if (selectedArbitratorAddress && selectedArbitratorAddress === address) {
      errorFields.push({
        ref: jobArbitratorRef,
        setter: setArbitratorError,
        message: 'You cannot be your own arbitrator',
      });
      hasErrors = true;
    }

    if (hasErrors) {
      errorFields.forEach(({ setter, message }) => {
        if (message) setter(message);
      });
      if (errorFields.length > 0 && errorFields[0].ref.current) {
        errorFields[0].ref.current.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
      return;
    }

    handleSummary();
  }, [
    title,
    amount,
    tokenBalance,
    selectedCategory,
    deadline,
    selectedArbitratorAddress,
    address,
    handleSummary,
  ]);

  return (
    <div className='relative min-h-screen overflow-x-hidden'>
      {/* Background blur elements */}
      <div className='pointer-events-none fixed right-4 top-40 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl sm:right-20 sm:h-96 sm:w-96' />
      <div className='pointer-events-none fixed bottom-40 left-4 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl sm:left-20 sm:h-96 sm:w-96' />

      {!showSummary && (
        <Fieldset className='relative w-full px-2 sm:px-0'>
          <div className='mb-10'>
            <div className='mb-4 flex items-center gap-3'>
              <div className='flex-shrink-0 rounded-xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-3 backdrop-blur-sm'>
                <PiPaperPlaneTilt className='h-7 w-7 text-blue-500' />
              </div>
              <div className='min-w-0 flex-1'>
                <h1 className='text-2xl font-bold text-gray-900 sm:text-3xl dark:text-gray-100'>
                  Create a Job Post
                </h1>
                <span className='block text-sm text-gray-600 sm:text-base dark:text-gray-400'>
                  Complete the form below to post your job and connect with
                  potential candidates.
                </span>
              </div>
            </div>
            <div className='mt-6 flex gap-2'>
              <div className='h-1 flex-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500' />
              <div className='h-1 flex-1 rounded-full bg-gray-200 dark:bg-gray-700' />
            </div>
          </div>

          <div className='flex w-full flex-col gap-8 lg:flex-row lg:gap-12'>
            <div className='min-w-0 flex-1'>
              <div className='rounded-2xl border border-gray-200/50 bg-white/50 p-3 shadow-xl backdrop-blur-xl sm:p-6 dark:border-gray-700/50 dark:bg-gray-900/50'>
                <h2 className='mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100'>
                  <PiBriefcase className='h-5 w-5 flex-shrink-0 text-blue-500' />
                  <span className='min-w-0'>Job Details</span>
                </h2>

                <FieldGroup className='space-y-6'>
                  <div ref={jobTitleRef} className='scroll-mt-24'>
                    <MinimalField
                      error={titleError}
                      label='Job Title'
                      helperText='A short descriptive title for the job post'
                      required
                    >
                      <Input
                        name='title'
                        value={title}
                        placeholder='e.g., Build a React dashboard'
                        required
                        minLength={3}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          validateTitle(e.target.value)
                        }
                        className={`bg-white/50 dark:bg-gray-800/50 ${titleError ? '!border-red-500' : ''}`}
                        data-invalid={titleError ? true : undefined}
                      />
                    </MinimalField>
                  </div>

                  <div ref={jobDescriptionRef} className='scroll-mt-24'>
                    <MinimalField
                      error={descriptionError}
                      label='Description'
                      helperText='Provide a thorough description of the job'
                    >
                      <Textarea
                        rows={10}
                        name='description'
                        placeholder='Describe what needs to be done, deliverables, requirements...'
                        value={description}
                        onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                          setDescription(e.target.value)
                        }
                        className={`bg-white/50 dark:bg-gray-800/50 ${descriptionError ? '!border-red-500' : ''}`}
                        data-invalid={descriptionError ? true : undefined}
                      />
                    </MinimalField>
                  </div>

                  <div className='rounded-xl border border-blue-500/10 bg-gradient-to-r from-blue-500/5 to-purple-500/5 p-4'>
                    <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                      <div className='min-w-0 flex-1'>
                        <Label className='flex items-center gap-2 text-gray-700 dark:text-gray-300'>
                          <PiSparkle className='h-4 w-4 flex-shrink-0 text-yellow-500' />
                          <span>I&apos;m feeling lucky</span>
                        </Label>
                        <p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
                          Auto-accept the first worker who applies (no approval
                          needed)
                        </p>
                      </div>
                      <RadioGroup
                        className='!mt-0 flex gap-4'
                        value={imFeelingLucky}
                        onChange={setImFeelingLucky}
                        aria-label='Auto-accept workers'
                      >
                        {noYesOptions.map((option) => (
                          <Field
                            className='!mt-0 flex items-center'
                            key={option.id}
                          >
                            <Radio
                              className='mr-2'
                              color='default'
                              value={option.name}
                            />
                            <Label className='text-gray-700 dark:text-gray-300'>
                              {option.name}
                            </Label>
                          </Field>
                        ))}
                      </RadioGroup>
                    </div>
                  </div>

                  <div ref={jobCategoryRef} className='scroll-mt-24'>
                    <MinimalField
                      error={categoryError}
                      label='Category'
                      icon={<PiTag className='h-4 w-4' />}
                      helperText='Select the category that best describes your job'
                      required
                    >
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
                  </div>

                  <MinimalField
                    label='Tags'
                    helperText='Add relevant tags to help workers find your job'
                  >
                    <TagsInput tags={tags} setTags={setTags} />
                  </MinimalField>
                </FieldGroup>
              </div>
            </div>

            <div className='min-w-0 flex-1'>
              <div className='rounded-2xl border border-gray-200/50 bg-white/50 p-3 shadow-xl backdrop-blur-xl sm:p-6 dark:border-gray-700/50 dark:bg-gray-900/50'>
                <h2 className='mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100'>
                  <PiCurrencyDollar className='h-5 w-5 flex-shrink-0 text-green-500' />
                  <span className='min-w-0'>Payment & Delivery</span>
                </h2>

                <FieldGroup className='space-y-6'>
                  <div ref={jobAmountRef} className='scroll-mt-24'>
                    <MinimalField
                      error={paymentTokenError}
                      label='Payment Amount'
                      icon={<PiCurrencyDollar className='h-4 w-4' />}
                      helperText='Set the payment amount for this job'
                      required
                    >
                      <PaymentInput
                        amount={amount}
                        onAmountChange={validatePaymentAmount}
                        selectedToken={selectedToken}
                        onTokenSelect={setSelectedToken}
                        onBalanceUpdate={handleBalanceUpdate}
                        placeholder='Enter amount'
                        required
                        validateAmount={true}
                      />
                    </MinimalField>
                  </div>

                  <MinimalField
                    label='Delivery Method'
                    icon={<PiTruck className='h-4 w-4' />}
                    helperText='Choose how the work should be delivered'
                  >
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

                  <div ref={jobDeadlineRef} className='scroll-mt-24'>
                    <MinimalField
                      error={deadlineError}
                      label='Delivery Timeline'
                      icon={<PiClock className='h-4 w-4' />}
                      helperText='Set the expected delivery time for this job'
                      required
                    >
                      <DeliveryTimelineInput
                        value={deadline}
                        onValueChange={validateDeadline}
                        selectedUnit={selectedUnitTime}
                        onUnitChange={(unit) => setselectedUnitTime(unit)}
                        placeholder='Enter time'
                      />
                    </MinimalField>
                  </div>

                  <div ref={jobArbitratorRef} className='scroll-mt-24'>
                    <MinimalField
                      error={arbitratorError}
                      label='Dispute Resolution'
                      icon={<PiScales className='h-4 w-4' />}
                      helperText='Select an arbitrator for third-party dispute resolution (optional)'
                    >
                      <ArbitratorSelector
                        arbitrators={arbitrators || []}
                        selectedAddress={selectedArbitratorAddress}
                        onChange={validateArbitrator}
                        disabled={false}
                        showExternalLink={true}
                        showNoArbitrator={true}
                      />
                    </MinimalField>
                  </div>
                </FieldGroup>
              </div>
            </div>
          </div>

          {!showSummary && (
            <div className='mt-8 flex justify-end gap-4 px-2 pb-20 sm:px-0'>
              {isConnected ? (
                <button
                  onClick={handleSubmit}
                  className='group relative rounded-xl border border-white/10 bg-slate-800 px-6 py-3 font-medium shadow-lg transition-all duration-200 hover:bg-slate-700 sm:px-8'
                >
                  <span className='relative flex items-center gap-2 text-white'>
                    <span className='text-white'>Continue to Review</span>
                    <ArrowRight className='h-4 w-4 text-white transition-transform group-hover:translate-x-0.5' />
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
          deadline={convertToSeconds(
            deadline,
            convertUnitFromDisplay(selectedUnitTime).name
          )}
          selectedArbitratorAddress={selectedArbitratorAddress}
          onTransactionStart={handleTransactionSubmit}
          onTransactionComplete={handleTransactionComplete}
        />
      )}

      <RegisterModal
        open={isRegisterModalOpen}
        close={() => setIsRegisterModalOpen(false)}
      />
      <LoadingModal
        open={isLoadingModalOpen}
        close={() => setIsLoadingModalOpen(false)}
      />
      <AddToHomescreen />
    </div>
  );
};

export default PostJob;
