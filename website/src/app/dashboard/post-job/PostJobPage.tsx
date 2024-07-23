'use client'
import React, { ChangeEvent, FormEvent } from 'react'
import { ethers } from 'ethers'
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'
import ERC20Abi from '@/abis/ERC20.json'
import Config from 'effectiveacceleration-contracts/scripts/config.json'
import { MARKETPLACE_V1_ABI } from 'effectiveacceleration-contracts/wagmi/MarketplaceV1'
import { useEffect, useState } from 'react'
import { Layout } from '@/components/Dashboard/Layout'
import { Button } from '@/components/Button'
import { Description, Field, FieldGroup, Fieldset, Label } from '@/components/Fieldset'
import { Text } from '@/components/Text'
import { Textarea } from '@/components/Textarea'
import { Input } from '@/components/Input'
import { TokenSelector } from '@/components/TokenSelector'
import { Token, tokens } from '@/tokens'
import { Radio, RadioGroup } from '@/components/Radio'
import { Listbox, ListboxOption } from '@/components/Listbox'
import { publishToIpfs } from 'effectiveacceleration-contracts'
import { zeroAddress } from 'viem'
import useUsers from '@/hooks/useUsers'
import useArbitrators from '@/hooks/useArbitrators'
import { ComboBox } from '@/components/ComboBox'
import { ComboBoxOption, JobFormInputData, Tag } from '@/service/FormsTypes'
import JobSummary from './JobSummary'
import Image from 'next/image'
import moment from 'moment'
import TagsInput from '@/components/TagsInput'
import { BsInfoCircle } from 'react-icons/bs'
import useShortenText from '@/hooks/useShortenText'

interface FieldValidation {
  required?: boolean;
  minLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => string;
}

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

