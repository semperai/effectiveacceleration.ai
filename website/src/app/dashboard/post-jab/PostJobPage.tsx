'use client';
import ERC20Abi from '@/abis/ERC20.json';
import { AddToHomescreen } from '@/components/AddToHomescreen';
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
import { Radio, RadioGroup } from '@/components/Radio';
import TagsInput from '@/components/TagsInput';
import { Text } from '@/components/Text';
import { Textarea } from '@/components/Textarea';
import { TokenSelector } from '@/components/TokenSelector';
import useArbitrators from '@/hooks/subsquid/useArbitrators';
import useUser from '@/hooks/subsquid/useUser';
import { useConfig } from '@/hooks/useConfig';
import { ComboBoxOption, Tag } from '@/service/FormsTypes';
import { Token, tokens } from '@/tokens';
import { jobMeceTags } from '@/utils/jobMeceTags';
import {
  convertToSeconds,
  shortenText,
  unitsDeliveryTime,
} from '@/utils/utils';
import { ethers } from 'ethers';
import moment from 'moment';
import Link from 'next/link';
import React, {
  ChangeEvent,
  LegacyRef,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from 'react';
import { zeroAddress } from 'viem';
import { useAccount, useReadContract } from 'wagmi';
import LoadingModal from './LoadingModal';
import RegisterModal from './RegisterModal';
import { SubmitJobButton } from './SubmitJobButton';
import { Combobox } from '@/components/ComboBox';
import ListBox from '@/components/ListBox';

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
    children,
  }: {
    label: string;
    children?: React.ReactNode;
  }) => (
    <div className='py-4 first:pt-0 last:pb-0'>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
        <div className='text-sm font-medium text-gray-500'>{label}</div>
        <div className='text-sm text-gray-900 md:col-span-2'>{children}</div>
      </div>
    </div>
  );
  const deliveryMethodName = deliveryMethods.find(
    (method) => method.id === deliveryMethod
  )?.name;

  return (
    <div className='mx-auto max-w-4xl'>
      <div className='mb-8'>
        <h1 className='mb-2 text-3xl font-bold text-gray-900'>Summary</h1>
        <p className='text-gray-600'>
          Before you submit your job, please double check your answers.
        </p>
      </div>

      <div className='mb-8 rounded-2xl bg-white p-8 shadow-lg'>
        <div className='divide-y divide-gray-200'>
          <Row label='Job Title'>{title}</Row>
          <Row label='Description'>{description}</Row>
          <Row label='Category'>{selectedCategory?.name}</Row>
          <Row label='Token'>
            <div className='flex items-center gap-2'>
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
          </Row>
          <Row label='Price'>
            <span className='mr-1 inline'>{amount}</span>
          </Row>
          <Row label='Delivery Method'>{deliveryMethodName}</Row>
          <Row label='Deadline'>
            {moment.duration(deadline, 'seconds').humanize()}
          </Row>
          <Row label='Arbitrator Required'>
            {selectedArbitratorAddress !== undefined ? 'Yes' : 'No'}
          </Row>
          <Row label='Arbitrator Address'>{selectedArbitratorAddress}</Row>
        </div>
      </div>

      <div className='flex justify-end gap-4 pb-16'>
        <Button outline onClick={handleSummary} className='px-6'>
          Go back
        </Button>
        {/* <SubmitJobButton
          title={title}
          description={description}
          multipleApplicants={imFeelingLucky === 'No'}
          tags={[selectedCategory?.id, ...tags.map((tag) => tag.name)]}
          token={selectedToken?.id as string}
          amount={ethers.parseUnits(amount, selectedToken?.decimals!)}
          deadline={BigInt(deadline)}
          deliveryMethod={deliveryMethod}
          arbitrator={selectedArbitratorAddress as string}
        /> */}
      </div>
    </div>
  );
};

