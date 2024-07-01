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
import { Token, tokens, tokensMap } from '@/tokens'
import { Radio, RadioGroup } from '@/components/Radio'
import { ListboxOptions } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/24/outline'
import { Listbox, ListboxOption } from '@/components/Listbox'
import { publishToIpfs } from 'effectiveacceleration-contracts'
import { zeroAddress } from 'viem'
import useUsers from '@/hooks/useUsers'
import useArbitrators from '@/hooks/useArbitrators'

export default function PostJobPage() {
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

  const [selectedToken, setSelectedToken] = useState<Token | undefined>(tokens[0]);
  const multipleApplicantsValues = ['Yes', 'No']
  const category = [
    { id: 0, name: 'None' },
    { id: 1, name: 'Web' },
    { id: 2, name: 'Design' },
    { id: 3, name: 'Translation' },
    { id: 4, name: 'Counting' },
    { id: 5, name: 'Marketing' },
  ]

  const meceTags = [
    { id: "DA", name: "Digital Audio" },
    { id: "DV", name: "Digital Video" },
    { id: "DT", name: "Digital Text" },
    { id: "DS", name: "Digital Software" },
    { id: "DO", name: "Digital Others" },
    { id: "NDG", name: "Non-Digital Goods" },
    { id: "NDS", name: "Non-Digital Services" },
    { id: "NDO", name: "Non-Digital Others" },
  ]

  const [title, setTitle] = useState('Title');
  const [deliveryMethod, setDeliveryMethod] = useState('Digital');
  const [description, setDescription] = useState('Body');
  const [amount, setAmount] = useState(ethers.formatUnits(1, 0));
  const [deadline, setDeadline] = useState(120);
  const [multipleApplicants, setMultipleApplicants] = useState(multipleApplicantsValues[1])

  const [selectedCategory, setselectedCategory] = useState(category[0]);
  const [selectedMeceTag, setSelectedMeceTag] = useState(meceTags[0]);
  const [selectedWorkerAddress, setsSelectedWorkerAddress] = useState<string | undefined>(undefined);
  const [selectedArbitratorAddress, setsSelectedArbitratorAddress] = useState<string>(zeroAddress);

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
        contentHash as `0x${string}`,
        multipleApplicants === 'Yes',
        [selectedMeceTag.id, ...(selectedCategory.id !== 0 ? [selectedCategory.name] : [])],
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
            <Label>MECE Tags</Label>
            <Listbox
              value={selectedMeceTag} 
              onChange={setSelectedMeceTag}
              className="border border-gray-300 rounded-md shadow-sm"
              placeholder="Select an option"
            >
              {meceTags.map((tag, index) => (
                  <ListboxOption key={index} value={tag}>
                    {tag.name}
                  </ListboxOption>
              ))}
            </Listbox>
            </Field>
            <Field>
            <Label>Extra Tags</Label>
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
            </Field>
          </div>
            <Field>
              <Label>Delivery Method</Label>
              <Input
                name="deliveryMethod"
                value={deliveryMethod}
                onChange={(e) => setDeliveryMethod(e.target.value)}
              />
            </Field>
            <Field>
              <div className='flex justify-between'>
                <Label>Arbitrator</Label>
              </div>
              <Listbox
              value={selectedArbitratorAddress}
              onChange={(e) => setsSelectedArbitratorAddress(e)}
              className="border border-gray-300 rounded-md shadow-sm"
              placeholder="Select an option"
            >
              {arbitratorAddresses.map((arbitratorAddress, index) => (
                  <ListboxOption key={index} value={arbitratorAddress}>
                    {arbitratorNames[index]}
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
              value={selectedWorkerAddress}
              onChange={(e) => setsSelectedWorkerAddress(e)}
              className="border border-gray-300 rounded-md shadow-sm"
              placeholder="Select an option"
            >
              {workerAddresses.map((workerAddress, index) => (
                  <ListboxOption key={index} value={workerAddress}>
                    {workerNames[index]}
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
