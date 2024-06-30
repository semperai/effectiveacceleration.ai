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
import { Fragment, useEffect, useState } from 'react'
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
// import {Combobox, ComboboxInput, ComboboxOption, ComboboxOptions, ListboxOptions } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/24/outline'
import { Listbox, ListboxOption } from '@/components/Listbox'
import { BsInfoCircle } from "react-icons/bs";
import ComboboxType from '@/components/Combobox'
import Link from 'next/link'

interface SummaryProps {
  title: string;
  description: string;
  multipleApplicants: string;
  selectedCategory: {id: number, name: string}  | undefined ;
  selectedTag: {id: number, name: string}[]  | undefined ;
  amount: string;
  selectedToken: Token | undefined;
  isArbitrator: string;
  deadline: number;
  selectedUnit: {id: number, name: string}  | undefined ;
  selectedWhitelist: {id: number, name: string}  | undefined ;
  postJobClick: () => void;
}


function Summary({
  title,
  description,
  multipleApplicants,
  selectedCategory,
  selectedTag,
  amount,
  selectedToken,
  isArbitrator,
  deadline,
  selectedUnit,
  selectedWhitelist,
  postJobClick,
}: SummaryProps) {
  
  const sections = [
    { label: 'Job Title', inputInfo: title },
    { label: 'Description', inputInfo: description },
    { label: 'Multiple Applicants', inputInfo: multipleApplicants ? 'Yes' : 'No' },
    { label: 'Category', inputInfo: selectedCategory?.name },
    { label: 'Tag', inputInfo: selectedTag?.map(tag => tag.name).join(', ') },
    { label: 'Delivery Method', inputInfo: <span>{selectedUnit?.name}</span> },
    { label: 'Price', inputInfo: `${amount} ${selectedToken}` },
    { label: 'Arbitrator Required', inputInfo: isArbitrator ? 'Yes' : 'No' },
    { label: 'Deadline', inputInfo: deadline },
    { label: 'Whitelist', inputInfo: selectedWhitelist?.name},
  ];

  return (
    <div>
        <div className='mb-6'>
          <h1 className="text-3xl font-bold mb-1">Summary</h1>
          <span className='text-darkBlueFont'>Before you submit your form, check your answers.</span>
        </div>
        <div className='bg-white rounded-3xl p-8 shadow-md flex flex-col '>
          {sections.map((section, index) => (
            <div key={index} className='flex mb-8'>
              <div className='flex grow md:min-w-[14rem] md:max-w-[14rem]'>
                <span className='font-bold'>{section.label}</span>
              </div>
              <div className='flex grow-[2]'>
                <span className=''>{section.inputInfo}</span>
              </div>
            </div>
          )
          )}
        </div>
        <div className='flex justify-end mt-5'>
            <Button onClick={postJobClick}>Submit</Button>
          </div>
    </div>
  );
}


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
  const categories = [
    { id: 1, name: 'Web' },
    { id: 2, name: 'Design' },
    { id: 3, name: 'Translation' },
    { id: 4, name: 'Counting' },
    { id: 5, name: 'Marketing' },
  ]

  const tags = [
    { id: 1, name: 'Web' },
    { id: 2, name: 'Design' },
    { id: 3, name: 'Translation' },
    { id: 4, name: 'Counting' },
    { id: 5, name: 'Marketing' },
  ]

  const workerwhitelist = [
    { id: 1, name: 'Web' },
    { id: 2, name: 'Design' },
    { id: 3, name: 'Translation' },
    { id: 4, name: 'Counting' },
    { id: 5, name: 'Marketing' },
  ]

  const units = [
    { id: 1, name: 'Web' },
    { id: 2, name: 'Design' },
    { id: 3, name: 'Translation' },
    { id: 4, name: 'Counting' },
    { id: 5, name: 'Marketing' },
  ]

  const people = [
    { id: 1, name: 'Durward Reynolds' },
    { id: 2, name: 'Kenton Towne' },
    { id: 3, ename: 'Therese Wunsch' },
    { id: 4, name: 'Benedict Kessler' },
    { id: 5, name: 'Katelyn Rohan' },
  ]

  const [selectedPeople, setSelectedPeople] = useState([people[0], people[1]])

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('0');
  const [deadline, setDeadline] = useState(0);
  const [multipleApplicants, setMultipleApplicants] = useState(multipleApplicantsValues[1])
  const [isArbitrator, setisArbitrator] = useState(arbitrator[1])
  
  const [selectedCategory, setselectedCategory] = useState<{id: number, name: string } | undefined >()
  const [selectedTag, setselectedTag] = useState<{ id: number; name: string; }[]>([])
  const [selectedWhitelist, setselectedWhitelist] = useState<{id: number, name: string}  | undefined >()
  const [selectedUnit, setselectedUnit] = useState<{id: number, name: string}  | undefined >()
  console.log(selectedToken?.name)

  const peoples = [
    { id: 1, name: 'Tom Cook' },
    { id: 2, name: 'Wade Cooper' },
    { id: 3, name: 'Tanya Fox' },
    { id: 4, name: 'Arlene Mccoy' },
    { id: 5, name: 'Devon Webb' },
  ]
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

    const w = writeContract({
      abi: MarketplaceArtifact.abi,
      // address: Config.marketplaceAddress as `0x${string}`,
      address: '0x6EAdb61bce217A9FBA5A1d91427ae2F7A8CCBac6',
      functionName: 'publishJobPost',
      args: [
        title,
        description,
        selectedToken?.id,
        ethers.parseEther(amount).toString(),
        deadline,
        [],
        [],
      ],
    });

    console.log('writeContract', w);
  }


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
                <Listbox
                  value={selectedCategory} 
                  onChange={setselectedCategory}
                  className="border border-gray-300 rounded-md shadow-sm"
                  placeholder="Search Category"
                >
                  {categories.map((cat, catIndex) => (
                      <ListboxOption key={catIndex} value={cat}>
                        {cat.name}
                      </ListboxOption>
                  ))}
                </Listbox>
              </Field>
              <Field>'
                <Label>Tags</Label>
                <ComboboxType
                  data={tags}
                  selected={selectedTag}
                  setSelected={(newValue) => setselectedTag(newValue)}
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
              <Field >
                <Listbox
                    value={selectedWhitelist} 
                    onChange={setselectedWhitelist}
                    className="border border-gray-300 rounded-md shadow-sm"
                    placeholder="Select Address"
                >
                  {workerwhitelist.map((whitelist, whitelistIndex) => (
                      <ListboxOption key={whitelistIndex} value={whitelist}>
                        {whitelist.name}
                      </ListboxOption>
                  ))}
              </Listbox>
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
              <Listbox
                value={selectedUnit} 
                onChange={setselectedUnit}
                className="border border-gray-300 rounded-md shadow-sm"
                placeholder="Select unit"
              >
                {units.map((unit, unitIndex) => (
                    <ListboxOption key={unitIndex} value={unit}>
                      {unit.name}
                    </ListboxOption>
                ))}
              </Listbox>
              </Field>
            </div>
              <Field>
                <div className='flex justify-between'>
                  <Label>Worker Whitelist</Label>
                  <Label className='font-light'>+ Add Another</Label>
                </div>
                <Listbox
                  value={selectedWhitelist} 
                  onChange={setselectedWhitelist}
                  className="border border-gray-300 rounded-md shadow-sm"
                  placeholder="Select Address"
              >
                {workerwhitelist.map((whitelist, whitelistIndex) => (
                    <ListboxOption key={whitelistIndex} value={whitelist}>
                      {whitelist.name}
                    </ListboxOption>
                ))}
              </Listbox>
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
              <Summary
                title={title}
                description={description}
                multipleApplicants={multipleApplicants}
                selectedCategory={selectedCategory}
                selectedTag={selectedTag}
                amount={amount}
                selectedToken = {selectedToken}
                isArbitrator={isArbitrator}
                deadline={deadline}
                selectedUnit={selectedUnit}
                selectedWhitelist={selectedWhitelist}
                postJobClick={postJobClick}
              />
      )}
    </Layout>
  );
}
