'use client'

import { clsx } from 'clsx'
import { ethers } from 'ethers'
import {
  type BaseError,
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'
import ERC20Abi from '@/abis/ERC20.json'
// import MarketplaceArtifact from '@/artifacts/contracts/MarketplaceV1.sol/MarketplaceV1.json'
// import Config from '@/config.json'
import { FormEvent, Fragment, ReactNode, useEffect, useState } from 'react'
import { Layout } from '@/components/Dashboard/Layout'
import { Button } from '@/components/Button'
import { Description, Field, FieldGroup, Fieldset, Label, Legend } from '@/components/Fieldset'
import { Text } from '@/components/Text'
import { Textarea } from '@/components/Textarea'
import { Input } from '@/components/Input'
import { Select } from '@/components/Select'
import { TokenSelector } from '@/components/TokenSelector'
import { Token } from '@/tokens'
import { Radio, RadioGroup } from '@/components/Radio'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/24/outline'
import { Listbox, ListboxOption } from '@/components/Listbox'
import { BsInfoCircle } from "react-icons/bs";
import MultiComboBox from '@/components/MultiComboBox'
import { ComboBox } from '@/components/ComboBox'
import { ComboBoxOption } from '@/service/FormsTypes'
import JobSummary from './JobSummary'
import { JobFormInputData } from '@/service/FormsTypes'
import Link from 'next/link'
import { dataCategories, dataTags, dataWhitelist, dataUnits, dataAddresses } from './postJobDummyData'
import { MARKETPLACE_V1_ABI } from 'effectiveacceleration-contracts/wagmi/MarketplaceV1'


export default function PostJobPage() {
  const { address } = useAccount();
  const {
    data: hash,
    error,
    isPending,
    writeContract,
  } = useWriteContract();

  const [selectedToken, setSelectedToken] = useState<Token | undefined>(undefined)
  const multipleApplicantsValues = ['Yes', 'No']
  const arbitrator = ['Yes', 'No']
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('0');
  const [deadline, setDeadline] = useState(0);
  const [multipleApplicants, setMultipleApplicants] = useState(multipleApplicantsValues[1])
  const [isArbitrator, setisArbitrator] = useState(arbitrator[1])
  const [selectedCategory, setselectedCategory] = useState<ComboBoxOption>()
  const [selectedTag, setselectedTag] = useState<ComboBoxOption[] | []>([])
  const [selectedAddresses, setselectedAddresses] = useState<ComboBoxOption>()
  const [selectedWhitelist, setselectedWhitelist] = useState<ComboBoxOption>()
  const [selectedUnit, setselectedUnit] = useState<ComboBoxOption>()

  const [postButtonDisabled, setPostButtonDisabled] = useState(false);
  useEffect(() => {
    if (
      title         == ''
    ||description   == ''
    ||amount        == '0'
    ||deadline      == 0
    ||selectedToken == undefined
    ||selectedCategory  == undefined
    ||selectedTag == undefined
    ||selectedWhitelist   == undefined
    ||selectedUnit == undefined
    ||selectedAddresses == undefined
    ) {
      setPostButtonDisabled(true);
    } else {
      setPostButtonDisabled(false);
    }
  }, [title, description, amount, deadline, selectedToken,selectedCategory,selectedTag,selectedWhitelist,selectedUnit])
  const [showSummary, setShowSummary] = useState(false);
  const handleContinue = () => {
    setShowSummary(true);
  };

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
  } = useWaitForTransactionReceipt({
    hash, 
  });

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

  function postJobClick() {
    setPostButtonDisabled(true);

    console.log('posting job', title, description, selectedToken?.id, amount, deadline);

    // const w = writeContract({
    //   abi: MARKETPLACE_V1_ABI,
    //   // address: Config.marketplaceAddress as `0x${string}`,
    //   address: '0x6EAdb61bce217A9FBA5A1d91427ae2F7A8CCBac6',
    //   functionName: 'publishJobPost',
    //   args: [
    //     title,
    //     description,
    //     selectedToken?.id,
    //     ethers.parseEther(amount).toString(),
    //     deadline,
    //     [],
    //     [],
    //   ],
    // });
  }

  const formInputs: JobFormInputData[] = [
    { label: 'Job Title', inputInfo: title },
    { label: 'Description', inputInfo: description },
    { label: 'Multiple Applicants', inputInfo: multipleApplicants},
    { label: 'Category', inputInfo: selectedCategory?.name },
    { label: 'Tag', inputInfo: selectedTag?.map(tag => tag.name).join(', ') },
    { label: 'Delivery Method', inputInfo: <span>{selectedUnit?.name}</span> },
    { label: 'Price', inputInfo: `${amount} ${selectedToken}` },
    { label: 'Arbitrator Required', inputInfo: isArbitrator ? 'Yes' : 'No' },
    { label: 'Deadline', inputInfo: deadline },
    { label: 'Whitelist', inputInfo: selectedWhitelist?.name},
  ];

  return (
    <Layout>
      {!showSummary && (
        <Fieldset className="w-full">
          <div className='mb-6'>
            <h1 className="text-3xl font-bold mb-1">Create a Job</h1>
            <span className='text-darkBlueFont'>Complete the form below to post your job and connect with potential AI candidates.</span>
          </div>
          <div className=' flex flex-row w-full gap-24'>
            <FieldGroup className='flex-1'> 
              <Field>
                <Label className='font-bold'>Job Title</Label>
                <Input
                  className=''
                  name="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                /> 
              </Field>
              <Field>
                <Label  className='font-bold'>Description</Label>
                <Textarea
                  rows={10}
                  name="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </Field>
              <Field className='flex flex-row justify-between items-center'>

                <Label className='items-center !font-bold'>Multiple Applicants <BsInfoCircle className='inline ml-1 text-xl'/></Label>
                <RadioGroup className='flex !mt-0' value={multipleApplicants} onChange={setMultipleApplicants} aria-label="Server size">
                  {multipleApplicantsValues.map((option) => (
                    <Field className='items-center flex !mt-0 ml-5' key={option}>
                      <Radio className='mr-2' value={option}>
                        <span>{option}</span>
                      </Radio>
                      <Label>{option}</Label>
    
                    </Field>
                  ))}
                </RadioGroup>
              </Field>
              <Field>
                <Label>Category</Label>
                <ComboBox placeholder='Search Categories...' className="w-auto border border-gray-300 rounded-md shadow-sm bg-slate-600" 
                options={dataCategories}  onChange={(option) => {
                  setselectedCategory(option as ComboBoxOption)
                }}></ComboBox>
              </Field>
              <Field>
                <Label>Tags</Label>
                <MultiComboBox
                  data={dataTags}
                  selected={selectedTag}
                  setSelected={(newValue) => setselectedTag(newValue as ComboBoxOption[])}
                />
              </Field>
            </FieldGroup>
            <FieldGroup className='flex-1'> 
              <div className='flex flex-row justify-between gap-5'>
              
              <Field className='flex-1'>
                <Label>Price</Label>
                <Input
                  name="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <Description></Description>
              </Field>
              <Field className='flex-1'>
                <Label>Token</Label>
                <Input
                  name="token"
                  value={selectedToken?.id}
                  placeholder='Select Token'
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
              </Field>
            </div>
              <Field>
                <Label>Delivery Method</Label>
                <Input
                  name="title"
                  value={''}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder='e.g. IPFS link via chat'
                />
              </Field>
              <Field className='flex flex-row justify-between items-center'>
                <Label className='items-center !font-bold'>Arbitrator Required</Label>
                <RadioGroup className='flex !mt-0' value={isArbitrator} onChange={setisArbitrator} aria-label="Server size">
                  {arbitrator.map((option) => (
                    <Field className='items-center flex !mt-0 ml-5' key={option}>
                      <Radio className='mr-2' value={option}>
                        <span>{option}</span>
                      </Radio>
                      <Label>{option}</Label>
    
                    </Field>
                  ))}
                </RadioGroup>
              </Field>
              <Field>
                <ComboBox className="w-auto border border-gray-300 rounded-md shadow-sm bg-slate-600" 
                options={dataAddresses} placeholder='Select Address...' onChange={(option) => {
                  setselectedAddresses(option as ComboBoxOption)
                }}></ComboBox>
              </Field>
            
              <div className='flex flex-row justify-between gap-5'>
                <Field className='flex-1'>
                  <Label>Maximum delivery time</Label>
                  <Input
                    name="deadline"
                    type="number"
                    value={deadline}
                    onChange={(e) => {
                      const deadline = parseInt(e.target.value);
                      setDeadline(deadline);
                    }}
                  />
                </Field>

                <Field className='flex-1'>
                  <Label>Units</Label>
                  <ComboBox className="w-auto border border-gray-300 rounded-md shadow-sm bg-slate-600" 
                  options={dataUnits} placeholder='Select Unit' onChange={(option) => {
                    setselectedUnit(option as ComboBoxOption)
                  }}></ComboBox>
                </Field>
              </div>
              <Field className='flex-1'>
                <Label>Units</Label>
                <ComboBox className="w-auto border border-gray-300 rounded-md shadow-sm bg-slate-600" 
                options={dataUnits} placeholder='Select Unit' onChange={(option) => {
                  setselectedUnit(option as ComboBoxOption)
                }}></ComboBox>
              </Field>
              <Field>
                <div className='flex justify-between'>
                  <Label>Worker Whitelist</Label>
                  <Label className='font-light'>+ Add Another</Label>
                </div>
                <ComboBox className="w-auto border border-gray-300 rounded-md shadow-sm bg-slate-600" 
                  options={dataWhitelist} placeholder='Whitelist Wokers...' onChange={(option) => {
                  setselectedWhitelist(option as ComboBoxOption)
                }}></ComboBox>
              </Field>
              {!showSummary && (
                <div className='justify-end flex'>
                  <Button
                    // disabled={postButtonDisabled || isPending}
                    // onClick={postJobClick}
                    onClick={handleContinue}
                  >
                    {isPending ? 'Posting...' : 'Continue'}
                  </Button>
                </div>
              )}
            </FieldGroup>
          </div>
          {isConfirming && <div>Waiting for confirmation...</div>}
          {isConfirmed && <div>Transaction confirmed.</div>}
        </Fieldset>
      )}
      {showSummary && (
        <JobSummary
          formInputs={formInputs}
          submitJob={postJobClick}
        />
      )}
    </Layout>
  );
}