const PostJob = () => {
  const Config = useConfig();
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
    process.env.NODE_ENV === 'development'
      ? tokens.find((token) => token.symbol === 'FAKE')
      : tokens.find((token) => token.symbol === 'USDC')
  );
  const noYes = ['No', 'Yes'];
  const [showSummary, setShowSummary] = useState(false);
  const [title, setTitle] = useState<string>('');
  const [deliveryMethod, setDeliveryMethod] = useState(deliveryMethods[0].id);
  const [description, setDescription] = useState<string>('');
  const [amount, setAmount] = useState('');
  const [deadline, setDeadline] = useState<number>(1);
  const [imFeelingLucky, setImFeelingLucky] = useState(noYes[0]);
  const [arbitratorRequired, setArbitratorRequired] = useState(noYes[1]);
  const [selectedUnitTime, setselectedUnitTime] = useState<ComboBoxOption>(
    unitsDeliveryTime[2]
  );

  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<
    | {
        id: string;
        name: string;
      }
    | undefined
  >(undefined);
  const [selectedArbitratorAddress, setSelectedArbitratorAddress] =
    useState<string>();
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
  const [step, setStep] = useState<number>(0);
  const { data: balanceData } = useReadContract({
    account: address,
    abi: ERC20Abi,
    address: selectedToken?.id as string | undefined,
    functionName: 'balanceOf',
    args: [address],
  });

  const handleSummary = () => {
    if (!user) {
      setIsRegisterModalOpen(true);
      return;
    }

    setShowSummary(!showSummary);
  };

  const validateTitle = (value: string) => {
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
  };

  const validatePaymentAmount = (paymentAmount: string) => {
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
  };

  const validateArbitratorRequired = (required: string) => {
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
  };

  const validateArbitrator = (addr: string) => {
    setSelectedArbitratorAddress(addr);

    if (addr == address) {
      setArbitratorError('You cannot be your own arbitrator');
      return;
    }

    setArbitratorError('');
  };

  const validateDeadline = (deadlineStr: string) => {
    if (deadlineStr === '') {
      setDeadline(NaN); // Or setDeadline(0) if you want it to default to zero
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
  };

  const validateAllFields = () => {
    validateTitle(title);
    validatePaymentAmount(amount);
    validateArbitratorRequired(arbitratorRequired);
    validateDeadline(deadline.toString());

    if (!selectedCategory) {
      setCategoryError('Please select a category');
      return false;
    }

    if (titleError || paymentTokenError || arbitratorError || deadlineError) {
      setContinueButtonDisabled(true);
      return false;
    }

    setContinueButtonDisabled(false);
    return true;
  };

  useEffect(() => {
    validateAllFields();
  }, [
    balanceData,
    title,
    amount,
    selectedCategory,
    selectedToken,
    arbitratorRequired,
    selectedArbitratorAddress,
    deadline,
  ]);

  const handleSubmit = () => {
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
  };
  const steps = [
    <FormStepTitle
      title={title}
      description={description}
      jobTitleRef={jobTitleRef}
      jobDescriptionRef={jobDescriptionRef}
      validateTitle={validateTitle}
      setDescription={setDescription}
      titleError={titleError}
      descriptionError={descriptionError}
    />,
    <FormStepSkills
      imFeelingLucky={imFeelingLucky}
      setImFeelingLucky={setImFeelingLucky}
      noYes={noYes}
      selectedCategory={selectedCategory}
      setSelectedCategory={setSelectedCategory}
      setCategoryError={setCategoryError}
      jobCategoryRef={jobCategoryRef}
      categoryError={categoryError}
      tags={tags}
      setTags={setTags}
    />,
    <FormStepPayment
      selectedToken={selectedToken}
      amount={amount}
      deliveryMethod={deliveryMethod}
      deadline={deadline}
      selectedArbitratorAddress={selectedArbitratorAddress}
      selectedCategory={selectedCategory}
      handleSummary={handleSummary}
      jobAmountRef={jobAmountRef}
      validatePaymentAmount={validatePaymentAmount}
      paymentTokenError={paymentTokenError}
      setSelectedToken={setSelectedToken}
      balanceData={balanceData as ethers.BigNumberish}
      setDeliveryMethod={setDeliveryMethod}
      setCategoryError={setCategoryError}
      validateArbitratorRequired={validateArbitratorRequired}
      noYes={noYes}
      jobArbitratorRef={jobArbitratorRef}
      arbitratorAddresses={arbitratorAddresses}
      arbitratorNames={arbitratorNames}
      validateArbitrator={validateArbitrator}
      jobDeadlineRef={jobDeadlineRef}
      validateDeadline={validateDeadline}
      setselectedUnitTime={setselectedUnitTime}
    />,
    // <JobSummary
    //   handleSummary={handleSummary}    overflow-x: hidden;
    //   title={title}
    //   description={description}
    //   imFeelingLucky={imFeelingLucky}
    //   tags={tags}
    //   deliveryMethod={deliveryMethod}
    //   selectedToken={selectedToken}
    //   amount={amount}
    //   selectedCategory={selectedCategory as { id: string; name: string }}
    //   deadline={convertToSeconds(deadline, selectedUnitTime.name)}
    //   selectedArbitratorAddress={selectedArbitratorAddress}
    // />,
    // <div>successs</div>
  ];

  const maxStep = steps.length - 1;
  return (
    <div>
      {!showSummary && (
        <Fieldset className='w-full'>
          <div className='px-4 pb-4 pt-7 sm:px-6 lg:px-8'>
            <h1 className='mb-2 text-3xl font-bold'>Create a Job Post</h1>
            <span>
              Complete the form below to post your job and connect with
              potential candidates.
            </span>
          </div>
          <div className='border-gray h-full w-full overflow-x-hidden border-t bg-white'>
            <div
              className='flex transition-transform duration-500 ease-in-out'
              style={{ transform: `translateX(-${step * 100}%)` }}
            >
              {steps.map((stepContent, index) => (
                <div
                  key={index}
                  className='w-full flex-shrink-0 px-4 pb-4 pt-7 sm:px-8'
                >
                  {stepContent}
                </div>
              ))}
            </div>

            <div className='mt-4 flex justify-between px-4'>
              <Button
                className='rounded bg-gray-300 px-4 py-2 disabled:opacity-50'
                onClick={() => setStep((prev) => Math.max(prev - 1, 0))}
                disabled={step === 0}
              >
                Prev
              </Button>
              <Button
                className='rounded bg-blue-500 px-4 py-2 text-white disabled:opacity-50'
                onClick={() => setStep((prev) => Math.min(prev + 1, maxStep))}
                disabled={step === maxStep}
              >
                Next
              </Button>
            </div>
          </div>
          {!showSummary && (
            <div className='mb-40 mt-5 flex justify-end'>
              {isConnected && (
                <Button
                  disabled={continueButtonDisabled}
                  onClick={handleSubmit}
                >
                  Continue
                </Button>
              )}
              {!isConnected && <ConnectButton />}
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

interface FormStepTitleProps {
  title: string;
  description: string;
  jobTitleRef: LegacyRef<HTMLDivElement> | undefined;
  jobDescriptionRef: LegacyRef<HTMLDivElement> | undefined;
  validateTitle: (value: string) => void;
  setDescription: (value: string) => void;
  titleError: string;
  descriptionError: string;
}

const FormStepTitle = ({
  title,
  description,
  jobTitleRef,
  jobDescriptionRef,
  validateTitle,
  titleError,
  setDescription,
  descriptionError,
}: FormStepTitleProps) => {
  return (
    <div className='flex w-full flex-col gap-8 lg:flex-row lg:gap-24'>
            <div className='flex-1'>
        <span>1/4 Title</span>
        <h2 className='text-4xl font-bold'>First, let’s create a title and description</h2>
        <span>
          This will make your post easy to find and understand for the right
          freelancer
        </span>
      </div>
      <FieldGroup className='flex-1'>
        <Field>
          <Label>Job Title</Label>
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
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
              // TODO add max length validation
              setDescription(e.target.value);
            }}
          />
          {descriptionError && (
            <div className='text-xs' style={{ color: 'red' }}>
              {descriptionError}
            </div>
          )}
        </Field>
      </FieldGroup>
    </div>
  );
};

interface FormStepSkillsProps {
  imFeelingLucky: string;
  setImFeelingLucky: (value: string) => void;
  noYes: string[];
  selectedCategory:
    | {
        id: string;
        name: string;
      }
    | undefined;
  setSelectedCategory: React.Dispatch<
    React.SetStateAction<{ id: string; name: string } | undefined>
  >;
  setCategoryError: (value: string) => void;
  jobCategoryRef: LegacyRef<HTMLDivElement> | undefined;
  categoryError: string;
  tags: Tag[];
  setTags: (tags: Tag[]) => void;
}

const FormStepSkills = ({
  imFeelingLucky,
  setImFeelingLucky,
  noYes,
  selectedCategory,
  setSelectedCategory,
  setCategoryError,
  jobCategoryRef,
  categoryError,
  tags,
  setTags,
}: FormStepSkillsProps) => {
  return (
    <div className='flex w-full flex-col gap-8 lg:flex-row lg:gap-24'>
      <FieldGroup className='flex-1'>
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
                <Field className='!mt-0 ml-5 flex items-center' key={option}>
                  <Radio className='mr-2' color='default' value={option}>
                    <span>{option}</span>
                  </Radio>
                  <Label>{option}</Label>
                </Field>
              ))}
            </RadioGroup>
          </div>
          <Description>
            Enabling this allows worker to automatically start the job without
            you approving them first.
          </Description>
        </Field>
        <Field>
          <Label>Category</Label>
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
            Tags help workers find your job post. Select tags that best describe
            the job and its requirements.
          </Description>
        </Field>
      </FieldGroup>
    </div>
  );
};

interface FormStepPaymentProps {
  selectedToken: Token | undefined;
  amount: string;
  deliveryMethod: string;
  deadline: number;
  selectedArbitratorAddress: string | undefined;
  selectedCategory:
    | {
        id: string;
        name: string;
      }
    | undefined;
  handleSummary: () => void;
  jobAmountRef: LegacyRef<HTMLDivElement> | undefined;
  validatePaymentAmount: (paymentAmount: string) => void;
  paymentTokenError: string;
  setSelectedToken: (token: Token) => void;
  balanceData: ethers.BigNumberish | null | undefined;
  setDeliveryMethod: (method: string) => void;
  setCategoryError: (value: string) => void;
  arbitratorRequired?: string;
  validateArbitratorRequired: (required: string) => void;
  noYes: string[];
  jobArbitratorRef: LegacyRef<HTMLDivElement> | undefined;
  arbitratorAddresses: string[];
  arbitratorNames: string[];
  validateArbitrator: (addr: string) => void;
  arbitratorError?: string;
  selectedUnitTime?: ComboBoxOption;
  jobDeadlineRef: LegacyRef<HTMLDivElement> | undefined;
  validateDeadline: (deadlineStr: string) => void;
  deadlineError?: string;
  setselectedUnitTime: (unit: ComboBoxOption) => void;
  arbitratorFees?: string[] | undefined;
}

const FormStepPayment = ({
  selectedToken,
  amount,
  deliveryMethod,
  deadline,
  selectedArbitratorAddress,
  selectedCategory,
  handleSummary,
  jobAmountRef,
  validatePaymentAmount,
  paymentTokenError,
  setSelectedToken,
  balanceData,
  setDeliveryMethod,
  setCategoryError,
  arbitratorRequired,
  validateArbitratorRequired,
  noYes,
  jobArbitratorRef,
  arbitratorAddresses,
  arbitratorNames,
  validateArbitrator,
  arbitratorError,
  selectedUnitTime,
  jobDeadlineRef,
  validateDeadline,
  deadlineError,
  setselectedUnitTime,
  arbitratorFees,
}: FormStepPaymentProps) => {
  return (
    <div className='flex w-full flex-col gap-8 lg:flex-row lg:gap-24'>
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
              onChange={(e) => validatePaymentAmount(e.target.value)}
            />
            {paymentTokenError && (
              <div className='text-xs' style={{ color: 'red' }}>
                {paymentTokenError}
              </div>
            )}
            <Description>
              Your funds will be locked until the job is completed. Or, if you
              cancel the job posting, available for withdraw after a 24 hour
              period.
            </Description>
          </Field>
          <Field className='flex-1'>
            <Label>Payment Token</Label>
            <div className='mt-[7px] flex flex-col gap-y-2'>
              <div className='flex items-center gap-x-2'>
                <div>
                  <div className='flex flex-col gap-4'>
                    <TokenSelector
                      selectedToken={selectedToken}
                      onClick={(token: Token) => setSelectedToken(token)}
                    />
                  </div>
                  {selectedToken &&
                  balanceData !== null &&
                  balanceData !== undefined ? (
                    <Text className='text-xs'>
                      Balance:{' '}
                      {ethers.formatUnits(
                        balanceData as ethers.BigNumberish,
                        selectedToken.decimals
                      )}{' '}
                      {selectedToken.symbol}
                    </Text>
                  ) : (
                    <Text className='!text-xs' style={{ color: 'red' }}>
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
          <ListBox
            placeholder='Delivery Method'
            value={deliveryMethod}
            onChange={(method) => {
              if (typeof method !== 'string') {
                setDeliveryMethod(method.id);
                setCategoryError('');
              }
            }}
            options={deliveryMethods}
          />
          <Description>
            What delivery method should the worker use? For digital items
            usually IPFS is the correct choice. For jobs that do not involve a
            digital deliverable (such as posting online), digital proof can be
            used. For physical items such as selling computer equipment use
            courier.
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
              onChange={(value) => validateArbitratorRequired(value)}
              aria-label='Arbitrator Required'
            >
              {noYes.map((option) => (
                <Field className='!mt-0 ml-5 flex items-center' key={option}>
                  <Radio color='default' className='mr-2' value={option}>
                    <span>{option}</span>
                  </Radio>
                  <Label>{option}</Label>
                </Field>
              ))}
            </RadioGroup>
          </div>
          <Description>
            Without an arbitrator, disputes on job completion must be handled by
            the creator and worker directly. Arbitrators are third-party
            entities that can help resolve disputes.
          </Description>
        </Field>

        {arbitratorRequired === 'Yes' && (
          <>
            <Field>
              <div className='scroll-mt-20' ref={jobArbitratorRef} />
              <Combobox
                placeholder='Select Arbitrator'
                value={selectedArbitratorAddress || ''}
                options={arbitratorAddresses.map((address, index) => ({
                  value: address,
                  label: `${arbitratorNames[index]} ${shortenText({ text: address, maxLength: 11 })} ${+(arbitratorFees ? arbitratorFees[index] : '0') / 100}%
`,
                }))}
                onChange={(addr) => validateArbitrator(addr)}
              />
              {arbitratorError && (
                <div className='text-xs' style={{ color: 'red' }}>
                  {arbitratorError}
                </div>
              )}
              <Description>
                Make sure to choose an arbitrator that you trust to resolve
                disputes fairly. Arbitrators charge a small fee for their
                services, which is deducted from the job payment. ArbitrationDAO
                is a decentralized arbitration service that can be used.
              </Description>
            </Field>
          </>
        )}

        <div className='flex flex-row justify-between gap-5'>
          <Field className='flex-1'>
            <Label>Maximum delivery time in {selectedUnitTime?.name}</Label>
            <div className='scroll-mt-20' ref={jobDeadlineRef} />
            <Input
              name='deadline'
              type='number'
              placeholder={`Maximum delivery time in ${selectedUnitTime?.name}`}
              value={deadline}
              min={1}
              step={1}
              onChange={(e) => validateDeadline(e.target.value)}
            />
            {deadlineError && (
              <div className='text-xs' style={{ color: 'red' }}>
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
                  setselectedUnitTime(unit);
                }
              }}
              options={unitsDeliveryTime.map((unit) => ({
                id: unit.id.toString(),
                name: unit.name,
              }))}
            />
          </Field>
        </div>
      </FieldGroup>
    </div>
  );
};
