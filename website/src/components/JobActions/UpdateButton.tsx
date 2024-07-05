import { Button } from '@/components/Button'
import { CheckIcon } from "@heroicons/react/20/solid";
import { Job, JobEventWithDiffs, publishToIpfs, User } from "effectiveacceleration-contracts";
import { MARKETPLACE_V1_ABI } from "effectiveacceleration-contracts/wagmi/MarketplaceV1";
import Config from "effectiveacceleration-contracts/scripts/config.json";
import { useEffect, useState } from "react";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { Listbox, ListboxOption } from '../Listbox';
import useUsersByAddresses from '@/hooks/useUsersByAddresses';
import useUsers from '@/hooks/useUsers';
import { Textarea } from '../Textarea';
import useArbitrators from '@/hooks/useArbitrators';
import { Field, Label } from '../Fieldset';
import { Input } from '../Input';
import { tokenIcon, tokensMap } from '@/tokens';
import { zeroAddress } from 'viem';
import { formatUnits, parseUnits } from 'ethers';
import { Radio, RadioGroup } from '../Radio';


export type UpdateButtonProps = {
  address: `0x${string}` | undefined,
  job: Job,
}

export function UpdateButton({address, job, ...rest}: UpdateButtonProps & React.ComponentPropsWithoutRef<'div'>) {
  const [title, setTitle] = useState<string>(job.title);
  const [tags, setTags] = useState<string[]>(job.tags);
  const [amount, setAmount] = useState<string>(formatUnits(job.amount, tokensMap[job.token].decimals));
  const [maxTime, setMaxTime] = useState<number>(job.maxTime);

  const whitelistWorkersValues = ['Yes', 'No']
  const [whitelistWorkers, setWhitelistWorkers] = useState<string>(job.whitelistWorkers ? whitelistWorkersValues[0] : whitelistWorkersValues[1]);

  const [content, setContent] = useState<string>(job.content!);
  const {data: arbitrators} = useArbitrators();
  const excludes = [address];
  const userList = [{ address_: zeroAddress, name: "None" }, ...Object.values(arbitrators).filter(user => !excludes.includes(user.address_))];
  const [selectedArbitratorAddress, setSelectedArbitratorAddress] = useState<`0x${string}`>(job.roles.arbitrator);
  const {
    data: hash,
    error,
    writeContract,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
  } = useWaitForTransactionReceipt({
    hash
  });

  useEffect(() => {
    if (isConfirmed || error) {
      if (error) {
        const revertReason = error.message.match(`The contract function ".*" reverted with the following reason:\n(.*)\n.*`)?.[1];
        if (revertReason) {
          alert(error.message.match(`The contract function ".*" reverted with the following reason:\n(.*)\n.*`)?.[1])
        } else {
          console.log(error, error.message);
          alert("Unknown error occurred");
        }
      }
      setButtonDisabled(false);
      closeModal();
    }
  }, [isConfirmed, error]);

  const [buttonDisabled, setButtonDisabled] = useState<boolean>(false);

  async function buttonClick() {
    setButtonDisabled(true);

    const { hash: contentHash } = await publishToIpfs(content);
    const uniqueTags = tags.filter((tag, index, array) => array.indexOf(tag) === index).filter(tag => tag.length);
    const rawAmount = parseUnits(amount, tokensMap[job.token].decimals);

    const w = writeContract({
      abi: MARKETPLACE_V1_ABI,
      address: Config.marketplaceAddress as `0x${string}`,
      functionName: 'updateJobPost',
      args: [
        job.id!,
        title,
        contentHash as `0x${string}`,
        uniqueTags,
        rawAmount,
        maxTime,
        selectedArbitratorAddress,
        whitelistWorkers === whitelistWorkersValues[0],
      ],
    });
  }

  let [isOpen, setIsOpen] = useState(false)

  function closeModal() {
    setIsOpen(false)
  }

  function openModal() {
    setIsOpen(true)
  }

  return <>
    <span className="ml-3">
      <Button disabled={buttonDisabled} onClick={() => openModal()}>
        <CheckIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
        Update
      </Button>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Update job
                  </Dialog.Title>
                  <div className='mt-5 mb-3 flex flex-col gap-5'>
                    <Field>
                      <Label>Title</Label>
                      <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                    </Field>
                    <Field>
                      <Label>Description</Label>
                      <Textarea rows={4} value={content} onChange={(e) => setContent(e.target.value)} placeholder="Message" className="mt-5" />
                    </Field>
                    <Field>
                      <Label>Tags</Label>
                      <Input value={tags.join(', ')} onChange={(e) => setTags(e.target.value.split(',').map(tag => tag.trim()).filter((tag, index, array) => tag.length || index === array.length-1))} />
                    </Field>
                    <Field>
                      <Label>Amount</Label>
                      <div className="flex flex-row gap-2 items-center">
                        <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} invalid={["-","e"].some((char) => amount.includes(char))} />
                        <img src={tokenIcon(job.token)} alt="" className="flex-none h-[2em] w-auto mr-1" />
                        <span>{tokensMap[job.token].symbol}</span>
                      </div>
                    </Field>
                    <Field>
                      <Label>Max Job Time</Label>
                      <Input type="number" value={maxTime} onChange={(e) => setMaxTime(Number(e.target.value))} invalid={["-","e","."].some((char) => String(maxTime).includes(char))} />
                    </Field>

                    <Field>
                      <Label>Arbitrator</Label>
                      <Listbox
                        value={selectedArbitratorAddress}
                        onChange={(e) => setSelectedArbitratorAddress(e)}
                        className="border border-gray-300 rounded-md shadow-sm z-10"
                        placeholder="Select an option"
                      >
                        {userList.map((user, index) => (
                            <ListboxOption key={index} value={user.address_}>
                              {user.name}
                            </ListboxOption>
                        ))}
                      </Listbox>
                    </Field>

                    <Field className='flex flex-row justify-between items-center'>
                      <Label className='items-center'>Whitelist workers</Label>
                      <RadioGroup className='flex !mt-0' value={whitelistWorkers} onChange={setWhitelistWorkers} aria-label="Server size">
                        {whitelistWorkersValues.map((option) => (
                          <Field className='items-center flex !mt-0 ml-5' key={option}>
                            <Radio className='mr-2' value={option}>
                              <span>{option}</span>
                            </Radio>
                            <Label>{option}</Label>
                          </Field>
                        ))}
                      </RadioGroup>
                    </Field>

                    <Button disabled={buttonDisabled} onClick={buttonClick}>
                      <CheckIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                      Confirm
                    </Button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </span>
  </>
}