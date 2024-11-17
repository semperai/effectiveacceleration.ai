'use client';
import React, {
  ChangeEvent,
  FormEvent,
  forwardRef,
  useImperativeHandle,
  useRef,
} from 'react';
import { ethers } from 'ethers';
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWatchContractEvent,
  useWriteContract,
} from 'wagmi';
import ERC20Abi from '@/abis/ERC20.json';
import Config from 'effectiveacceleration-contracts/scripts/config.json';
import { MARKETPLACE_V1_ABI } from 'effectiveacceleration-contracts/wagmi/MarketplaceV1';
import { useEffect, useState } from 'react';
import { Layout } from '@/components/Dashboard/Layout';
import { Button } from '@/components/Button';
import {
  Description,
  Field,
  FieldGroup,
  Fieldset,
  Label,
} from '@/components/Fieldset';
import { Text } from '@/components/Text';
import { Textarea } from '@/components/Textarea';
import { Input } from '@/components/Input';
import { TokenSelector } from '@/components/TokenSelector';
import { Token, tokens } from '@/tokens';
import { Radio, RadioGroup } from '@/components/Radio';
import { Listbox, ListboxOption } from '@/components/Listbox';
import { Job, publishToIpfs } from 'effectiveacceleration-contracts';
import { zeroAddress } from 'viem';
import useUsers from '@/hooks/useUsers';
import useArbitrators from '@/hooks/useArbitrators';
import { ComboBox } from '@/components/ComboBox';
import { ComboBoxOption, JobFormInputData, Tag } from '@/service/FormsTypes';
import JobSummary from './JobSummary';
import Image from 'next/image';
import Link from 'next/link';
import moment from 'moment';
import TagsInput from '@/components/TagsInput';
import { BsInfoCircle } from 'react-icons/bs';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { MARKETPLACE_DATA_V1_ABI } from 'effectiveacceleration-contracts/wagmi/MarketplaceDataV1';
import { LocalStorageJob } from '@/service/JobsService';
import useUnsavedChangesWarning from '@/hooks/useUnsavedChangesWarning';
import { LOCAL_JOBS_OWNER_CACHE } from '@/utils/constants';
import { shortenText } from '@/utils/utils';
import useUser from '@/hooks/useUser';
import RegisterModal from './RegisterModal';
import LoadingModal from './LoadingModal';
import { jobMeceTags } from '@/utils/jobMeceTags';

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

interface FieldValidation {
  required?: boolean;
  minLength?: number;
  pattern?: RegExp;
  mustBeGreaterThanOrEqualTo?: string;
  mustBeGreaterThan?: string;
  mustBeLessThanOrEqualTo?: string;
  custom?: (value: string) => string;
}

