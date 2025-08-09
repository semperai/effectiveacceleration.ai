import { Button } from '@/components/Button';
import useArbitrators from '@/hooks/subsquid/useArbitrators';
import { useConfig } from '@/hooks/useConfig';
import { useToast } from '@/hooks/useToast';
import { useWriteContractWithNotifications } from '@/hooks/useWriteContractWithNotifications';
import type { ComboBoxOption, Tag } from '@/service/FormsTypes';
import { tokenIcon, tokensMap } from '@/tokens';
import { jobMeceTags } from '@/utils/jobMeceTags';
import {
  convertToSeconds,
  getUnitAndValueFromSeconds,
  unitsDeliveryTime,
} from '@/utils/utils';
import { getFromIpfs, type Job, publishToIpfs } from '@effectiveacceleration/contracts';
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
  PiWarning
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

// Styled Radio Group matching post job page
const StyledRadioGroup = ({ 
  label, 
  options, 
  value, 
  onChange,
  description 
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  description?: string;
}) => (
  <Field>
    <div className='flex flex-row items-center justify-between'>
      <Label className='mb-0 items-center pb-0 !font-bold'>
        {label}
      </Label>
      <div className='flex gap-3'>
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium
              transition-all duration-200 border
              ${value === option
                ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/30 dark:border-blue-800 dark:text-blue-300'
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800/70'
              }
            `}
          >
            <span className='flex items-center gap-2'>
              <div className={`
                w-4 h-4 rounded-full border-2 flex items-center justify-center
                ${value === option ? 'border-blue-500 dark:border-blue-400' : 'border-gray-400 dark:border-gray-500'}
              `}>
                {value === option && (
                  <div className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400" />
                )}
              </div>
              {option}
            </span>
          </button>
        ))}
      </div>
    </div>
    {description && <Description>{description}</Description>}
  </Field>
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
    job.tags.slice(1).map(tag => ({ id: tag, name: tag }))
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

    const tagsValidationMessage = tags.length === 0 ? 'At least one tag is required' : '';
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
      <Button
        disabled={isUpdating || isConfirming}
        onClick={() => openModal()}
        color={'borderlessGray'}
        className={'w-full'}
      >
        Edit Details
      </Button>
      
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
            <div className='fixed inset-0 bg-black/60 backdrop-blur-sm' />
          </Transition.Child>

          <div className='fixed inset-0 overflow-y-auto'>
            <div className='flex min-h-full items-center justify-center p-4'>
              <Transition.Child
                as={Fragment}
                enter='ease-out duration-300'
                enterFrom='opacity-0 scale-95'
                enterTo='opacity-100 scale-100'
                leave='ease-in duration-200'
                leaveFrom='opacity-100 scale-100'
                leaveTo='opacity-0 scale-95'
              >
                <Dialog.Panel className='
                  w-full max-w-4xl transform overflow-hidden rounded-2xl 
                  bg-white dark:bg-gradient-to-b dark:from-gray-900 dark:to-black
                  border border-gray-200 dark:border-white/10
                  shadow-2xl transition-all
                  relative
                '>
                  {/* Decorative gradient orbs for dark mode */}
                  <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl opacity-0 dark:opacity-100" />
                  <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl opacity-0 dark:opacity-100" />
                  
                  {/* Content */}
                  <div className="relative">
                    {/* Header */}
                    <div className='flex items-center justify-between p-6 border-b border-gray-200 dark:border-white/10'>
                      <div className='flex items-center gap-3'>
                        <div className='p-2 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 border border-blue-500/20 dark:border-white/10'>
                          <PiSparkle className='w-5 h-5 text-blue-600 dark:text-blue-400' />
                        </div>
                        <div className='text-left'>
                          <Dialog.Title className='text-lg font-semibold text-gray-900 dark:text-white'>
                            Update Job Details
                          </Dialog.Title>
                          <p className='text-xs text-gray-500 dark:text-gray-400 mt-0.5'>
                            Modify your job posting information
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={closeModal}
                        className='
                          p-2 rounded-xl text-gray-500 dark:text-gray-400 
                          hover:text-gray-700 dark:hover:text-white 
                          hover:bg-gray-100 dark:hover:bg-white/10 
                          transition-all duration-200
                        '
                      >
                        <XMarkIcon className='w-5 h-5' />
                      </button>
                    </div>

                    {/* Form Content - Two Column Layout */}
                    <div className='p-6 max-h-[70vh] overflow-y-auto'>
                      <div className='flex w-full flex-col gap-8 lg:flex-row lg:gap-8'>
                        {/* Left Column */}
                        <FieldGroup className='flex-1'>
                          <Field>
                            <Label>Job Title</Label>
                            <Input
                              value={title}
                              placeholder='A short descriptive title for the job post'
                              onChange={handleInputChange(setTitle, setTitleError, {
                                required: true,
                                minLength: 3,
                              })}
                            />
                            {titleError && (
                              <div className='text-xs text-red-500 dark:text-red-400 flex items-center gap-1 mt-1'>
                                <PiWarning className='w-3 h-3' />
                                {titleError}
                              </div>
                            )}
                          </Field>

                          <Field>
                            <Label>Description</Label>
                            <Textarea
                              rows={6}
                              value={content}
                              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
                              placeholder='Provide a thorough description of the job...'
                            />
                          </Field>

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

                          <Field>
                            <Label>Tags</Label>
                            <TagsInput tags={tags} setTags={setTags} />
                            <Description>
                              Tags help workers find your job post
                            </Description>
                            {tagsError && (
                              <div className='text-xs text-red-500 dark:text-red-400 flex items-center gap-1 mt-1'>
                                <PiWarning className='w-3 h-3' />
                                {tagsError}
                              </div>
                            )}
                          </Field>
                        </FieldGroup>

                        {/* Right Column */}
                        <FieldGroup className='flex-1'>
                          <div className='flex flex-row justify-between gap-5'>
                            <Field className='flex-1'>
                              <Label>Payment Amount</Label>
                              <Input
                                type='number'
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder='1.00'
                              />
                              {amountError && (
                                <div className='text-xs text-red-500 dark:text-red-400 flex items-center gap-1 mt-1'>
                                  <PiWarning className='w-3 h-3' />
                                  {amountError}
                                </div>
                              )}
                            </Field>
                            <Field className='flex-none'>
                              <Label>Token</Label>
                              <div className='flex items-center gap-2 px-4 py-2.5 mt-[7px] rounded-lg bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700'>
                                <img
                                  src={tokenIcon(job.token)}
                                  alt=''
                                  className='h-5 w-5'
                                />
                                <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                                  {tokensMap[job.token]?.symbol}
                                </span>
                              </div>
                            </Field>
                          </div>

                          <div className='flex flex-row justify-between gap-5'>
                            <Field className='flex-1'>
                              <Label>
                                Max delivery time in {selectedUnitTime.name}
                              </Label>
                              <Input
                                type='number'
                                value={maxTime || ''}
                                min={1}
                                step={1}
                                placeholder={`Maximum delivery time in ${selectedUnitTime.name}`}
                                onChange={(e) => validateDeadline(e.target.value)}
                              />
                              {deadlineError && (
                                <div className='text-xs text-red-500 dark:text-red-400 flex items-center gap-1 mt-1'>
                                  <PiWarning className='w-3 h-3' />
                                  {deadlineError}
                                </div>
                              )}
                            </Field>
                            <Field className='flex-1'>
                              <Label>Units</Label>
                              <ListBox
                                placeholder='Select Time Units'
                                value={selectedUnitTime}
                                onChange={(unit) => {
                                  if (typeof unit !== 'string') {
                                    setSelectedUnitTime(unit);
                                  }
                                }}
                                options={unitsDeliveryTime.map(unit => ({ 
                                  id: unit.id.toString(), 
                                  name: unit.name 
                                }))}
                              />
                            </Field>
                          </div>

                          <Field>
                            <Label>Arbitrator</Label>
                            <Combobox
                              placeholder='Select Arbitrator'
                              value={selectedArbitratorAddress || ''}
                              options={arbitratorList.map((arb) => ({
                                value: arb.address_,
                                label: `${arb.name} ${arb.address_ !== zeroAddress ? `(${+arb.fee / 100}% fee)` : ''}`,
                              }))}
                              onChange={(addr) => setSelectedArbitratorAddress(addr)}
                            />
                            <Description>
                              Choose an arbitrator to help resolve disputes
                            </Description>
                          </Field>

                          <StyledRadioGroup
                            label='Whitelist Workers'
                            options={['Yes', 'No']}
                            value={whitelistWorkers}
                            onChange={setWhitelistWorkers}
                            description='Restrict who can apply to your job'
                          />
                        </FieldGroup>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className='p-6 border-t border-gray-200 dark:border-white/10'>
                      <div className='flex justify-end gap-3'>
                        <Button
                          outline
                          onClick={closeModal}
                          className='px-6'
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleUpdate}
                          disabled={isUpdating || isConfirming}
                          className='px-6'
                        >
                          {isUpdating || isConfirming ? (
                            <span className='flex items-center gap-2'>
                              <svg className='animate-spin h-4 w-4' fill='none' viewBox='0 0 24 24'>
                                <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
                                <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z' />
                              </svg>
                              Updating...
                            </span>
                          ) : (
                            'Update Job'
                          )}
                        </Button>
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
