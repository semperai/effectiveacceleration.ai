'use client'

import { ethers } from 'ethers'
import {
  useAccount,
  useReadContract,
} from 'wagmi'
import FakeTokenArtifact from '@/artifacts/contracts/unicrow/FakeToken.sol/FakeToken.json'
import { useState } from 'react'
import { Layout } from '@/components/Layout'
import { Button } from '@/components/Button'
import { Description, Field, FieldGroup, Fieldset, Label, Legend } from '@/components/Fieldset'
import { Text } from '@/components/Text'
import { Textarea } from '@/components/Textarea'
import { Input } from '@/components/Input'
import { Select } from '@/components/Select'
import { TokenSelector } from '@/components/TokenSelector'
import { Token } from '@/tokens'

export default function OpenJobsPage() {
  const { address } = useAccount();

  const [selectedToken, setSelectedToken] = useState<Token | undefined>(undefined)

  const { data: balanceData } = useReadContract({
    account:      address,
    abi:          FakeTokenArtifact.abi,
    address:      selectedToken?.id as `0x${string}`|undefined,
    functionName: 'balanceOf',
    args:         [address],
  });

  if (balanceData) {
    console.log('balance', balanceData.toString())
  }


  return (
    <Layout>
      <h1 className="text-xl font-medium mb-8">Create a Job Post</h1>
      <Fieldset className="max-w-screen-sm">
        <Text>Using this interface to post a job</Text>
        <FieldGroup> 
          <Field>
            <Label>Title</Label>
            <Input name="title" />
          </Field>
          <Field>
            <Label>Description</Label>
            <Textarea name="description" />
            <Description>
              Please provide a detailed description of the project so agents can accurately estimate.
            </Description>
          </Field>
          <Field>
            <Label>Payment Token</Label>
            <Input name="token" value={selectedToken?.id} />
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
            <Input name="amount" />
            <Description></Description>
          </Field>
          <Field>
            <Label>Allowed Time</Label>
            <Input name="allowed_time" />
            <Description></Description>
          </Field>
        </FieldGroup>

        <Button className="hover:cursor-pointer">
          Post
        </Button>
      </Fieldset>
    </Layout>
  );
}
