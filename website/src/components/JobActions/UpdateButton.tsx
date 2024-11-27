import { Button } from '@/components/Button';
import useArbitrators from '@/hooks/subsquid/useArbitrators';
import { ComboBoxOption } from '@/service/FormsTypes';
import { tokenIcon, tokensMap } from '@/tokens';
import { jobMeceTags } from '@/utils/jobMeceTags';
import { convertToSeconds, getUnitAndValueFromSeconds, unitsDeliveryTime } from '@/utils/utils';
import { Dialog, Transition } from '@headlessui/react';
import { CheckIcon } from '@heroicons/react/20/solid';
import {
  Job,
  publishToIpfs
} from '@effectiveacceleration/contracts';
import Config from '@effectiveacceleration/contracts/scripts/config.json';
import { MARKETPLACE_V1_ABI } from '@effectiveacceleration/contracts/wagmi/MarketplaceV1';
import { formatUnits, parseUnits } from 'ethers';
import { ChangeEvent, Fragment, useEffect, useState } from 'react';
import { zeroAddress } from 'viem';
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import CustomSelect from '../CustomSelect';
import { Field, Label } from '../Fieldset';
import { Input } from '../Input';
import { Radio, RadioGroup } from '../Radio';
import { Textarea } from '../Textarea';


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