function PostJobPage() {
  const { address } = useAccount();
  const {
    data: hash,
    error,
    isPending,
    writeContract,
  } = useWriteContract();
  const { data: workers } = useUsers();
  const workerAddresses = workers?.filter(worker => worker.address_ !== address).map((worker) => worker.address_) ?? [];
  const workerNames = workers?.filter(worker => worker.address_ !== address).map((worker) => worker.name) ?? [];

  const { data: arbitrators } = useArbitrators();
  const arbitratorAddresses = [zeroAddress, ...(arbitrators?.map((worker) => worker.address_) ?? [])];
  const arbitratorNames = ["None", ...(arbitrators?.map((worker) => worker.name) ?? [])];
  const arbitratorFees = ["0", ...(arbitrators?.map((worker) => worker.fee) ?? [])];
  console.log(arbitrators, 'arbitrators')

  const [selectedToken, setSelectedToken] = useState<Token | undefined>(tokens[0]);
  const multipleApplicantsValues = ['Yes', 'No']

  const unitsDeliveryTime = [
    { id: 0, name: 'minutes' },
    { id: 1, name: 'hours' },
    { id: 2, name: 'days' },
    { id: 3, name: 'weeks' },
    { id: 4, name: 'months' },
    { id: 5, name: 'years' },
  ]

  const categories = [
    { id: "DA", name: "Digital Audio" },
    { id: "DV", name: "Digital Video" },
    { id: "DT", name: "Digital Text" },
    { id: "DS", name: "Digital Software" },
    { id: "DO", name: "Digital Others" },
    { id: "NDG", name: "Non-Digital Goods" },
    { id: "NDS", name: "Non-Digital Services" },
    { id: "NDO", name: "Non-Digital Others" },
  ]


  const [showSummary, setShowSummary] = useState(false);


  const [title, setTitle] = useState<string>('');
  const [deliveryMethod, setDeliveryMethod] = useState('');
  const [description, setDescription] = useState<string>('');
  // const [amount, setAmount] = useState(ethers.formatUnits(0, 0));
  const [amount, setAmount] = useState('');
  const [deadline, setDeadline] = useState<number>();
  const [multipleApplicants, setMultipleApplicants] = useState(multipleApplicantsValues[1])
  const [arbitratorRequired, setArbitratorRequired] = useState(multipleApplicantsValues[0])
  const [selectedUnitTime, setselectedUnitTime] = useState<ComboBoxOption>()
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<{id: string, name: string}>();
  const [selectedWorkerAddress, setsSelectedWorkerAddress] = useState<string | undefined>(undefined);
  const [selectedArbitratorAddress, setsSelectedArbitratorAddress] = useState<string>();

  const [postButtonDisabled, setPostButtonDisabled] = useState(false);
  useEffect(() => {
    if (
      title         == ''
    ||description   == ''
    ||amount        == '0'
    ||deadline      == 0
    ||selectedToken == undefined
    ) {
      setPostButtonDisabled(true);
    } else {
      setPostButtonDisabled(false);
    }
  }, [title, description, amount, deadline, selectedToken, error])

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
  } = useWaitForTransactionReceipt({
    hash, 
  });

  useEffect(() => {
    if (isConfirmed || error) {
      if (error) {
        console.log(error, error.message);
        alert(error.message.match(`The contract function ".*" reverted with the following reason:\n(.*)\n.*`)?.[1])
      }
    }
  }, [isConfirmed, error]);

  const handleSummary = () => {
    setShowSummary(!showSummary);
  };

  const { data: balanceData } = useReadContract({
    account:      address,
    abi:          ERC20Abi,
    address:      selectedToken?.id as `0x${string}`|undefined,
    functionName: 'balanceOf',
    args:         [address!],
  });

  if (balanceData) {
    console.log('balance', balanceData.toString())
  }

  async function postJobClick() {
    if (!deadline) return
    if (!amount) return
    if (!selectedCategory) return
    setPostButtonDisabled(true);

    console.log('posting job', title, description, selectedToken?.id, amount, deadline);

    const { hash: contentHash } = await publishToIpfs(description);

    const w = writeContract({
      abi: MARKETPLACE_V1_ABI,
      address: Config.marketplaceAddress as `0x${string}`,
      functionName: 'publishJobPost',
      args: [
        title,
        contentHash as `0x${string}`,
        multipleApplicants === 'Yes',
        [selectedCategory.id, ...tags.map(tag => tag.name)],
        selectedToken?.id! as `0x${string}`,
        ethers.parseUnits(amount, selectedToken?.decimals!),
        deadline,
        deliveryMethod,
        selectedArbitratorAddress as `0x${string}`,
        selectedWorkerAddress ? [selectedWorkerAddress as `0x${string}`] : [],
      ],
    });

    console.log('writeContract', w);
  }

  const [titleError, setTitleError] = useState<string>('');
  const [descriptionError, setDescriptionError] = useState<string>('');

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>, errorSetter: React.Dispatch<React.SetStateAction<string>>, validation: FieldValidation) => (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setter(value);
    const errorMessage = validateField(value, validation);
    errorSetter(errorMessage);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Validate all fields before submission
    const titleValidationMessage = validateField(title, { required: true, minLength: 3 });
    const descriptionValidationMessage = validateField(description, { required: true, minLength: 10 });

    setTitleError(titleValidationMessage);
    setDescriptionError(descriptionValidationMessage);

    if (!titleValidationMessage && !descriptionValidationMessage) {
      // Proceed with form submission
      console.log('Form is valid');
    } else {
      console.log('Form has errors');
    }
  };
  const formInputs: JobFormInputData[] = [
    { label: 'Job Title', inputInfo: title },
    { label: 'Description', inputInfo: description },
    { label: 'Multiple Applicants', inputInfo: multipleApplicants},
    { label: 'Category', inputInfo: selectedCategory?.name },
    { label: 'Tags', inputInfo: tags.map(tag => tag.name).join(', ') },
    { label: 'Token', inputInfo: <div className='flex items-center'><span className=' inline mr-1'>{selectedToken?.id}</span><span className='font-bold inline mr-1'>{selectedToken?.symbol}</span><img className='inline' alt='Chain Icon' height={30} width={30} src={selectedToken?.icon || ''}/></div> },
    { label: 'Price', inputInfo: <><span className='inline mr-1'>{amount}</span></> },
    { label: 'Delivery Method', inputInfo:  deliveryMethod },
    { label: 'Deadline', inputInfo:   moment.duration(deadline, selectedUnitTime?.name as moment.unitOfTime.DurationConstructor).humanize() },
    { label: 'Arbitrator Required', inputInfo: arbitratorRequired},
    { label: 'Arbitrator Address', inputInfo: selectedArbitratorAddress },
    { label: 'Worker Address', inputInfo: selectedWorkerAddress },
  ];

  return (
    <div>
      {!showSummary && (
      <Fieldset className="w-full">
        <div className='mb-10'>
          <h1 className="text-3xl font-bold mb-2">Create a Job Post</h1>
          <span>Complete the form below to post your job and connect with potential AI candidates.</span>
        </div>

        <div className=' flex flex-row w-full gap-24'>
          <FieldGroup className='flex-1'> 
            <Field>
              <Label>Job Title</Label>
              <Input
                name="title"
                value={title}
                placeholder='Title'
                onChange={handleInputChange(setTitle, setTitleError, { required: true, minLength: 3 })}
              />
              {titleError && <div className='text-xs' style={{ color: 'red' }}>{titleError}</div>}
            </Field>
            <Field>
              <Label>Description</Label>
              <Textarea
                rows={10}
                name="description"
                placeholder='Job Description'
                value={description}
                onChange={handleInputChange(setDescription, setDescriptionError, { required: true, minLength: 10 }) as ChangeEventHandler<HTMLTextAreaElement>}
              />
                {descriptionError && <div className='text-xs' style={{ color: 'red' }}>{descriptionError}</div>}
            </Field>
            <Field className='flex flex-row justify-between items-center'>
              <Label className='items-center'>Multiple Applicants</Label>
              <RadioGroup className='flex !mt-0' value={multipleApplicants} onChange={setMultipleApplicants} aria-label="Server size">
                {multipleApplicantsValues.map((option) => (
                  <Field className='items-center flex !mt-0 ml-5' key={option}>
                    <Radio  className='mr-2' color='default'  value={option}>
                      <span>{option}</span>
                    </Radio>
                    <Label>{option}</Label>
  
                  </Field>
                ))}
              </RadioGroup>
            </Field>
            <Field>
              <Label>Category</Label>
              <ComboBox placeholder='Search Category...' value={selectedCategory} className="w-auto border border-gray-300 rounded-md shadow-sm bg-slate-600" 
              options={categories}  onChange={(option) => {
                setSelectedCategory(option as {id: string, name: string})
              }}></ComboBox>
            </Field>
            <Field>
              <Label>Tags</Label>
              <TagsInput tags={tags} setTags={setTags}/>
            </Field>
            <Field>

            </Field>
          </FieldGroup>
          <FieldGroup className='flex-1'> 
            <div className='flex flex-row justify-between gap-5'>
             
            <Field className='flex-1'>
              <Label>Payment Amount</Label>
              <Input
                name="amount"
                placeholder='Amount'
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <Description></Description>
            </Field>
            <Field className='flex-1'>
              <Label>Payment Token</Label>
              <div className='flex items-center gap-x-2'>
                <Input
                  name="token"
                  value={selectedToken?.id}
                  readOnly={true}
                />
                <div className="flex flex-col gap-4">
                  <TokenSelector
                    selectedToken={selectedToken}
                    onClick={(token: Token) => setSelectedToken(token)}
                  />
                </div>
                {selectedToken && !!balanceData && (
                  <Text>
                    {ethers.formatEther(balanceData as ethers.BigNumberish)}
                    {' '}
                    {selectedToken.symbol} available
                  </Text>
                )}
              </div>
            </Field>
          </div>
            <Field>
              <Label>Delivery Method</Label>
              <Input
                name="deliveryMethod"
                placeholder='e.g. IPFS'
                value={deliveryMethod}
                onChange={(e) => setDeliveryMethod(e.target.value)}
              />
            </Field>
            <Field className='flex flex-row justify-between items-center'>
            <Label className='items-center !font-bold mb-0 pb-0'>Arbitrator Required</Label>
              <RadioGroup className='flex !mt-0' value={arbitratorRequired} onChange={setArbitratorRequired} aria-label="Server size">
                {multipleApplicantsValues.map((option) => (
                  <Field className='items-center flex !mt-0 ml-5' key={option}>
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
                placeholder="Select Arbitrator"
                value={selectedArbitratorAddress}
                onChange={(e) => setsSelectedArbitratorAddress(e)}
                className="border border-gray-300 rounded-md shadow-sm"
                >
                {arbitratorAddresses.map((arbitratorAddress, index) => (
                  index > 0 && 
                    <ListboxOption  key={index} value={arbitratorAddress}>
                      {`${arbitratorNames[index]}  ${useShortenText({ text: arbitratorAddress, maxLength: 11 })} ${arbitratorFees[index]}%`}
                    </ListboxOption>
                ))}
              </Listbox>
              </Field>
            )}

          
            <div className='flex flex-row justify-between gap-5'>
             
            <Field className='flex-1'>
              <Label>Maximum delivery time {selectedUnitTime ? `in ${selectedUnitTime.name}` : ''}</Label>
              <Input
                name="deadline"
                type="number"
                placeholder={`Maximum delivery time ${selectedUnitTime ? `in ${selectedUnitTime.name}` : ''}`}
                value={deadline}
                onChange={(e) => {
                  const deadline = parseInt(e.target.value);
                  setDeadline(deadline);
                }}
              />
            </Field>
            <Field className='flex-1'>
            <Label>Units</Label>
            <ComboBox placeholder='Time Units' className="w-auto border border-gray-300 rounded-md shadow-sm bg-slate-600" 
              value={selectedUnitTime}
              options={unitsDeliveryTime}  onChange={(option) => {
                setselectedUnitTime(option as ComboBoxOption)
              }}></ComboBox>
            </Field>
          </div>
          </FieldGroup>
        </div>
        {!showSummary && (
                <div className='justify-end flex'>
                  <Button
                    // disabled={postButtonDisabled || isPending}
                    // onClick={postJobClick}
                    onClick={handleSummary}
                  >
                    {isPending ? 'Posting...' : 'Continue'}
                  </Button>
                </div>
              )}
      </Fieldset>
      )}
        {showSummary && (
        <JobSummary
          handleSummary={handleSummary}
          formInputs={formInputs}
          submitJob={postJobClick} 
          isPending={isPending} 
          isConfirming={isConfirming} 
          isConfirmed={isConfirmed}   
          postButtonDisabled={postButtonDisabled}
          />
      )}
    </div>
  );
}

export default PostJobPage;