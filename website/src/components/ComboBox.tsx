'use client'
import { Combobox as HeadlessCombobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react'
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/20/solid'
import clsx from 'clsx'
import {useEffect, useRef, useState } from 'react'
import useDimensions from '@/hooks/useDimensions'

export type Option = {
  id: number | string,
  name: string,
}

export type ComboboxProps<T> = {
  value: T,
  options: Option[],
  onChange: (value: T) => void,
}

export function Combobox<T>({ options, value, onChange, className, ...props }: ComboboxProps<T> & React.ComponentPropsWithoutRef<'div'>) {
  const inputRef = useRef(null)
  const {width, height} = useDimensions(inputRef)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(value)

  // Tailwind JIT doesn't support injecting CSS variables dynamically, 
  // styles={} didn't work on ComboboxOptions either, so we're using this workaround
  useEffect(() => {
    document.documentElement.style.setProperty('--combobox-dropdown-width', `${width}px`);
  }, [width]);

  const filteredOptions =
    query === ''
      ? options
      : options.filter((option) => {
          return option.name.toLowerCase().includes(query.toLowerCase())
        })

  return (
    <>
      <style>
        { `
          :root {
            --combobox-dropdown-width: ${width}px;
          }
        `}
      </style>
      <div className={className}>
        <HeadlessCombobox value={selected} onChange={(value) => {
            setSelected(value)
            onChange(value)
          }} __demoMode>
          <div className="relative" ref={inputRef}>
            <ComboboxInput
              className={clsx(
                'w-full rounded-lg border-none bg-white/5 py-1.5 pr-8 pl-3 text-sm/6 text-white',
                'focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25'
              )}
              displayValue={(option: Option) => option?.name}
              onChange={(event) => setQuery(event.target.value)}
            />
            <ComboboxButton className="group absolute inset-y-0 right-0 px-2.5">
              <ChevronDownIcon className="size-4 fill-white/60 group-data-[hover]:fill-white" />
            </ComboboxButton>
          </div>
          <ComboboxOptions
            anchor={{to: "bottom"}}
            style={{width: `${width}px`}}
            className={clsx(
              'w-[var(--combobox-dropdown-width)] rounded-lg border border-white/5  p-1 [--anchor-gap:var(--spacing-1)] empty:invisible',
              'transition duration-100 ease-in bg-black',
              className
            )}
          >
            {filteredOptions.map((option) => (
              <ComboboxOption
                key={option.id}
                value={option}
                className="group flex items-center gap-2 rounded-lg py-1.5 px-3 select-none data-[focus]: cursor-pointer hover:bg-white hover:bg-opacity-20"
              >
                <CheckIcon className="invisible size-4 fill-white group-data-[selected]:visible" />
                <div className="text-sm/6 text-white">{option.name}</div>
              </ComboboxOption>
            ))}
          </ComboboxOptions>
        </HeadlessCombobox>
      </div>
    </>
  )
}
