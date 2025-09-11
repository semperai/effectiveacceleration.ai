import { Button } from '@/components/Button';
import useArbitrators from '@/hooks/subsquid/useArbitrators';
import { useConfig } from '@/hooks/useConfig';
import { useToast } from '@/hooks/useToast';
import { useWriteContractWithNotifications } from '@/hooks/useWriteContractWithNotifications';
import type { ComboBoxOption, Tag } from '@/service/FormsTypes';
import { jobMeceTags, deliveryMethods, noYesOptions } from '@/lib/constants';
import {
  convertToSeconds,
  getUnitAndValueFromSeconds,
  unitsDeliveryTime,
  tokenIcon,
  tokensMap,
} from '@/lib/utils';
import {
  getFromIpfs,
  type Job,
  publishToIpfs,
} from '@effectiveacceleration/contracts';
import { MARKETPLACE_V1_ABI } from '@effectiveacceleration/contracts/wagmi/MarketplaceV1';
import { Dialog, Transition } from '@headlessui/react';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import {
  PiSparkle,
  PiFileText,
  PiTag,
  PiCurrencyDollar,
  PiClock,
  PiScales,
  PiPencilSimple,
  PiInfo,
  PiTruck,
  PiBriefcase,
  PiUsersThree,
  PiLockKey,
} from 'react-icons/pi';
import * as Sentry from '@sentry/nextjs';
import { formatUnits, parseUnits, ZeroHash } from 'ethers';
import {
  type ChangeEvent,
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { zeroAddress } from 'viem';
import Image from 'next/image';
import { FieldGroup } from '@/components/Fieldset';
import { Input } from '@/components/Input';
import { Textarea } from '@/components/Textarea';
import ListBox from '@/components/ListBox';
import TagsInput from '@/components/TagsInput';
import { PaymentInput } from '@/components/PaymentInput';
import { DeliveryTimelineInput } from '@/components/DeliveryTimelineInput';
import { ArbitratorSelector } from '@/components/ArbitratorSelector';
import MinimalField from '@/components/MinimalField';
import { tokens as appTokens, type Token } from '@/lib/tokens';

export type UpdateButtonProps = {
  address: string | undefined;
  job: Job;
};

export function UpdateButton({
  address,
  job,
  ...rest
}: UpdateButtonProps & React.ComponentPropsWithoutRef<'div'>) {
  const Config = useConfig();
  const { data: arbitrators } = useArbitrators();
  const { showError, showSuccess, showLoading, toast } = useToast();
  const loadingToastIdRef = useRef<string | number | null>(null);

  // Find the token from the job
  const jobToken =
    appTokens.find(
      (token) => token.id.toLowerCase() === job.token.toLowerCase()
    ) || appTokens.find((token) => token.symbol === 'USDC');

  // State management
  const [title, setTitle] = useState<string>(job.title);
  const [titleError, setTitleError] = useState('');
  const [tagsError, setTagsError] = useState('');
  const [amountError, setAmountError] = useState('');
  const [deadlineError, setDeadlineError] = useState('');
  const [arbitratorError, setArbitratorError] = useState('');
  const [categoryError, setCategoryError] = useState('');
  const [validationAttempted, setValidationAttempted] = useState(false);

  const [tags, setTags] = useState<Tag[]>(
    job.tags.slice(1).map((tag, idx) => ({ id: Date.now() + idx, name: tag }))
  );
  const [amount, setAmount] = useState<string>(
    formatUnits(job.amount, tokensMap[job.token]?.decimals)
  );
  const [selectedToken, setSelectedToken] = useState<Token | undefined>(
    jobToken
  );
  const [tokenBalance, setTokenBalance] = useState<string | undefined>(
    undefined
  );

  const [deadline, setDeadline] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<{
    id: string;
    name: string;
  }>();
  const [selectedUnitTime, setSelectedUnitTime] = useState<ComboBoxOption>(
    unitsDeliveryTime[2]
  );

  const [deliveryMethod, setDeliveryMethod] = useState(deliveryMethods[0].id);

  const whitelistWorkersValues = ['Yes', 'No'];
  const [whitelistWorkers, setWhitelistWorkers] = useState<string>(
    job.whitelistWorkers ? whitelistWorkersValues[0] : whitelistWorkersValues[1]
  );

  // Read-only "I'm feeling lucky" status - inverted from multipleApplicants
  const imFeelingLucky = !job.multipleApplicants;

  const [content, setContent] = useState<string>(job.content!);
  const [selectedArbitratorAddress, setSelectedArbitratorAddress] =
    useState<string>(job.roles.arbitrator);

  const [isUpdating, setIsUpdating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Create wrapper divs for scroll refs
  const jobTitleRef = useRef<HTMLDivElement>(null);
  const jobDescriptionRef = useRef<HTMLDivElement>(null);
  const jobCategoryRef = useRef<HTMLDivElement>(null);
  const jobAmountRef = useRef<HTMLDivElement>(null);
  const jobDeadlineRef = useRef<HTMLDivElement>(null);
  const jobArbitratorRef = useRef<HTMLDivElement>(null);

  const { writeContractWithNotifications, isConfirming, isConfirmed, error } =
    useWriteContractWithNotifications();

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

  useEffect(() => {
    if (job.tags) {
      setSelectedCategory(
        jobMeceTags.find((category) => category.id === job.tags[0])
      );
      let { unit, value } = getUnitAndValueFromSeconds(job?.maxTime);
      if (unit && value) {
        value = Math.ceil(value);
        setDeadline(value);
        const unitDelivery = unitsDeliveryTime.find(
          (option) => option.name === unit
        );
        const displayUnit = unitDelivery
          ? convertUnitForDisplay(unitDelivery)
          : convertUnitForDisplay(unitsDeliveryTime[2]);
        setSelectedUnitTime(displayUnit);
      }
    }
  }, [job]);

  const dismissLoadingToast = useCallback(() => {
    if (loadingToastIdRef.current !== null) {
      toast.dismiss(loadingToastIdRef.current);
      loadingToastIdRef.current = null;
    }
  }, [toast]);

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
      setAmountError('Please enter a valid amount');
      return;
    }

    setAmountError('');
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
      setDeadlineError('This field is required');
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

  const handleBalanceUpdate = useCallback(
    (balance: string | undefined) => {
      setTokenBalance(balance);
      if (
        amountError === 'Insufficient balance' ||
        amountError === 'Amount exceeds available balance'
      ) {
        setAmountError('');
      }
    },
    [amountError]
  );

  const handleSubmit = useCallback(async () => {
    setValidationAttempted(true);
    setTitleError('');
    setCategoryError('');
    setAmountError('');
    setDeadlineError('');
    setArbitratorError('');

    let hasErrors = false;
    const errorFields: Array<{
      ref: React.RefObject<HTMLDivElement>;
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
        setter: setAmountError,
        message: 'Please enter a valid payment amount',
      });
      hasErrors = true;
    } else if (tokenBalance) {
      const amountValue = parseFloat(amount);
      const balanceValue = parseFloat(tokenBalance);
      if (
        !isNaN(amountValue) &&
        !isNaN(balanceValue) &&
        amountValue > balanceValue
      ) {
        errorFields.push({
          ref: jobAmountRef,
          setter: () => {},
          message: '',
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

    // Proceed with update
    setIsUpdating(true);
    let contentHash = ZeroHash;

    if (content.length > 0) {
      dismissLoadingToast();
      loadingToastIdRef.current = showLoading('Publishing job post to IPFS...');
      try {
        const { hash } = await publishToIpfs(content);
        contentHash = hash;
      } catch (err) {
        Sentry.captureException(err);
        dismissLoadingToast();
        showError('Failed to publish job post to IPFS');
        setIsUpdating(false);
        return;
      }
      dismissLoadingToast();
      showSuccess('Job post published to IPFS');
    }

    const rawAmount = parseUnits(amount, tokensMap[job.token]?.decimals);
    const deadlineInSeconds = deadline
      ? convertToSeconds(
          deadline,
          convertUnitFromDisplay(selectedUnitTime).name
        )
      : 0;

    try {
      await writeContractWithNotifications({
        abi: MARKETPLACE_V1_ABI,
        address: Config!.marketplaceAddress,
        functionName: 'updateJobPost',
        args: [
          BigInt(job.id!),
          title,
          contentHash,
          [selectedCategory?.id || '', ...tags.map((tag) => tag.name)],
          rawAmount,
          deadlineInSeconds,
          selectedArbitratorAddress,
          whitelistWorkers === whitelistWorkersValues[0],
        ],
      });
      closeModal();
    } catch (err: any) {
      Sentry.captureException(err);
      showError(`Error updating job: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  }, [
    title,
    amount,
    tokenBalance,
    selectedCategory,
    deadline,
    selectedArbitratorAddress,
    address,
    content,
    tags,
    selectedUnitTime,
    whitelistWorkers,
    job,
    Config,
    showLoading,
    showSuccess,
    showError,
    dismissLoadingToast,
    writeContractWithNotifications,
  ]);

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }

  return (
    <>
      {/* Enhanced Button with gradient and hover effects */}
      <button
        disabled={isUpdating || isConfirming}
        onClick={() => openModal()}
        className='group relative w-full rounded-xl border border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-lg hover:shadow-gray-200/50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none dark:border-gray-700 dark:from-gray-800/50 dark:to-gray-900/50 dark:hover:border-gray-600 dark:hover:shadow-black/30'
      >
        <div className='flex items-center justify-center gap-2'>
          <PiPencilSimple className='h-4 w-4 text-gray-600 transition-colors group-hover:text-gray-800 dark:text-gray-400 dark:group-hover:text-gray-200' />
          <span className='text-sm font-medium text-gray-700 transition-colors group-hover:text-gray-900 dark:text-gray-300 dark:group-hover:text-gray-100'>
            Edit Details
          </span>
        </div>
        <div className='absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-purple-500/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100' />
      </button>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as='div' className='relative z-50' onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter='ease-out duration-300'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='ease-in duration-200'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <div className='fixed inset-0 bg-black/70 backdrop-blur-md' />
          </Transition.Child>

          <div className='fixed inset-0 overflow-y-auto'>
            <div className='flex min-h-full items-center justify-center p-4'>
              <Transition.Child
                as={Fragment}
                enter='ease-out duration-300'
                enterFrom='opacity-0 scale-95 translate-y-4'
                enterTo='opacity-100 scale-100 translate-y-0'
                leave='ease-in duration-200'
                leaveFrom='opacity-100 scale-100 translate-y-0'
                leaveTo='opacity-0 scale-95 translate-y-4'
              >
                <Dialog.Panel className='relative w-full max-w-5xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-900 dark:to-black'>
                  {/* Enhanced gradient orbs */}
                  <div className='absolute -left-40 -top-40 h-96 w-96 animate-pulse rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 blur-3xl' />
                  <div className='absolute -bottom-40 -right-40 h-96 w-96 animate-pulse rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 blur-3xl' />

                  {/* Content */}
                  <div className='relative'>
                    {/* Enhanced Header */}
                    <div className='relative overflow-hidden'>
                      <div className='absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-blue-500/5' />
                      <div className='relative flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-800'>
                        <div className='flex items-center gap-4'>
                          <div className='relative'>
                            <div className='absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 opacity-50 blur-xl' />
                            <div className='relative rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 p-3'>
                              <PiSparkle className='h-6 w-6 text-white' />
                            </div>
                          </div>
                          <div className='text-left'>
                            <Dialog.Title className='text-xl font-bold text-gray-900 dark:text-white'>
                              Update Job Details
                            </Dialog.Title>
                            <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
                              Make changes to your job posting
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={closeModal}
                          className='rounded-xl bg-gray-100 p-2.5 text-gray-500 transition-all duration-200 hover:bg-gray-200 hover:text-gray-700 dark:bg-gray-800/50 dark:text-gray-400 dark:hover:bg-gray-700/50 dark:hover:text-white'
                        >
                          <XMarkIcon className='h-5 w-5' />
                        </button>
                      </div>
                    </div>

                    {/* Enhanced Form Content */}
                    <div className='max-h-[70vh] overflow-y-auto p-8'>
                      <div className='flex w-full flex-col gap-8 lg:flex-row lg:gap-12'>
                        {/* Left Column */}
                        <div className='min-w-0 flex-1'>
                          <div className='rounded-2xl border border-gray-200/50 bg-white/50 p-6 shadow-xl backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-900/50'>
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
                                    onChange={(
                                      e: ChangeEvent<HTMLInputElement>
                                    ) => validateTitle(e.target.value)}
                                    className={`bg-white/50 dark:bg-gray-800/50 ${titleError ? '!border-red-500' : ''}`}
                                    data-invalid={titleError ? true : undefined}
                                  />
                                </MinimalField>
                              </div>

                              <div
                                ref={jobDescriptionRef}
                                className='scroll-mt-24'
                              >
                                <MinimalField
                                  label='Description'
                                  helperText='Provide a thorough description of the job'
                                >
                                  <Textarea
                                    rows={10}
                                    name='description'
                                    placeholder='Describe what needs to be done, deliverables, requirements...'
                                    value={content}
                                    onChange={(
                                      e: ChangeEvent<HTMLTextAreaElement>
                                    ) => setContent(e.target.value)}
                                    className='bg-white/50 dark:bg-gray-800/50'
                                  />
                                </MinimalField>
                              </div>

                              {/* Read-only I'm Feeling Lucky Status */}
                              <div className='rounded-xl border border-yellow-500/20 bg-gradient-to-r from-yellow-500/5 to-orange-500/5 p-4'>
                                <div className='flex items-center justify-between'>
                                  <div className='flex items-center gap-2'>
                                    <PiSparkle className='h-4 w-4 flex-shrink-0 text-yellow-500' />
                                    <div>
                                      <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                                        I&apos;m Feeling Lucky
                                      </span>
                                      <p className='mt-0.5 text-xs text-gray-500 dark:text-gray-400'>
                                        {imFeelingLucky
                                          ? 'First worker to apply will be auto-accepted'
                                          : 'You manually review and approve workers'}
                                      </p>
                                    </div>
                                  </div>
                                  <div className='flex items-center gap-2'>
                                    <span
                                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                                        imFeelingLucky
                                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                          : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                      }`}
                                    >
                                      {imFeelingLucky
                                        ? 'Enabled ✨'
                                        : 'Disabled'}
                                    </span>
                                    <PiLockKey
                                      className='h-4 w-4 text-gray-400'
                                      title='Cannot be changed after job creation'
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* Whitelist Workers - Editable */}
                              <div className='rounded-xl border border-blue-500/10 bg-gradient-to-r from-blue-500/5 to-purple-500/5 p-4'>
                                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                                  <div className='min-w-0 flex-1'>
                                    <div className='flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300'>
                                      <PiUsersThree className='h-4 w-4 flex-shrink-0 text-blue-500' />
                                      <span>Whitelist Workers</span>
                                    </div>
                                    <p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
                                      Restrict who can apply to work on your job
                                    </p>
                                  </div>
                                  <div className='flex gap-4'>
                                    {whitelistWorkersValues.map((option) => (
                                      <label
                                        key={option}
                                        className='flex cursor-pointer items-center'
                                      >
                                        <input
                                          type='radio'
                                          name='whitelistWorkers'
                                          value={option}
                                          checked={whitelistWorkers === option}
                                          onChange={(e) =>
                                            setWhitelistWorkers(e.target.value)
                                          }
                                          className='mr-2 border-gray-300 text-blue-600 focus:ring-blue-500'
                                        />
                                        <span className='text-sm text-gray-700 dark:text-gray-300'>
                                          {option}
                                        </span>
                                      </label>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              <div
                                ref={jobCategoryRef}
                                className='scroll-mt-24'
                              >
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

                        {/* Right Column */}
                        <div className='min-w-0 flex-1'>
                          <div className='rounded-2xl border border-gray-200/50 bg-white/50 p-6 shadow-xl backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-900/50'>
                            <h2 className='mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100'>
                              <PiCurrencyDollar className='h-5 w-5 flex-shrink-0 text-green-500' />
                              <span className='min-w-0'>
                                Payment & Delivery
                              </span>
                            </h2>

                            <FieldGroup className='space-y-6'>
                              <div ref={jobAmountRef} className='scroll-mt-24'>
                                <MinimalField
                                  error={amountError}
                                  label='Payment Amount'
                                  icon={
                                    <PiCurrencyDollar className='h-4 w-4' />
                                  }
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
                                    disableTokenChange={true}
                                    showTokenSymbol={true}
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

                              <div
                                ref={jobDeadlineRef}
                                className='scroll-mt-24'
                              >
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
                                    onUnitChange={(unit) =>
                                      setSelectedUnitTime(unit)
                                    }
                                    placeholder='Enter time'
                                  />
                                </MinimalField>
                              </div>

                              <div
                                ref={jobArbitratorRef}
                                className='scroll-mt-24'
                              >
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
                    </div>

                    {/* Enhanced Footer */}
                    <div className='relative overflow-hidden'>
                      <div className='absolute inset-0 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50' />
                      <div className='relative border-t border-gray-200 p-6 dark:border-gray-800'>
                        <div className='flex items-center justify-between'>
                          <p className='text-sm text-gray-500 dark:text-gray-400'>
                            <PiInfo className='mr-1 inline h-4 w-4' />
                            Changes will be published to the blockchain
                          </p>
                          <div className='flex gap-3'>
                            <button
                              onClick={closeModal}
                              className='rounded-xl border border-gray-200 bg-gray-100 px-6 py-2.5 text-sm font-medium text-gray-700 transition-all duration-200 hover:border-gray-300 hover:bg-gray-200 active:scale-[0.98] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:bg-gray-700'
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleSubmit}
                              disabled={isUpdating || isConfirming}
                              className='rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/25 transition-all duration-200 hover:-translate-y-0.5 hover:from-blue-600 hover:to-purple-600 hover:shadow-xl hover:shadow-blue-500/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50'
                            >
                              {isUpdating || isConfirming ? (
                                <span className='flex items-center gap-2'>
                                  <svg
                                    className='h-4 w-4 animate-spin'
                                    fill='none'
                                    viewBox='0 0 24 24'
                                  >
                                    <circle
                                      className='opacity-25'
                                      cx='12'
                                      cy='12'
                                      r='10'
                                      stroke='currentColor'
                                      strokeWidth='4'
                                    />
                                    <path
                                      className='opacity-75'
                                      fill='currentColor'
                                      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z'
                                    />
                                  </svg>
                                  Updating...
                                </span>
                              ) : (
                                <span className='flex items-center gap-2 text-white'>
                                  <CheckIcon className='h-4 w-4' />
                                  Update Job
                                </span>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
