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
import Config from 'effectiveacceleration-contracts/scripts/config.json'
import { MARKETPLACE_V1_ABI } from 'effectiveacceleration-contracts/wagmi/MarketplaceV1'
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
import { ListboxOptions } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/24/outline'
import { Listbox, ListboxOption } from '@/components/Listbox'
import { publishToIpfs } from 'effectiveacceleration-contracts'

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
  const category = [
    { id: 1, name: 'Web' },
    { id: 2, name: 'Design' },
    { id: 3, name: 'Translation' },
    { id: 4, name: 'Counting' },
    { id: 5, name: 'Marketing' },
  ]

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('0');
  const [deadline, setDeadline] = useState(0);
  const [multipleApplicants, setMultipleApplicants] = useState(multipleApplicantsValues[1])
  const [isArbitrator, setisArbitrator] = useState(arbitrator[1])

  const [selectedCategory, setselectedCategory] = useState(category[0])


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
  }, [title, description, amount, deadline, selectedToken])

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

  async function postJobClick() {
    setPostButtonDisabled(true);

    console.log('posting job', title, description, selectedToken?.id, amount, deadline);

    const { hash: contentHash } = await publishToIpfs(description);

    const w = writeContract({
      abi: MARKETPLACE_V1_ABI,
      address: Config.marketplaceAddress as `0x${string}`,
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
      <h1 className="text-xl font-medium mb-8">Create a Job Post</h1>
      <Fieldset className="w-full">
        <div className=' flex flex-row w-full gap-24'>
          <FieldGroup className='flex-1'> 
            <Field>
              <Label>Job Title</Label>
              <Input
                name="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </Field>
            <Field>
              <Label>Description</Label>
              <Textarea
              rows={10}
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Field>
            <Field className='flex flex-row justify-between items-center'>
              <Label className='items-center'>Multiple Applicants</Label>
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
            <Label>Tags</Label>
            <Listbox
              value={selectedCategory} 
              onChange={setselectedCategory}
              className="border border-gray-300 rounded-md shadow-sm"
              placeholder="Select an option"
            >
              {category.map((cat, catIndex) => (
                  <ListboxOption key={catIndex} value={cat}>
                    {cat.name}
                  </ListboxOption>
              ))}
            </Listbox>
            </Field>
          </FieldGroup>
          <FieldGroup className='flex-1'> 
            <div className='flex flex-row justify-between gap-5'>
             
            <Field className='flex-1'>
              <Label>Payment Amount</Label>
              <Input
                name="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <Description></Description>
            </Field>
            <Field className='flex-1'>
              <Label>Payment Token</Label>
              <Input
                name="token"
                value={selectedToken?.id}
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
              />
            </Field>
            <Field className='flex flex-row justify-between items-center'>
              <Label className='items-center'>Arbitrator</Label>
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
              value={selectedCategory} 
              onChange={setselectedCategory}
              className="border border-gray-300 rounded-md shadow-sm"
              placeholder="Select an option"
            >
              {category.map((cat, catIndex) => (
                  <ListboxOption key={catIndex} value={cat}>
                    {cat.name}
                  </ListboxOption>
              ))}
            </Listbox>
            </Field>
          </div>
            <Field>
              <div className='flex justify-between'>
                <Label>Worker Whitelist</Label>
                <Label>+ Add Another</Label>
              </div>
              <Listbox
              value={selectedCategory} 
              onChange={setselectedCategory}
              className="border border-gray-300 rounded-md shadow-sm"
              placeholder="Select an option"
            >
              {category.map((cat, catIndex) => (
                  <ListboxOption key={catIndex} value={cat}>
                    {cat.name}
                  </ListboxOption>
              ))}
            </Listbox>
            </Field>
          </FieldGroup>
        </div>
        <Button
          disabled={postButtonDisabled || isPending}
          onClick={postJobClick}
        >
          {isPending ? 'Posting...' : 'Post Job'}
        </Button>
        {isConfirming && <div>Waiting for confirmation...</div>}
        {isConfirmed && <div>Transaction confirmed.</div>}
      </Fieldset>
    </Layout>
  );
}
