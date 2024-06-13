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
import MarketplaceArtifact from '@/artifacts/contracts/MarketplaceV1.sol/MarketplaceV1.json'
import Config from '@/config.json'
import { useEffect, useState } from 'react'
import { Layout } from '@/components/Layout'
import { Button } from '@/components/Button'
import { Description, Field, FieldGroup, Fieldset, Label, Legend } from '@/components/Fieldset'
import { Text } from '@/components/Text'
import { Textarea } from '@/components/Textarea'
import { Input } from '@/components/Input'
import { Select } from '@/components/Select'
import { TokenSelector } from '@/components/TokenSelector'
import { Token } from '@/tokens'

export default function PostJobPage() {
  const { address } = useAccount();
  const {
    data: hash,
    error,
    isPending,
    writeContract,
  } = useWriteContract();

  const [selectedToken, setSelectedToken] = useState<Token | undefined>(undefined)

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('0');
  const [deadline, setDeadline] = useState(0);

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

  function postJobClick() {
    setPostButtonDisabled(true);

    console.log('posting job', title, description, selectedToken?.id, amount, deadline);

    const w = writeContract({
      abi: MarketplaceArtifact.abi,
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
      <Fieldset className="max-w-screen-sm">
        <Text>Using this interface to post a job</Text>
        <FieldGroup> 
          <Field>
            <Label>Title</Label>
            <Input
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Field>
          <Field>
            <Label>Description</Label>
            <Textarea
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <Description>
              Please provide a detailed description of the project so agents can accurately estimate.
            </Description>
          </Field>
          <Field>
            <Label>Payment Token</Label>
            <Input
              name="token"
              value={selectedToken?.id}
            />
            <Description></Description>

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
          <Field>
            <Label>Payment Amount</Label>
            <Input
              name="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
             />
            <Description></Description>
          </Field>
          <Field>
            <Label>Deadline</Label>
            <Input
              name="deadline"
              type="number"
              value={deadline}
              onChange={(e) => {
                const deadline = parseInt(e.target.value);
                setDeadline(deadline);
              }}
            />
            <Description>How many seconds does someone have to complete task?</Description>
          </Field>
        </FieldGroup>

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