export function UpdateButton({
  address,
  job,
  ...rest
}: UpdateButtonProps & React.ComponentPropsWithoutRef<'div'>) {
  const [title, setTitle] = useState<string>(job.title);
  const [titleError, setTitleError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const [tagsError, setTagsError] = useState('');
  const [amountError, setAmountError] = useState('');
  const [maxJobTimeError, setMaxJobTimeError] = useState('');
  const [tags, setTags] = useState<string[]>(job.tags.slice(1));
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
  const userList = [
    { address_: zeroAddress, name: 'None' },
    ...Object.values(arbitrators ?? {}).filter(
      (user) => !excludes.includes(user.address_)
    ),
  ];
  const [selectedArbitratorAddress, setSelectedArbitratorAddress] =
    useState<string>(job.roles.arbitrator);
  const { data: hash, error, writeContract } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  useEffect(() => {
    if (isConfirmed || error) {
      if (error) {
        const revertReason = error.message.match(
          `The contract function ".*" reverted with the following reason:\n(.*)\n.*`
        )?.[1];
        if (revertReason) {
          alert(
            error.message.match(
              `The contract function ".*" reverted with the following reason:\n(.*)\n.*`
            )?.[1]
          );
        } else {
          console.log(error, error.message);
          alert('Unknown error occurred');
        }
      }
      setButtonDisabled(false);
      closeModal();
    }
  }, [isConfirmed, error]);

  useEffect(() => {
    if (job.tags) {
      setSelectedCategory(
        jobMeceTags.find((category) => category.id === job.tags[0])
      );
      let { unit, value } = getUnitAndValueFromSeconds(job?.maxTime);
      if (unit && value) {
        value = Math.ceil(value);
        setMaxTime(value);
        const unitDelivery = unitsDeliveryTime.find((option) => option.name === unit);
        setSelectedUnitTime(unitDelivery || unitsDeliveryTime[0]);
      }
    }
  }, [job]);


  const [buttonDisabled, setButtonDisabled] = useState<boolean>(false);

  async function buttonClick() {
    // Validate all fields before submission
    const titleValidationMessage = validateField(title, {
      required: true,
      minLength: 3,
    });
    const descriptionValidationMessage = validateField(content, {
      required: true,
      minLength: 5,
    });
    setDescriptionError(descriptionValidationMessage);

    const tagsValidationMessage = tags
      .map((tag) => validateField(tag, { required: true }))
      .find((message) => message !== '');
    setTagsError(tagsValidationMessage || '');

    const amountValidationMessage = validateField(amount, {
      required: true,
      custom: (value) => (parseFloat(value) > 0 ? '' : 'Amount must be greater than 0'),
    });
    setAmountError(amountValidationMessage);

    const maxJobTimeValidationMessage = validateField(maxTime.toString(), {
      required: true,
      custom: (value) => (parseFloat(value) > 0 ? '' : 'Amount must be greater than 0'),
    });
    setMaxJobTimeError(maxJobTimeValidationMessage);
    setTitleError(titleValidationMessage);
    setButtonDisabled(true);

    if (!titleValidationMessage && !tagsValidationMessage && !amountValidationMessage && !maxJobTimeValidationMessage && !descriptionValidationMessage) {
      const { hash: contentHash } = await publishToIpfs(content);
      const tokenDecimals = tokensMap[job.token]?.decimals;
      const rawAmount = parseUnits(amount, tokensMap[job.token]?.decimals);
      // Proceed with form submission
      console.log('Form is valid');
      const deadlineInSeconds = maxTime ? convertToSeconds(maxTime, selectedUnitTime.name) : 0;

      const w = writeContract({
        abi: MARKETPLACE_V1_ABI,
        address: Config.marketplaceAddress,
        functionName: 'updateJobPost',
        args: [
          BigInt(job.id!),
          title,
          contentHash,
          [selectedCategory?.id || '', ...tags.map((tag) => tag)],
          rawAmount,
          deadlineInSeconds,
          selectedArbitratorAddress,
          whitelistWorkers === whitelistWorkersValues[0],
        ],
      });
    } else {
      setButtonDisabled(false);
      console.log('Form has errors');
    }
  }

  let [isOpen, setIsOpen] = useState(false);

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }

  return (
    <>
      <Button
        disabled={buttonDisabled}
        onClick={() => openModal()}
        color={'borderlessGray'}
        className={'w-full'}
      >
        Edit Details
      </Button>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as='div' className='relative z-10' onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter='ease-out duration-300'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='ease-in duration-200'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <div className='fixed inset-0 bg-black bg-opacity-25' />
          </Transition.Child>

          <div className='fixed inset-0 overflow-y-auto'>
            <div className='flex min-h-full items-center justify-center p-4 text-center'>
              <Transition.Child
                as={Fragment}
                enter='ease-out duration-300'
                enterFrom='opacity-0 scale-95'
                enterTo='opacity-100 scale-100'
                leave='ease-in duration-200'
                leaveFrom='opacity-100 scale-100'
                leaveTo='opacity-0 scale-95'
              >
                <Dialog.Panel className='w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all'>
                  <Dialog.Title
                    as='h3'
                    className='text-lg font-medium leading-6 text-gray-900'
                  >
                    Update job
                  </Dialog.Title>
                  <div className='mb-3 mt-5 flex flex-col gap-5'>
                    <Field>
                      <Label>Title</Label>
                      <Input
                        value={title}
                        placeholder='Title'
                        onChange={handleInputChange(setTitle, setTitleError, {
                          required: true,
                          minLength: 3,
                        })}
                      />
                      {titleError && (
                        <div className='text-xs' style={{ color: 'red' }}>
                          {titleError}
                        </div>
                      )}
                    </Field>
                    <Field>
                      <Label>Description</Label>
                      <Textarea
                        rows={4}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder='Message'
                        className='mt-5'
                      />
                      {descriptionError && (
                        <div className='text-xs' style={{ color: 'red' }}>
                          {descriptionError}
                        </div>
                      )}
                    </Field>
                    <Field>
                    <Label>Category</Label>
                      <br />
                      <CustomSelect
                        name="category"
                        value={selectedCategory}
                        onChange={(value) => {
                          setSelectedCategory(value as { id: string; name: string });
                        }}
                        className='rounded-md border border-gray-300 shadow-sm'
                      >
                        {jobMeceTags.map((category, index) =>
                          index > 0 && (
                            <option key={index} value={category.id}>
                              {category.name}
                            </option>
                          )
                        )}
                      </CustomSelect>
                  </Field>
                    <Field>
                      <Label>Tags <span style={{ fontSize: '0.8em', color: '#888' }}>(comma separated)</span></Label>
                      <Input
                        value={tags.join(', ')}
                        onChange={(e) =>
                          setTags(
                            e.target.value
                              .split(',')
                              .map((tag) => tag.trim())
                              .filter(
                                (tag, index, array) =>
                                  tag.length || index === array.length - 1
                              )
                          )
                        }
                      />
                      {tagsError && (
                        <div className='text-xs' style={{ color: 'red' }}>
                          {tagsError}
                        </div>
                      )}
                    </Field>
                    <Field>
                      <Label>Amount</Label>
                      <div className='flex flex-row items-center gap-2'>
                        <Input
                          type='number'
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          invalid={['-', 'e'].some((char) =>
                            amount.includes(char)
                          )}
                        />
                        <img
                          src={tokenIcon(job.token)}
                          alt=''
                          className='mr-1 h-[2em] w-auto flex-none'
                        />
                        <span>{tokensMap[job.token]?.symbol}</span>
                      </div>
                      {amountError && (
                        <div className='text-xs' style={{ color: 'red' }}>
                          {amountError}
                        </div>
                      )}
                    </Field>

                    <div className='flex flex-row justify-between gap-5'>
                  <Field className='flex-1'>
                    <Label>
                      Max delivery time in {selectedUnitTime.name}
                    </Label>
                    <div className='scroll-mt-20' />
                    <Input
                      name='deadline'
                      type='number'
                      placeholder={`Maximum delivery time in ${selectedUnitTime.name}`}
                      value={maxTime}
                      min={1}
                      step={1}
                      onChange={(e) => {
                        let deadline = parseInt(e.target.value);
                        if (deadline < 0) {
                          deadline = -deadline;
                        }
                        setMaxTime(deadline);
                        if (deadline === 0 || e.target.value === '') {
                          setDeadlineError('Please enter a valid deadline');
                        } else {
                          if (deadlineError) {
                            setDeadlineError('');
                          }
                        }
                      }}
                    />
                    {deadlineError && (
                      <div className='text-xs' style={{ color: 'red' }}>
                        {deadlineError}
                      </div>
                    )}
                  </Field>
                  <Field className='flex-1'>
                    <Label>Units</Label>
                    <br />
                    <CustomSelect
                      name="units"
                      value={selectedUnitTime.id}
                      onChange={(value) => {
                        const selectedValue = isNaN(Number(value)) ? value : Number(value);
                        const selectedOption = unitsDeliveryTime.find(option => option.id === selectedValue);
                        if (selectedOption) {
                          setSelectedUnitTime(selectedOption);
                        }
                      }}
                    >
                      {unitsDeliveryTime.map((unit, index) => (
                        <option key={index} value={unit.id}>
                          {unit.name}
                        </option>
                      ))}
                    </CustomSelect>
                    {maxJobTimeError && (
                        <div className='text-xs' style={{ color: 'red' }}>
                          {maxJobTimeError}
                        </div>
                      )}
                  </Field>
                </div>
                    <Field>
                      <Label>Arbitrator</Label>
                      <CustomSelect
                        name="arbitrator"
                        value={selectedArbitratorAddress}
                        onChange={(value) => setSelectedArbitratorAddress(value as string)}
                      >
                        {userList.map((user, index) => (
                          <option key={index} value={user.address_}>
                            {user.name}
                          </option>
                        ))}
                      </CustomSelect>
                    </Field>

                    <Field className='flex flex-row items-center justify-between'>
                      <Label className='items-center'>Whitelist workers</Label>
                      <RadioGroup
                        className='!mt-0 flex'
                        value={whitelistWorkers}
                        onChange={setWhitelistWorkers}
                        aria-label='Server size'
                      >
                        {whitelistWorkersValues.map((option) => (
                          <Field
                            className='!mt-0 ml-5 flex items-center'
                            key={option}
                          >
                            <Radio className='mr-2' value={option}>
                              <span>{option}</span>
                            </Radio>
                            <Label>{option}</Label>
                          </Field>
                        ))}
                      </RadioGroup>
                    </Field>

                    <Button disabled={buttonDisabled} onClick={buttonClick}>
                      <CheckIcon
                        className='-ml-0.5 mr-1.5 h-5 w-5'
                        aria-hidden='true'
                      />
                      Confirm
                    </Button>
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