async function setupAndGiveAllowance(
  spenderAddress: `0x${string}` | undefined,
  amount: string,
  tokenAddress: `0x${string}` | undefined
) {
  return new Promise<void>(async (resolve, reject) => {
    try {
      if (!spenderAddress || !tokenAddress) {
        throw new Error('Invalid spender or token address');
      }

      // Get the provider from MetaMask (or another wallet)
      const provider = new ethers.BrowserProvider(window.ethereum);

      // Request account access if needed
      await provider.send('eth_requestAccounts', []);

      // Get the signer
      const signer = await provider.getSigner();

      // Create an instance of the token contract
      const tokenContract = new ethers.Contract(tokenAddress, ERC20Abi, signer);

      // Get the token decimals
      const decimals = await tokenContract.decimals();

      // Parse the amount to the correct units
      const parsedAmount = ethers.parseUnits(amount, decimals);

      // Get the current allowance
      const ownerAddress = await signer.getAddress();
      const currentAllowance = await tokenContract.allowance(
        ownerAddress,
        spenderAddress
      );

      // Ensure currentAllowance and parsedAmount are BigInt instances
      if (
        typeof currentAllowance === 'bigint' &&
        typeof parsedAmount === 'bigint'
      ) {
        // Check if the current allowance is sufficient
        if (currentAllowance >= parsedAmount) {
          console.log(
            `Sufficient allowance already given to ${spenderAddress} for ${amount} tokens`
          );
          if (typeof resolve === 'function') {
            resolve();
          } else {
            console.error('resolve is not a function');
          }
          return;
        }
      } else {
        console.error('currentAllowance or parsedAmount is not a valid BigInt');
      }

      // Call the approve function
      const tx = await tokenContract.approve(spenderAddress, parsedAmount);

      // Wait for the transaction to be mined
      const receipt = await tx.wait();

      if (receipt.status === 1) {
        // Check if the transaction was successful
        console.log(
          `Allowance given to ${spenderAddress} for ${amount} tokens`
        );
        resolve();
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error) {
      console.error('Error in setupAndGiveAllowance:', error);
      reject(error);
    }
  });
}

const validateField = (value: string, validation: FieldValidation): string => {
  console.log(
    validation.minLength && value.length < validation.minLength,
    'VALUE AND VALIDATIONE'
  );
  if (validation.minLength && value.length < validation.minLength) {
    return `Must be at least ${validation.minLength} characters long`;
  }
  if (validation.pattern && !validation.pattern.test(value)) {
    return 'Invalid format';
  }
  console.log('validation', validation, value);
  if (
    validation.mustBeGreaterThan &&
    parseFloat(value) <= parseFloat(validation.mustBeGreaterThan)
  ) {
    return `Insufficient balance of the selected token`;
  }
  if (
    validation.mustBeGreaterThanOrEqualTo &&
    parseFloat(value) < parseFloat(validation.mustBeGreaterThanOrEqualTo)
  ) {
    return `Insufficient balance of the selected token`;
  }
  if (
    validation.mustBeLessThanOrEqualTo &&
    parseFloat(value) > parseFloat(validation.mustBeLessThanOrEqualTo)
  ) {
    return `Insufficient balance of the selected token`;
  }
  if (validation.custom) {
    return validation.custom(value);
  }
  if (validation.required && !value) {
    return 'This field is required';
  }

  return '';
};

interface PostJobPageProps {
  onJobIdCache: (jobId: bigint) => void;
}

const unitsDeliveryTime = [
  { id: 0, name: 'minutes' },
  { id: 1, name: 'hours' },
  { id: 2, name: 'days' },
  { id: 3, name: 'weeks' },
  { id: 4, name: 'months' },
  { id: 5, name: 'years' },
];

const deliveryMethods = [
  {
    label: 'IPFS',
    value: 'ipfs',
  },
  {
    label: 'Courier',
    value: 'courier',
  },
  {
    label: 'Digital Proof',
    value: 'digital_proof',
  },
  {
    label: 'Other',
    value: 'other',
  },
];

const PostJob = forwardRef<{ jobIdCache: (jobId: bigint) => void }, {}>(
  (props, ref) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { address } = useAccount();
    const { data: user } = useUser(address!);
    const { data: workers } = useUsers();
    const { data: arbitrators } = useArbitrators();
    const arbitratorAddresses = [
      zeroAddress,
      ...(arbitrators?.map((worker) => worker.address_) ?? []),
    ];
    const arbitratorNames = [
      'None',
      ...(arbitrators?.map((worker) => worker.name) ?? []),
    ];
    const arbitratorFees = [
      '0',
      ...(arbitrators?.map((worker) => worker.fee) ?? []),
    ];
    const [selectedToken, setSelectedToken] = useState<Token | undefined>(
      tokens[0]
    );
    const multipleApplicantsValues = ['No', 'Yes'];
    const [showSummary, setShowSummary] = useState(false);
    const [title, setTitle] = useState<string>('');
    const [deliveryMethod, setDeliveryMethod] = useState(deliveryMethods[0].value);
    const [description, setDescription] = useState<string>('');
    const [amount, setAmount] = useState('');
    const [deadline, setDeadline] = useState<number>();
    const [multipleApplicants, setMultipleApplicants] = useState(
      multipleApplicantsValues[1]
    );
    const [arbitratorRequired, setArbitratorRequired] = useState(
      multipleApplicantsValues[1]
    );
    const [selectedUnitTime, setselectedUnitTime] = useState<ComboBoxOption>(
      unitsDeliveryTime[2]
    );
    const [tags, setTags] = useState<Tag[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<{
      id: string;
      name: string;
    }>();
    const [selectedWorkerAddress, setsSelectedWorkerAddress] = useState<
      string | undefined
    >(undefined);
    const [selectedArbitratorAddress, setsSelectedArbitratorAddress] =
      useState<string>();
    const [titleError, setTitleError] = useState<string>('');
    const [descriptionError, setDescriptionError] = useState<string>('');
    const [categoryError, setCategoryError] = useState<string>('');
    const [paymentTokenError, setPaymentTokenError] = useState<string>('');
    const [postButtonDisabled, setPostButtonDisabled] = useState(false);
    const jobTitleRef = useRef<HTMLDivElement>(null);
    const jobDescriptionRef = useRef<HTMLDivElement>(null);
    const jobCategoryRef = useRef<HTMLDivElement>(null);
    const jobAmountRef = useRef<HTMLDivElement>(null);
    const jobDeadlineRef = useRef<HTMLDivElement>(null);
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
    const [isLoadingModalOpen, setIsLoadingModalOpen] = useState(false);
    const userJobCache = `${address}${LOCAL_JOBS_OWNER_CACHE}`;
    const unregisteredUserLabel = `${address}-unregistered-job-cache`;
    const { data: hash, error, isPending, writeContract } = useWriteContract();

    const { isLoading: isConfirming, isSuccess: isConfirmed } =
      useWaitForTransactionReceipt({
        hash,
      });

    useEffect(() => {
      if (
        title == '' ||
        description == '' ||
        amount == '0' ||
        deadline == 0 ||
        selectedToken == undefined
      ) {
        setPostButtonDisabled(true);
      } else {
        setPostButtonDisabled(false);
      }
    }, [title, description, amount, deadline, selectedToken, error]);

    const handleSummary = () => {
      if (!user) {
        setIsRegisterModalOpen(true);
        jobIdCache();
        return;
      }
      setShowSummary(!showSummary);
    };

    const { data: balanceData } = useReadContract({
      account: address,
      abi: ERC20Abi,
      address: selectedToken?.id as `0x${string}` | undefined,
      functionName: 'balanceOf',
      args: [address!],
    });
    console.log(typeof balanceData, 'BALANCE DATA');
    async function postJobClick() {
      if (!deadline) return;
      if (!amount) return;
      if (!selectedCategory) return;
      setPostButtonDisabled(true);

      const { hash: contentHash } = await publishToIpfs(description);
      const allowanceResponse = await setupAndGiveAllowance(
        Config.marketplaceAddress as `0x${string}`,
        amount,
        selectedToken?.id as `0x${string}` | undefined
      );
      // Call the giveAllowance function
      // await setupAndGiveAllowance(Config.marketplaceAddress as `0x${string}`, amount, selectedToken?.id as `0x${string}` | undefined);\
      console.log([selectedCategory.id, ...tags.map((tag) => tag.name)], 'TAG');
      const w = writeContract({
        abi: MARKETPLACE_V1_ABI,
        address: Config.marketplaceAddress as `0x${string}`,
        functionName: 'publishJobPost',
        args: [
          title,
          contentHash as `0x${string}`,
          multipleApplicants === 'Yes',
          [selectedCategory.id, ...tags.map((tag) => tag.name)],
          selectedToken?.id! as `0x${string}`,
          ethers.parseUnits(amount, selectedToken?.decimals!),
          deadline,
          deliveryMethod,
          selectedArbitratorAddress as `0x${string}`,
          selectedWorkerAddress ? [selectedWorkerAddress as `0x${string}`] : [],
        ],
      });
    }

    const jobIdCache = (jobId?: bigint) => {
      const createdJobId = jobId?.toString();
      const createdJobs = JSON.parse(
        localStorage.getItem(userJobCache) || '[]'
      );

      // newJob Should correspond to type "Job" but bigInts are not JSON stringifiable
      const newJob: any = {
        id: createdJobId ? createdJobId : '0',
        title: title,
        content: description,
        multipleApplicants: multipleApplicants === 'Yes',
        tags: [selectedCategory?.id as string, ...tags.map((tag) => tag.name)],
        token: `0x${selectedToken?.id}` as `0x${string}`,
        maxTime: deadline as number,
        deliveryMethod: deliveryMethod,
        roles: {
          creator: address as `0x${string}`,
          arbitrator: selectedArbitratorAddress as `0x${string}`,
          worker: selectedWorkerAddress as `0x${string}`,
        },
        state: 0,
        whitelistWorkers: false,
        contentHash: hash as `0x${string}`,
        amount: amount,
        disputed: false,
        timestamp: Date.now(),
        collateralOwed: 0,
        escrowId: 0,
        resultHash: hash as `0x${string}`,
        rating: 0,
      };
      createdJobs.push(newJob);
      // Save job to local storage, if unregistered save to session storage
      // for later retrieval after registration
      if (user) {
        localStorage.setItem(userJobCache, JSON.stringify(createdJobs));
        setTimeout(() => {
          router.push(`/dashboard/jobs/${createdJobId}`);
        }, 1000);
      } else {
        sessionStorage.setItem(
          unregisteredUserLabel,
          JSON.stringify(createdJobs)
        );
      }
    };

    useImperativeHandle(ref, () => ({
      jobIdCache,
    }));

    function closeRegisterModal() {
      setIsRegisterModalOpen(false);
    }
    console.log(isLoadingModalOpen, 'IS LOADING MODAL OPEN');
    function closeLoadingModal() {
      setIsRegisterModalOpen(false);
    }

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

    const handleSubmit = () => {
      if (! balanceData) {
        throw new Error('Balance data is not available');
      }
      // Ensure balanceData is of type ethers.BigNumberish
      const balanceAsString = ethers.formatUnits(
        balanceData as ethers.BigNumberish,
        selectedToken?.decimals as number
      ).toString();

      // Validate all fields before submission
      const titleValidationMessage = validateField(title, { minLength: 3 });
      const descriptionValidationMessage = validateField(description, {
        required: true,
        minLength: 10,
      });
      const categoryValidationMessage = validateField(
        selectedCategory?.name || '',
        { required: true }
      );
      const paymentTokenValidationMessage = validateField(balanceAsString, {
        mustBeGreaterThanOrEqualTo: amount,
        mustBeGreaterThan: '0',
        required: true,
      });
      console.log(
        titleValidationMessage,
        descriptionValidationMessage,
        categoryValidationMessage,
        paymentTokenValidationMessage,
        'VALIDATION MESSAGES'
      );
      setTitleError(titleValidationMessage);
      setDescriptionError(descriptionValidationMessage);
      setCategoryError(categoryValidationMessage);
      setPaymentTokenError(paymentTokenValidationMessage);
      if (
        !titleValidationMessage &&
        !descriptionValidationMessage &&
        !categoryValidationMessage &&
        !paymentTokenValidationMessage
      ) {
        // Proceed with form submission
        handleSummary();
      } else {
        console.log('Form has errors');
        if (titleValidationMessage) {
          jobTitleRef.current?.focus();
          jobTitleRef.current?.scrollIntoView({behavior: 'smooth'});
          return;
        }

        if (descriptionValidationMessage) {
          jobDescriptionRef.current?.focus();
          jobDescriptionRef.current?.scrollIntoView({behavior: 'smooth'});
          return;
        }

        if (categoryValidationMessage) {
          jobCategoryRef.current?.focus();
          jobCategoryRef.current?.scrollIntoView({behavior: 'smooth'});
          return;
        }

        if (paymentTokenValidationMessage) {
          jobAmountRef.current?.focus();
          jobAmountRef.current?.scrollIntoView({behavior: 'smooth'});
          return;
        }
      }
    };

    const formInputs: JobFormInputData[] = [
      { label: 'Job Title', inputInfo: title },
      { label: 'Description', inputInfo: description },
      { label: 'Multiple Applicants', inputInfo: multipleApplicants },
      { label: 'Category', inputInfo: selectedCategory?.name },
      { label: 'Tags', inputInfo: tags.map((tag) => tag.name).join(', ') },
      {
        label: 'Token',
        inputInfo: (
          <div className='flex items-center'>
            <span className='mr-1 inline'>{selectedToken?.id}</span>
            <span className='mr-1 inline font-bold'>
              {selectedToken?.symbol}
            </span>
            <img
              className='inline'
              alt='Chain Icon'
              height={30}
              width={30}
              src={selectedToken?.icon || ''}
            />
          </div>
        ),
      },
      {
        label: 'Price',
        inputInfo: (
          <>
            <span className='mr-1 inline'>{amount}</span>
          </>
        ),
      },
      { label: 'Delivery Method', inputInfo: deliveryMethod },
      {
        label: 'Deadline',
        inputInfo: moment
          .duration(
            deadline,
            selectedUnitTime?.name as moment.unitOfTime.DurationConstructor
          )
          .humanize(),
      },
      { label: 'Arbitrator Required', inputInfo: arbitratorRequired },
      { label: 'Arbitrator Address', inputInfo: selectedArbitratorAddress },
      { label: 'Worker Address', inputInfo: selectedWorkerAddress },
    ];
    useEffect(() => {
      if (isConfirmed || error) {
        if (error) {
          console.log(error, error.message);
          alert(
            error.message.match(
              `The contract function ".*" reverted with the following reason:\n(.*)\n.*`
            )?.[1]
          );
        }
        if (isConfirmed) {
          console.log('Job confirmed MODAL OPEN');
          setIsLoadingModalOpen(true);
        }
      }
    }, [isConfirmed, error]);

    useEffect(() => {
      if (arbitratorRequired === 'Yes')
        setsSelectedArbitratorAddress(arbitratorAddresses[1]);
    }, [arbitratorAddresses]);
    console.log(
      selectedArbitratorAddress,
      'ARBITRATOR ADDRESS',
      arbitratorAddresses,
      'ARBITRATOR ADDRESSES'
    );

    useEffect(() => {
      // Get session storage to fill form for new signed up users
      const jobsAfterSignUp = JSON.parse(
        sessionStorage.getItem(unregisteredUserLabel) || '[]'
      );
      const savedJob: PostJobParams = jobsAfterSignUp[0];

      // Get params from URL of users that clicked postNewJob from job page
      const params = Object.fromEntries(searchParams.entries());
      const extractedParams: PostJobParams = {
        ...params,
        tags: searchParams.getAll('tags'),
      };
      // Check if either savedJob or params are true
      if (user && (savedJob || extractedParams.title)) {
        initializeForm(savedJob || extractedParams);
      }
    }, [searchParams, address, user]);

    const initializeForm = (job: PostJobParams) => {
      setTitle(job.title || '');
      setDescription(job.content || '');
      setTags(
        job.tags
          .filter((_, index) => index !== 0)
          .map((tag: string, index: number) => ({ id: index + 1, name: tag }))
      );
      const selectedCategory = jobMeceTags.find(
        (category) => category.id === job.tags[0]
      );
      setSelectedCategory(selectedCategory);
      setDeliveryMethod(job.deliveryMethod || '');
      setAmount(job.amount || '');
      if (job.roles?.arbitrator === zeroAddress) {
        setArbitratorRequired('No');
      } else {
        setArbitratorRequired('Yes');
        setsSelectedArbitratorAddress(job.roles?.arbitrator || '');
      }
      setDeadline(parseInt(job.maxTime || '0'));
      // delete unregisteredUserLabel as this only should be consumed after user regis
      sessionStorage.removeItem(unregisteredUserLabel);
      handleSummary();
    };

    const handleArbitratorChange = (value: string) => {
      setArbitratorRequired(value);
      if (value === 'No') {
        setsSelectedArbitratorAddress(zeroAddress);
      }
    };

    // show all validations on first render
    const [initialRenderValidation, setInitialRenderValidation] = useState(false);
    useEffect(() => {
      if (! initialRenderValidation) {
        try {
          handleSubmit();
          setInitialRenderValidation(true);
        } catch (e) {
          console.error('Error in initial render validation', e);
        }
      }
    }, [balanceData]);


    return (
      <div>
        {!showSummary && (
          <Fieldset className='w-full'>
            <div className='mb-10'>
              <h1 className='mb-2 text-3xl font-bold'>Create a Job Post</h1>
              <span>
                Complete the form below to post your job and connect with
                potential AI candidates.
              </span>
            </div>

            <div className='flex w-full flex-col gap-8 lg:flex-row lg:gap-24'>
              <FieldGroup className='flex-1'>
                <Field>
                  <Label>Job Title</Label>
                  <div className='scroll-mt-20' ref={jobTitleRef} />
                  <Input
                    name='title'
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
                  <div className='scroll-mt-20' ref={jobDescriptionRef} />
                  <Textarea
                    rows={10}
                    name='description'
                    placeholder='Job Description'
                    value={description}
                    onChange={handleInputChange(
                      setDescription,
                      setDescriptionError,
                      { required: true, minLength: 10 }
                    )}
                  />
                  {descriptionError && (
                    <div className='text-xs' style={{ color: 'red' }}>
                      {descriptionError}
                    </div>
                  )}
                </Field>
                <Field className='flex flex-row items-center justify-between'>
                  <Label className='items-center'>Multiple Applicants</Label>
                  <RadioGroup
                    className='!mt-0 flex'
                    value={multipleApplicants}
                    onChange={setMultipleApplicants}
                    aria-label='Server size'
                  >
                    {multipleApplicantsValues.map((option) => (
                      <Field
                        className='!mt-0 ml-5 flex items-center'
                        key={option}
                      >
                        <Radio className='mr-2' color='default' value={option}>
                          <span>{option}</span>
                        </Radio>
                        <Label>{option}</Label>
                      </Field>
                    ))}
                  </RadioGroup>
                </Field>
                <Field>
                  <Label>Category</Label>
                  <div ref={jobCategoryRef} className='scroll-mt-20' />
                  <Listbox
                    placeholder='Select Category'
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e)}
                    className='rounded-md border border-gray-300 shadow-sm'
                  >
                    {jobMeceTags.map(
                      (category, index) =>
                        index > 0 && (
                          <ListboxOption key={index} value={category}>
                            {`${jobMeceTags[index].name}`}
                          </ListboxOption>
                        )
                    )}
                  </Listbox>
                  {categoryError && (
                    <div className='text-xs' style={{ color: 'red' }}>
                      {categoryError}
                    </div>
                  )}
                </Field>
                <Field>
                  <Label>Tags</Label>
                  <TagsInput tags={tags} setTags={setTags} />
                </Field>
              </FieldGroup>
              <FieldGroup className='flex-1'>
                <div className='flex flex-row justify-between gap-5'>
                  <Field className='flex-1'>
                    <Label>Payment Amount</Label>
                    <div className='scroll-mt-20' ref={jobAmountRef} />
                    <Input
                      name='amount'
                      placeholder='Amount'
                      type='number'
                      value={amount}
                      min={0}
                      onChange={(e) => {
                        const value = e.target.value;
                        const sanitizedValue = value === '' ? '' : parseFloat(value) < 0 ? -value : value;

                        handleInputChange(setAmount, setPaymentTokenError, {
                          mustBeLessThanOrEqualTo: ethers.formatUnits(
                            (balanceData as ethers.BigNumberish) || 0,
                            selectedToken?.decimals || 0
                          ),
                          mustBeGreaterThan: '0',
                          required: true,
                        })({ ...e, target: { ...e.target, value: sanitizedValue.toString() } });
                      }}
                    />
                    {paymentTokenError && (
                      <div className='text-xs' style={{ color: 'red' }}>
                        {paymentTokenError}
                      </div>
                    )}
                    <Description></Description>
                  </Field>
                  <Field className='flex-1'>
                    <Label>Payment Token</Label>
                    <div className='flex flex-col gap-y-2'>
                      <div className='flex items-center gap-x-2'>
                        <div>
                          <div className='flex flex-col gap-4'>
                            <TokenSelector
                              selectedToken={selectedToken}
                              onClick={(token: Token) =>
                                setSelectedToken(token)
                              }
                            />
                          </div>
                          {selectedToken &&
                          balanceData !== null &&
                          balanceData !== undefined ? (
                            <Text>
                              Balance:{' '}
                              {ethers.formatUnits(
                                balanceData as ethers.BigNumberish,
                                selectedToken.decimals
                              )}{' '}
                              {selectedToken.symbol}
                            </Text>
                          ) : (
                            <Text style={{ color: 'red' }}>
                              Balance: 0.0 {selectedToken?.symbol}
                            </Text>
                          )}
                        </div>
                      </div>
                      <div className='max-w-[200px] truncate text-xs text-gray-500'>
                        <Link
                          href={`https://arbiscan.io/address/${selectedToken?.id}`}
                          target='_blank'
                          rel='noopener noreferrer'
                        >
                          {selectedToken?.id}
                        </Link>
                      </div>
                    </div>
                  </Field>
                </div>
                <Field>
                  <Label>Delivery Method</Label>
                  <Listbox
                    placeholder='Delivery Method'
                    value={deliveryMethod}
                    onChange={(e) => setDeliveryMethod(e)}
                    className='rounded-md border border-gray-300 shadow-sm'
                  >
                    {deliveryMethods.map((method, index) => (
                      <ListboxOption key={index} value={method.value}>
                        {`${deliveryMethods[index].label}`}
                      </ListboxOption>
                    ))}
                  </Listbox>
                </Field>
                <Field className='flex flex-row items-center justify-between'>
                  <Label className='mb-0 items-center pb-0 !font-bold'>
                    Arbitrator Required
                  </Label>
                  <RadioGroup
                    className='!mt-0 flex'
                    value={arbitratorRequired}
                    onChange={handleArbitratorChange}
                    aria-label='Server size'
                  >
                    {multipleApplicantsValues.map((option) => (
                      <Field
                        className='!mt-0 ml-5 flex items-center'
                        key={option}
                      >
                        <Radio color='default' className='mr-2' value={option}>
                          <span>{option}</span>
                        </Radio>
                        <Label>{option}</Label>
                      </Field>
                    ))}
                  </RadioGroup>
                </Field>
                {arbitratorRequired === 'Yes' && (
                  <Field>
                    <Listbox
                      placeholder='Select Arbitrator'
                      value={selectedArbitratorAddress}
                      onChange={(e) => setsSelectedArbitratorAddress(e)}
                      className='rounded-md border border-gray-300 shadow-sm'
                    >
                      {arbitratorAddresses.map(
                        (arbitratorAddress, index) =>
                          index > 0 && (
                            <ListboxOption
                              key={index}
                              value={arbitratorAddress}
                            >
                              {`${arbitratorNames[index]}  ${shortenText({ text: arbitratorAddress, maxLength: 11 })} ${+arbitratorFees[index] / 100}%`}
                            </ListboxOption>
                          )
                      )}
                    </Listbox>
                  </Field>
                )}

                <div className='flex flex-row justify-between gap-5'>
                  <Field className='flex-1'>
                    <Label>
                      Maximum delivery time{' '}
                      {selectedUnitTime ? `in ${selectedUnitTime.name}` : ''}
                    </Label>
                    <div className='scroll-mt-20' ref={jobDeadlineRef} />
                    <Input
                      name='deadline'
                      type='number'
                      placeholder={`Maximum delivery time ${selectedUnitTime ? `in ${selectedUnitTime.name}` : ''}`}
                      value={deadline}
                      min={1}
                      step={1}
                      onChange={(e) => {
                        let deadline = parseInt(e.target.value);
                        if (deadline < 0) {
                          deadline = -deadline;
                        }
                        setDeadline(deadline);
                      }}
                    />
                  </Field>
                  <Field className='flex-1'>
                    <Label>Units</Label>
                    <Listbox
                      placeholder='Time Units'
                      value={selectedUnitTime}
                      onChange={(e) => setselectedUnitTime(e)}
                      className='rounded-md border border-gray-300 shadow-sm'
                    >
                      {unitsDeliveryTime.map(
                        (timeUnit, index) =>
                          index > 0 && (
                            <ListboxOption key={index} value={timeUnit}>
                              {`${unitsDeliveryTime[index].name}`}
                            </ListboxOption>
                          )
                      )}
                    </Listbox>
                  </Field>
                </div>
              </FieldGroup>
            </div>
            {!showSummary && (
              <div className='flex justify-end mt-5 mb-40'>
                <Button
                  // disabled={postButtonDisabled || isPending}
                  // onClick={postJobClick}
                  onClick={handleSubmit}
                >
                  {isPending ? 'Posting...' : 'Continue'}
                </Button>
              </div>
            )}
            <RegisterModal
              closeRegisterModal={closeRegisterModal}
              isRegisterModalOpen={isRegisterModalOpen}
            />
          </Fieldset>
        )}
        {showSummary && (
          <>
            <JobSummary
              handleSummary={handleSummary}
              formInputs={formInputs}
              submitJob={postJobClick}
              isPending={isPending}
              isConfirming={isConfirming}
              isConfirmed={isConfirmed}
              postButtonDisabled={postButtonDisabled}
            />
            <LoadingModal
              closeLoadingModal={closeLoadingModal}
              isLoadingModalOpen={isLoadingModalOpen}
            />
          </>
        )}
      </div>
    );
  }
);

PostJob.displayName = 'PostJob';

export default PostJob;
