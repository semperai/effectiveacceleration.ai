import { Avatar } from '@/components/Avatar';
import { Token, tokens } from '@/tokens';
import { Dialog, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import clsx from 'clsx';
import { Fragment, useState } from 'react';

function TokenButton({
  onClick,
  selectedToken,
}: {
  onClick: () => void;
  selectedToken: Token | undefined;
}) {
  const baseClass =
    'w-fit rounded-lg font-medium flex gap-2 items-center transition ease-in-out delay-50 duration-150';

  if (selectedToken) {
    return (
      <button
        onClick={onClick}
        className={clsx(
          baseClass,
          'bg-slate-100 text-slate-900 hover:bg-slate-200'
        )}
      >
        <Avatar className='size-8' src={selectedToken.icon} />
        <div>{selectedToken.symbol}</div>
        <ChevronDownIcon className='h-6 w-6 text-black' aria-hidden='true' />
      </button>
    );
  } else {
    return (
      <button
        onClick={onClick}
        className={clsx(baseClass, 'bg-blue-500 text-white hover:bg-blue-600')}
      >
        <div className='px-2'>Select token</div>
        <ChevronDownIcon className='h-6 w-6 text-white' aria-hidden='true' />
      </button>
    );
  }
}

function TokenListItem({
  token,
  selected = false,
  onClick,
}: {
  token: Token;
  selected: boolean;
  onClick: (token: Token) => void;
}) {
  return (
    <>
      <button
        className={`flex items-center justify-between px-2 hover:bg-slate-50 ${selected ? 'opacity-40' : ''}`}
        onClick={() => onClick(token)}
      >
        <div className='flex items-center gap-4'>
          <Avatar className='size-8' src={token.icon} />
          <div className='flex flex-col items-start'>
            <div className='text-md text-slate-900'>{token.name}</div>
            <div className='text-sm font-medium text-slate-400'>
              {token.symbol}
            </div>
          </div>
        </div>
        <div>
          {selected && (
            <ChevronDownIcon
              className='h-6 w-6 text-white'
              aria-hidden='true'
            />
          )}
        </div>
      </button>
    </>
  );
}

export function TokenSelector({
  selectedToken,
  onClick,
}: {
  selectedToken: Token | undefined;
  onClick: (token: Token) => void;
}) {
  let [isOpen, setIsOpen] = useState(false);

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }

  // we add a function handleClick
  function handleClick(token: Token) {
    onClick(token);
    closeModal();
  }

  return (
    <>
      <TokenButton selectedToken={selectedToken} onClick={() => openModal()} />

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as='div' className='relative z-10' onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter='ease-out duration-300'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='ease-in duration-200'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <div className='fixed inset-0 bg-black bg-opacity-25' />
          </Transition.Child>

          <div className='fixed inset-0 overflow-y-auto'>
            <div className='flex min-h-full items-center justify-center p-4 text-center'>
              <Transition.Child
                as={Fragment}
                enter='ease-out duration-300'
                enterFrom='opacity-0 scale-95'
                enterTo='opacity-100 scale-100'
                leave='ease-in duration-200'
                leaveFrom='opacity-100 scale-100'
                leaveTo='opacity-0 scale-95'
              >
                <Dialog.Panel className='w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all'>
                  <Dialog.Title
                    as='h3'
                    className='text-lg font-medium leading-6 text-gray-900'
                  >
                    Select a token
                  </Dialog.Title>
                  <div className='mt-2'>
                    <div className='flex flex-col gap-4'>
                      {tokens.map((token, idx) => (
                        <TokenListItem
                          token={token}
                          selected={token.id == selectedToken?.id}
                          onClick={handleClick}
                          key={idx}
                        />
                      ))}
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
