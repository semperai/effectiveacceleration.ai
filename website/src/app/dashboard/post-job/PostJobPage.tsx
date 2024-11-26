'use client';
import { AddToHomescreen } from '@/components/AddToHomescreen';
import ERC20Abi from '@/abis/ERC20.json';
import { Button } from '@/components/Button';
import { ConnectButton } from '@/components/ConnectButton';
import {
  Description,
  Field,
  FieldGroup,
  Fieldset,
  Label,
} from '@/components/Fieldset';
import { Input } from '@/components/Input';
import { Listbox, ListboxLabel, ListboxOption } from '@/components/Listbox';
import { Radio, RadioGroup } from '@/components/Radio';
import TagsInput from '@/components/TagsInput';
import { Text } from '@/components/Text';
import { Textarea } from '@/components/Textarea';
import { TokenSelector } from '@/components/TokenSelector';
import useArbitrators from '@/hooks/useArbitrators';
import useUser from '@/hooks/useUser';
import useUsers from '@/hooks/useUsers';
import { ComboBoxOption, JobFormInputData, Tag } from '@/service/FormsTypes';
import { Token, tokens } from '@/tokens';
import { LOCAL_JOBS_OWNER_CACHE } from '@/utils/constants';
import { jobMeceTags } from '@/utils/jobMeceTags';
import { convertToSeconds, shortenText, unitsDeliveryTime } from '@/utils/utils';
import { publishToIpfs } from 'effectiveacceleration-contracts';
import Config from 'effectiveacceleration-contracts/scripts/config.json';
import { MARKETPLACE_V1_ABI } from 'effectiveacceleration-contracts/wagmi/MarketplaceV1';
import { ethers } from 'ethers';
import moment from 'moment';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import React, {
  ChangeEvent,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState
} from 'react';
import { zeroAddress } from 'viem';
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract
} from 'wagmi';
import LoadingModal from './LoadingModal';
import RegisterModal from './RegisterModal';

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
  if (validation.minLength && value.length < validation.minLength) {
    return `Must be at least ${validation.minLength} characters long`;
  }
  if (validation.pattern && !validation.pattern.test(value)) {
    return 'Invalid format';
  }
  if (
    validation.mustBeGreaterThan &&
    parseFloat(value) <= parseFloat(validation.mustBeGreaterThan)
  ) {
    return `Amount must be greater than ${validation.mustBeGreaterThan}`;
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

const JobSummary = ({
  formInputs,
  submitJob,
  isPending,
  isConfirmed,
  isConfirming,
  postButtonDisabled,
  handleSummary,
}: {
  formInputs: JobFormInputData[];
  isPending: boolean;
  isConfirming: boolean;
  isConfirmed: boolean;
  postButtonDisabled: boolean;
  submitJob: () => void;
  handleSummary: () => void;
}) => {
  return (
    <div>
      <div className='mb-6'>
        <h1 className='mb-1 text-3xl font-bold'>Summary</h1>
        <span className='text-darkBlueFont'>
          Before you submit your job, please double check your answers.
        </span>
      </div>
      <div className='flex flex-col rounded-3xl bg-white p-8 shadow-md'>
        <table className='w-full'>
          <tbody>
            {formInputs.map(
              (inputData, index) =>
                inputData.inputInfo && (
                  <tr key={index} className='mb-8 flex'>
                    <td className='w-1/2 font-bold'>{inputData.label}</td>
                    <td className='flex grow-[2]'>{inputData.inputInfo}</td>
                  </tr>
                )
            )}
          </tbody>
        </table>
      </div>
      <div className='mb-40 mt-5 flex justify-end'>
        <Button
          color={'cancelBorder'}
          className={'mr-5'}
          onClick={handleSummary}
        >
          Go back
        </Button>
        <Button disabled={postButtonDisabled || isPending} onClick={submitJob}>
          {(() => {
            if (isConfirmed) {
              return <>Transaction confirmed</>;
            }
            if (isConfirming) {
              return <>Waiting for confirmation...</>;
            }
            if (isPending) {
              return <>Posting...</>;
            }
            return <>Post Job</>;
          })()}
        </Button>
      </div>
    </div>
  );
};


const PostJob = forwardRef<{ jobIdCache: (jobId: bigint) => void }, {}>(
  (props, ref) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { address, isConnected } = useAccount();
    const { data: user } = useUser(address!);
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
    const noYes = ['No', 'Yes'];
    const [showSummary, setShowSummary] = useState(false);
    const [title, setTitle] = useState<string>('');
    const [deliveryMethod, setDeliveryMethod] = useState(
      deliveryMethods[0].value
    );
    const [description, setDescription] = useState<string>('');
    const [amount, setAmount] = useState('');
    const [deadline, setDeadline] = useState<number>();
    const [imFeelingLucky, setImFeelingLucky] = useState(
      noYes[0]
    );
    const [arbitratorRequired, setArbitratorRequired] = useState(
      noYes[1]
    );
    const [selectedUnitTime, setselectedUnitTime] = useState<ComboBoxOption>(
      unitsDeliveryTime[2]
    );

    const [tags, setTags] = useState<Tag[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<{
      id: string;
      name: string;
    }>();
    const [selectedWorkerAddress, setSelectedWorkerAddress] = useState<
      string | undefined
    >(undefined);
    const [selectedArbitratorAddress, setSelectedArbitratorAddress] =
      useState<string>();
    const [titleError, setTitleError] = useState<string>('');
    const [descriptionError, setDescriptionError] = useState<string>('');
    const [categoryError, setCategoryError] = useState<string>('');
    const [paymentTokenError, setPaymentTokenError] = useState<string>('');
    const [arbitratorError, setArbitratorError] = useState<string>('');
    const [deadlineError, setDeadlineError] = useState<string>('');
    const [postButtonDisabled, setPostButtonDisabled] = useState(false);
    const jobTitleRef = useRef<HTMLDivElement>(null);
    const jobDescriptionRef = useRef<HTMLDivElement>(null);
    const jobCategoryRef = useRef<HTMLDivElement>(null);
    const jobAmountRef = useRef<HTMLDivElement>(null);
    const jobDeadlineRef = useRef<HTMLDivElement>(null);
    const jobArbitratorRef = useRef<HTMLDivElement>(null);
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
    const [isLoadingModalOpen, setIsLoadingModalOpen] = useState(false);
    const userJobCache = `${address}${LOCAL_JOBS_OWNER_CACHE}`;
    const unregisteredUserLabel = `${address}-unregistered-job-cache`;
    const { data: hash, error, isPending, writeContract } = useWriteContract();
    console.log(selectedUnitTime, selectedCategory)
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
      const deadlineInSeconds = deadline ? convertToSeconds(deadline, selectedUnitTime.name) : 0;
      const w = writeContract({
        abi: MARKETPLACE_V1_ABI,
        address: Config.marketplaceAddress as `0x${string}`,
        functionName: 'publishJobPost',
        args: [
          title,
          contentHash as `0x${string}`,
          imFeelingLucky === 'No',
          [selectedCategory.id, ...tags.map((tag) => tag.name)],
          selectedToken?.id! as `0x${string}`,
          ethers.parseUnits(amount, selectedToken?.decimals!),
          deadlineInSeconds,
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
        imFeelingLucky: imFeelingLucky === 'No',
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
      if (!balanceData) {
        throw new Error('Balance data is not available');
      }
      // Ensure balanceData is of type ethers.BigNumberish
      const balanceAsString = ethers
        .formatUnits(
          balanceData as ethers.BigNumberish,
          selectedToken?.decimals as number
        )
        .toString();

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

      const paymentTokenValidationMessage = validateField(amount, {
        mustBeLessThanOrEqualTo: balanceAsString,
        mustBeGreaterThan: '0',
        required: true,
      });

      let arbitratorValidationMessage = '';
      if (arbitratorRequired === 'Yes') {
        if (
          !selectedArbitratorAddress ||
          selectedArbitratorAddress === zeroAddress
        ) {
          arbitratorValidationMessage = 'Please select an arbitrator';
        }
      }

      const deadlineValidationMessage = validateField(
        deadline ? deadline.toString() : '',
        {
          mustBeGreaterThan: '0',
          required: true,
        }
      );
      setTitleError(titleValidationMessage);
      setDescriptionError(descriptionValidationMessage);
      setCategoryError(categoryValidationMessage);
      setPaymentTokenError(paymentTokenValidationMessage);
      setArbitratorError(arbitratorValidationMessage);
      setDeadlineError(deadlineValidationMessage);
      if (
        !titleValidationMessage &&
        !descriptionValidationMessage &&
        !categoryValidationMessage &&
        !paymentTokenValidationMessage &&
        !arbitratorValidationMessage &&
        !deadlineValidationMessage
      ) {
        // Proceed with form submission
        handleSummary();
      } else {
        console.log('Form has errors');
        if (titleValidationMessage) {
          jobTitleRef.current?.focus();
          jobTitleRef.current?.scrollIntoView({ behavior: 'smooth' });
          return;
        }

        if (descriptionValidationMessage) {
          jobDescriptionRef.current?.focus();
          jobDescriptionRef.current?.scrollIntoView({ behavior: 'smooth' });
          return;
        }

        if (categoryValidationMessage) {
          jobCategoryRef.current?.focus();
          jobCategoryRef.current?.scrollIntoView({ behavior: 'smooth' });
          return;
        }

        if (paymentTokenValidationMessage) {
          jobAmountRef.current?.focus();
          jobAmountRef.current?.scrollIntoView({ behavior: 'smooth' });
          return;
        }

        if (arbitratorValidationMessage) {
          jobArbitratorRef.current?.focus();
          jobArbitratorRef.current?.scrollIntoView({ behavior: 'smooth' });
          return;
        }
      }
    };

    const formInputs: JobFormInputData[] = [
      { label: 'Job Title', inputInfo: title },
      { label: 'Description', inputInfo: description },
      { label: 'I\'m feeling lucky', inputInfo: imFeelingLucky },
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
          setIsLoadingModalOpen(true);
        }
      }
    }, [isConfirmed, error]);

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
        setSelectedArbitratorAddress(job.roles?.arbitrator || '');
      }
      setDeadline(parseInt(job.maxTime || '0'));
      // delete unregisteredUserLabel as this only should be consumed after user regis
      sessionStorage.removeItem(unregisteredUserLabel);
      handleSummary();
    };

    // show all validations on first render
    const [initialRenderValidation, setInitialRenderValidation] =
      useState(false);
    useEffect(() => {
      if (!initialRenderValidation) {
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
                potential candidates.
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
                    placeholder='A short descriptive title for the job post'
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
                    placeholder='Provide a thorough description of the job, omitting any private details which may be revealed in chat. Include the job requirements, deliverables, and any other relevant information. Too simple of a job description may make it difficult for agents to infer what you actually are asking for.'
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
                <Field>
                  <div className='flex flex-row items-center justify-between'>
                    <Label className='items-center'>I&apos;m feeling lucky</Label>
                    <RadioGroup
                      className='!mt-0 flex'
                      value={imFeelingLucky}
                      onChange={setImFeelingLucky}
                      aria-label='Server size'
                    >
                      {noYes.map((option) => (
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
                  </div>
                  <Description>
                    Enabling this allows worker to automatically start the job without you approving them first.
                  </Description>
                </Field>
                <Field>
                  <Label>Category</Label>
                  <div ref={jobCategoryRef} className='scroll-mt-20' />
                  <Listbox
                    placeholder='Select Category'
                    value={selectedCategory}
                    onChange={(c) => {
                      setSelectedCategory(c);
                      setCategoryError('');
                    }}
                  >
                    {jobMeceTags.map(
                      (category, index) =>
                        index > 0 && (
                          <ListboxOption key={index} value={category}>
                            <ListboxLabel>
                              {jobMeceTags[index].name}
                            </ListboxLabel>
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
                  <Description>
                    Tags help workers find your job post. Select tags that best describe the job and its requirements.
                  </Description>
                </Field>
              </FieldGroup>
              <FieldGroup className='flex-1'>
                <div className='flex flex-row justify-between gap-5'>
                  <Field className='flex-1'>
                    <Label>Payment Amount</Label>
                    <div className='scroll-mt-20' ref={jobAmountRef} />
                    <Input
                      name='amount'
                      placeholder='1.00'
                      type='number'
                      value={amount}
                      min={0}
                      onChange={(e) => {
                        const value = e.target.value;
                        const sanitizedValue =
                          value === ''
                            ? ''
                            : parseFloat(value) < 0
                              ? -value
                              : value;

                        handleInputChange(setAmount, setPaymentTokenError, {
                          mustBeLessThanOrEqualTo: ethers.formatUnits(
                            (balanceData as ethers.BigNumberish) || 0,
                            selectedToken?.decimals || 0
                          ),
                          mustBeGreaterThan: '0',
                          required: true,
                        })({
                          ...e,
                          target: {
                            ...e.target,
                            value: sanitizedValue.toString(),
                          },
                        });
                      }}
                    />
                    {paymentTokenError && (
                      <div className='text-xs' style={{ color: 'red' }}>
                        {paymentTokenError}
                      </div>
                    )}
                    <Description>
                      Your funds will be locked until the job is completed. Or, if you cancel the job posting, available for withdraw after a 24 hour period.
                    </Description>
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
                  >
                    {deliveryMethods.map((method, index) => (
                      <ListboxOption key={index} value={method.value}>
                        <ListboxLabel>
                          {deliveryMethods[index].label}
                        </ListboxLabel>
                      </ListboxOption>
                    ))}
                  </Listbox>
                  <Description>
                    What delivery method should the worker use? For digital items usually IPFS is the correct choice. For jobs that do not involve a digital deliverable (such as posting online), digital proof can be used. For physical items such as selling computer equipment use courier.
                  </Description>
                </Field>
                <Field>
                  <div className='flex flex-row items-center justify-between'>
                    <Label className='mb-0 items-center pb-0 !font-bold'>
                      Arbitrator Required
                    </Label>
                    <RadioGroup
                      className='!mt-0 flex'
                      value={arbitratorRequired}
                      onChange={(value) => {
                        setArbitratorRequired(value);
                        if (value === 'No') {
                          setSelectedArbitratorAddress(zeroAddress);
                        } else {
                          if (
                            !selectedArbitratorAddress ||
                            selectedArbitratorAddress === zeroAddress
                          ) {
                            setArbitratorError('Please select an arbitrator');
                          }
                        }
                      }}
                      aria-label='Arbitrator Required'
                    >
                      {noYes.map((option) => (
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
                  </div>
                  <Description>
                    Without an arbitrator, disputes on job completion must be handled by the creator and worker directly. Arbitrators are third-party entities that can help resolve disputes.
                  </Description>
                </Field>
                {arbitratorRequired === 'Yes' && (
                  <>
                    <Field>
                      <div className='scroll-mt-20' ref={jobArbitratorRef} />
                      <Listbox
                        placeholder='Select Arbitrator'
                        value={selectedArbitratorAddress}
                        onChange={(e) => {
                          setSelectedArbitratorAddress(e);
                          setArbitratorError('');
                        }}
                      >
                        {arbitratorAddresses.map(
                          (arbitratorAddress, index) =>
                            index > 0 && (
                              <ListboxOption
                                key={index}
                                value={arbitratorAddress}
                              >
                                <ListboxLabel>
                                  <span className="">{arbitratorNames[index]}</span>
                                  {' '}
                                  <span className="text-sm text-gray-500 ml-4">{shortenText({ text: arbitratorAddress, maxLength: 11 })}</span>
                                  {' '}
                                  <span className="bold ml-4">{+arbitratorFees[index] / 100}%</span>
                                </ListboxLabel>
                              </ListboxOption>
                            )
                        )}
                      </Listbox>
                      {arbitratorError && (
                        <div className='text-xs' style={{ color: 'red' }}>
                          {arbitratorError}
                        </div>
                      )}
                      <Description>
                        Make sure to choose an arbitrator that you trust to resolve disputes fairly. Arbitrators charge a small fee for their services, which is deducted from the job payment. ArbitrationDAO is a decentralized arbitration service that can be used.
                      </Description>
                    </Field>
                  </>
                )}

                <div className='flex flex-row justify-between gap-5'>
                  <Field className='flex-1'>
                    <Label>
                      Maximum delivery time{' '}
                      in {selectedUnitTime.name}
                    </Label>
                    <div className='scroll-mt-20' ref={jobDeadlineRef} />
                    <Input
                      name='deadline'
                      type='number'
                      placeholder={`Maximum delivery time in ${selectedUnitTime.name}`}
                      value={deadline}
                      min={1}
                      step={1}
                      onChange={(e) => {
                        let deadline = parseInt(e.target.value);
                        if (deadline < 0) {
                          deadline = -deadline;
                        }
                        setDeadline(deadline);
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
                    <Listbox
                      placeholder='Time Units'
                      value={selectedUnitTime}
                      onChange={(e) => setselectedUnitTime(e)}
                    >
                      {unitsDeliveryTime.map(
                        (timeUnit, index) =>
                          index > 0 && (
                            <ListboxOption key={index} value={timeUnit}>
                              <ListboxLabel>
                                {unitsDeliveryTime[index].name}
                              </ListboxLabel>
                            </ListboxOption>
                          )
                      )}
                    </Listbox>
                  </Field>
                </div>
              </FieldGroup>
            </div>
            {!showSummary && (
              <div className='mb-40 mt-5 flex justify-end'>
                {isConnected && (
                  <Button
                    // disabled={postButtonDisabled || isPending}
                    // onClick={postJobClick}
                    onClick={handleSubmit}
                  >
                    {isPending ? 'Posting...' : 'Continue'}
                  </Button>
                )}
                {!isConnected && (
                  <ConnectButton />
                )}
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
        <AddToHomescreen />
      </div>
    );
  }
);

PostJob.displayName = 'PostJob';

export default PostJob;
