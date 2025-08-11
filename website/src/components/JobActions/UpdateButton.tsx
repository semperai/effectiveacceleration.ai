import { Button } from '@/components/Button';
import useArbitrators from '@/hooks/subsquid/useArbitrators';
import { useConfig } from '@/hooks/useConfig';
import { useToast } from '@/hooks/useToast';
import { useWriteContractWithNotifications } from '@/hooks/useWriteContractWithNotifications';
import type { ComboBoxOption, Tag } from '@/service/FormsTypes';
import { tokenIcon, tokensMap } from '@/lib/tokens';
import { jobMeceTags } from '@/lib/constants';
import {
  convertToSeconds,
  getUnitAndValueFromSeconds,
  unitsDeliveryTime,
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
  PiHash,
  PiCurrencyDollar,
  PiClock,
  PiUser,
  PiWarning,
  PiPencilSimple,
  PiArrowRight,
  PiInfo,
  PiCoins,
  PiTimer,
  PiUsersThree,
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
import { Field, Label, Description, FieldGroup } from '../Fieldset';
import { Input } from '../Input';
import { Textarea } from '../Textarea';
import ListBox from '../ListBox';
import TagsInput from '../TagsInput';
import { Combobox } from '../ComboBox';

export type UpdateButtonProps = {
  address: string | undefined;
  job: Job;
};

type FieldValidation = {
  required?: boolean;
  minLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => string;
};

const validateField = (value: string, validation: FieldValidation): string => {
  if (validation.required && !value) {
    return 'This field is required';
  }
  if (validation.minLength && value.length < validation.minLength) {
    return `Must be at least ${validation.minLength} characters long`;
  }
  if (validation.pattern && !validation.pattern.test(value)) {
    return 'Invalid format';
  }
  if (validation.custom) {
    return validation.custom(value);
  }
  return '';
};

const handleInputChange =
  (
    setter: React.Dispatch<React.SetStateAction<string>>,
    errorSetter: React.Dispatch<React.SetStateAction<string>>,
    validation: FieldValidation
  ) =>
  (e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setter(value);
    const errorMessage = validateField(value, validation);
    errorSetter(errorMessage);
  };

// Enhanced Section Header Component
const SectionHeader = ({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: any;
  title: string;
  subtitle?: string;
}) => (
  <div className='mb-6 border-b border-gray-100 pb-4 dark:border-gray-800'>
    <div className='flex items-center gap-3'>
      <div className='rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 p-2 dark:from-blue-950/30 dark:to-purple-950/30'>
        <Icon className='h-5 w-5 text-blue-600 dark:text-blue-400' />
      </div>
      <div>
        <h3 className='text-base font-semibold text-gray-900 dark:text-white'>
          {title}
        </h3>
        {subtitle && (
          <p className='mt-0.5 text-xs text-gray-500 dark:text-gray-400'>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  </div>
);

// Enhanced Field Component with better styling
const EnhancedField = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`group relative ${className}`}>
    <div className='absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-purple-500/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100' />
    <div className='relative'>{children}</div>
  </div>
);

// Styled Radio Group with modern design
const StyledRadioGroup = ({
  label,
  options,
  value,
  onChange,
  description,
  icon: Icon,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  description?: string;
  icon?: any;
}) => (
  <EnhancedField>
    <Field>
      <div className='mb-2 flex flex-row items-center justify-between'>
        <Label className='mb-0 flex items-center gap-2 pb-0'>
          {Icon && (
            <Icon className='h-4 w-4 text-gray-500 dark:text-gray-400' />
          )}
          {label}
        </Label>
        <div className='flex gap-2'>
          {options.map((option) => (
            <button
              key={option}
              type='button'
              onClick={() => onChange(option)}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition-all duration-200 ${
                value === option
                  ? 'border-transparent bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/25'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-400 dark:hover:border-gray-600'
              } `}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
      {description && <Description>{description}</Description>}
    </Field>
  </EnhancedField>
);

export function UpdateButton({
  address,
  job,
  ...rest
}: UpdateButtonProps & React.ComponentPropsWithoutRef<'div'>) {
  const Config = useConfig();
  const [title, setTitle] = useState<string>(job.title);
  const [titleError, setTitleError] = useState('');
  const [tagsError, setTagsError] = useState('');
  const [amountError, setAmountError] = useState('');
  const [maxJobTimeError, setMaxJobTimeError] = useState('');
  const [tags, setTags] = useState<Tag[]>(
    job.tags.slice(1).map((tag, idx) => ({ id: Date.now() + idx, name: tag }))
  );
  const [amount, setAmount] = useState<string>(
    formatUnits(job.amount, tokensMap[job.token]?.decimals)
  );
  const [maxTime, setMaxTime] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<{
    id: string;
    name: string;
  }>();
  const [selectedUnitTime, setSelectedUnitTime] = useState<ComboBoxOption>(
    unitsDeliveryTime[2]
  );
  const [deadlineError, setDeadlineError] = useState<string>('');
  const whitelistWorkersValues = ['Yes', 'No'];
  const [whitelistWorkers, setWhitelistWorkers] = useState<string>(
    job.whitelistWorkers ? whitelistWorkersValues[0] : whitelistWorkersValues[1]
  );

  const [content, setContent] = useState<string>(job.content!);
  const { data: arbitrators } = useArbitrators();
  const excludes = [address];
  const arbitratorList = [
    { address_: zeroAddress, name: 'None', fee: '0' },
    ...Object.values(arbitrators ?? {}).filter(
      (user) => !excludes.includes(user.address_)
    ),
  ];
  const [selectedArbitratorAddress, setSelectedArbitratorAddress] =
    useState<string>(job.roles.arbitrator);

  const [isUpdating, setIsUpdating] = useState(false);
  const { showError, showSuccess, showLoading, toast } = useToast();

  const loadingToastIdRef = useRef<string | number | null>(null);

  // Cleanup function for dismissing loading toasts
  const dismissLoadingToast = useCallback(() => {
    if (loadingToastIdRef.current !== null) {
      toast.dismiss(loadingToastIdRef.current);
      loadingToastIdRef.current = null;
    }
  }, [toast]);

  const { writeContractWithNotifications, isConfirming, isConfirmed, error } =
    useWriteContractWithNotifications();

  useEffect(() => {
    if (job.tags) {
      setSelectedCategory(
        jobMeceTags.find((category) => category.id === job.tags[0])
      );
      let { unit, value } = getUnitAndValueFromSeconds(job?.maxTime);
      if (unit && value) {
        value = Math.ceil(value);
        setMaxTime(value);
        const unitDelivery = unitsDeliveryTime.find(
          (option) => option.name === unit
        );
        setSelectedUnitTime(unitDelivery || unitsDeliveryTime[0]);
      }
    }
  }, [job]);

  async function handleUpdate() {
    setIsUpdating(true);
    // Validate all fields before submission
    const titleValidationMessage = validateField(title, {
      required: true,
      minLength: 3,
    });

    const tagsValidationMessage =
      tags.length === 0 ? 'At least one tag is required' : '';
    setTagsError(tagsValidationMessage);

    const amountValidationMessage = validateField(amount, {
      required: true,
      custom: (value) =>
        parseFloat(value) > 0 ? '' : 'Amount must be greater than 0',
    });
    setAmountError(amountValidationMessage);

    const maxJobTimeValidationMessage = validateField(maxTime.toString(), {
      required: true,
      custom: (value) =>
        parseFloat(value) > 0 ? '' : 'Must be greater than 0',
    });
    setMaxJobTimeError(maxJobTimeValidationMessage);
    setTitleError(titleValidationMessage);

    if (
      !titleValidationMessage &&
      !tagsValidationMessage &&
      !amountValidationMessage &&
      !maxJobTimeValidationMessage
    ) {
      let contentHash = ZeroHash;

      if (content.length > 0) {
        dismissLoadingToast();
        loadingToastIdRef.current = showLoading(
          'Publishing job post to IPFS...'
        );
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
      const deadlineInSeconds = maxTime
        ? convertToSeconds(maxTime, selectedUnitTime.name)
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
      } catch (err: any) {
        Sentry.captureException(err);
        showError(`Error updating job: ${err.message}`);
      } finally {
        setIsUpdating(false);
      }
    } else {
      setIsUpdating(false);
      console.log('Form has errors');
    }
  }

  const [isOpen, setIsOpen] = useState(false);

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }

  const validateDeadline = (deadlineStr: string) => {
    if (deadlineStr === '') {
      setMaxTime(0);
      setDeadlineError('This field is required');
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

    setMaxTime(deadline);
    setDeadlineError('');
  };

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
        {/* Subtle gradient overlay on hover */}
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
                      {/* Header gradient background */}
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
                      {/* Job Details Section */}
                      <div className='mb-8'>
                        <SectionHeader
                          icon={PiFileText}
                          title='Job Information'
                          subtitle='Basic details about your job posting'
                        />

                        <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                          <EnhancedField className='lg:col-span-2'>
                            <Field>
                              <Label>Job Title</Label>
                              <Input
                                value={title}
                                placeholder='Enter a descriptive job title'
                                onChange={handleInputChange(
                                  setTitle,
                                  setTitleError,
                                  {
                                    required: true,
                                    minLength: 3,
                                  }
                                )}
                                className='transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-600'
                              />
                              {titleError && (
                                <div className='mt-1 flex items-center gap-1 text-xs text-red-500 dark:text-red-400'>
                                  <PiWarning className='h-3 w-3' />
                                  {titleError}
                                </div>
                              )}
                            </Field>
                          </EnhancedField>

                          <EnhancedField className='lg:col-span-2'>
                            <Field>
                              <Label>Description</Label>
                              <Textarea
                                rows={5}
                                value={content}
                                onChange={(
                                  e: ChangeEvent<HTMLTextAreaElement>
                                ) => setContent(e.target.value)}
                                placeholder='Provide detailed information about the job requirements, deliverables, and expectations...'
                                className='transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-600'
                              />
                            </Field>
                          </EnhancedField>

                          <EnhancedField>
                            <Field>
                              <Label>Category</Label>
                              <ListBox
                                placeholder='Select Category'
                                value={selectedCategory}
                                onChange={(category) => {
                                  if (typeof category !== 'string') {
                                    setSelectedCategory(category);
                                  }
                                }}
                                options={jobMeceTags}
                              />
                            </Field>
                          </EnhancedField>

                          <EnhancedField>
                            <Field>
                              <Label>Tags</Label>
                              <TagsInput tags={tags} setTags={setTags} />
                              {tagsError && (
                                <div className='mt-1 flex items-center gap-1 text-xs text-red-500 dark:text-red-400'>
                                  <PiWarning className='h-3 w-3' />
                                  {tagsError}
                                </div>
                              )}
                            </Field>
                          </EnhancedField>
                        </div>
                      </div>

                      {/* Payment Section */}
                      <div className='mb-8'>
                        <SectionHeader
                          icon={PiCoins}
                          title='Payment & Timeline'
                          subtitle='Set your budget and delivery expectations'
                        />

                        <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                          <EnhancedField>
                            <div className='flex gap-3'>
                              <Field className='flex-1'>
                                <Label>Payment Amount</Label>
                                <Input
                                  type='number'
                                  value={amount}
                                  onChange={(e) => {
                                    setAmount(e.target.value);
                                    const validation = validateField(
                                      e.target.value,
                                      {
                                        required: true,
                                        custom: (value) =>
                                          parseFloat(value) > 0
                                            ? ''
                                            : 'Amount must be greater than 0',
                                      }
                                    );
                                    setAmountError(validation);
                                  }}
                                  placeholder='0.00'
                                  className='transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-600'
                                />
                                {amountError && (
                                  <div className='mt-1 flex items-center gap-1 text-xs text-red-500 dark:text-red-400'>
                                    <PiWarning className='h-3 w-3' />
                                    {amountError}
                                  </div>
                                )}
                              </Field>
                              <Field className='flex-none'>
                                <Label>Token</Label>
                                <div className='mt-[7px] flex items-center gap-2 rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-2.5 dark:border-blue-800 dark:from-blue-950/30 dark:to-purple-950/30'>
                                  <Image
                                    src={tokenIcon(job.token)}
                                    alt={`${tokensMap[job.token]?.symbol} token icon`}
                                    width={20}
                                    height={20}
                                    className='h-5 w-5'
                                  />
                                  <span className='text-sm font-semibold text-blue-700 dark:text-blue-300'>
                                    {tokensMap[job.token]?.symbol}
                                  </span>
                                </div>
                              </Field>
                            </div>
                          </EnhancedField>

                          <EnhancedField>
                            <div className='flex gap-3'>
                              <Field className='flex-1'>
                                <Label>Delivery Time</Label>
                                <Input
                                  type='number'
                                  value={maxTime || ''}
                                  min={1}
                                  step={1}
                                  placeholder='Enter time'
                                  onChange={(e) =>
                                    validateDeadline(e.target.value)
                                  }
                                  className='transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-600'
                                />
                                {deadlineError && (
                                  <div className='mt-1 flex items-center gap-1 text-xs text-red-500 dark:text-red-400'>
                                    <PiWarning className='h-3 w-3' />
                                    {deadlineError}
                                  </div>
                                )}
                              </Field>
                              <Field className='flex-1'>
                                <Label>Time Unit</Label>
                                <ListBox
                                  placeholder='Select unit'
                                  value={selectedUnitTime}
                                  onChange={(unit) => {
                                    if (typeof unit !== 'string') {
                                      setSelectedUnitTime(unit);
                                    }
                                  }}
                                  options={unitsDeliveryTime.map((unit) => ({
                                    id: unit.id.toString(),
                                    name: unit.name,
                                  }))}
                                />
                              </Field>
                            </div>
                          </EnhancedField>
                        </div>
                      </div>

                      {/* Settings Section */}
                      <div>
                        <SectionHeader
                          icon={PiUsersThree}
                          title='Job Settings'
                          subtitle='Configure arbitration and worker preferences'
                        />

                        <div className='space-y-6'>
                          <EnhancedField>
                            <Field>
                              <Label>Arbitrator</Label>
                              <Combobox
                                placeholder='Select Arbitrator'
                                value={selectedArbitratorAddress || ''}
                                options={arbitratorList.map((arb) => ({
                                  value: arb.address_,
                                  label: `${arb.name} ${arb.address_ !== zeroAddress ? `• ${(+arb.fee / 100).toFixed(1)}% fee` : ''}`,
                                }))}
                                onChange={(addr) =>
                                  setSelectedArbitratorAddress(addr)
                                }
                              />
                              <Description>
                                An arbitrator can help resolve disputes between
                                you and the worker
                              </Description>
                            </Field>
                          </EnhancedField>

                          <StyledRadioGroup
                            label='Whitelist Workers'
                            options={['Yes', 'No']}
                            value={whitelistWorkers}
                            onChange={setWhitelistWorkers}
                            description='Restrict who can apply to work on your job'
                            icon={PiUsersThree}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Footer */}
                    <div className='relative overflow-hidden'>
                      {/* Footer gradient background */}
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
                              onClick={handleUpdate}
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
