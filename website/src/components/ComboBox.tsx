'use client'
import { Combobox as HeadlessCombobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react'
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/20/solid'
import { GoChevronDown } from "react-icons/go";
import clsx from 'clsx'
import {useEffect, useRef, useState } from 'react'
import useDimensions from '@/hooks/useDimensions'
import { ComboBoxOption } from '@/service/FormsTypes'

export type ComboboxProps<T> = {
  value?: T,
  options: ComboBoxOption[],
  onChange: (value: T) => void,
  placeholder?: string, 
}

export function ComboBox<T>({ options, value, onChange, className, placeholder, ...props }: ComboboxProps<T> & React.ComponentPropsWithoutRef<'div'>) {
  const inputRef = useRef(null)
  const dropdownRef = useRef<HTMLUListElement>(null)
  const {width, height} = useDimensions(inputRef)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(value)


  // Tailwind JIT doesn't support injecting CSS variables dynamically, 
  // styles={} didn't work on ComboboxOptions either, so we're using this workaround
  function changeWidthDropdown() {
      setTimeout(function () {
        if (!dropdownRef.current) return
        dropdownRef.current.style.width = `${width}px`;
        dropdownRef.current.style.setProperty('width', `${width}px`, 'important');
      }, 1)
  }

  useEffect(() => {
    changeWidthDropdown()
  }, [width]);

  const filteredOptions =
    query === ''
      ? options
      : options.filter((option) => {
          return option.name.toLowerCase().includes(query.toLowerCase())
        })

  return (
    <>
      <div>
        <HeadlessCombobox value={selected} onChange={(value) => {
            setSelected(value)
            onChange(value)
          }}>
          <div className="relative">
            <ComboboxInput
              ref={inputRef}
              placeholder={`${placeholder}`}
              className={clsx(
                className,

                'w-full bg-white text-sm/6 text-darkBlueFont !mt-2 focus:border-primary focus:ring-0 shadow',

                'relative block w-full appearance-none rounded-xl py-[calc(theme(spacing[2.5])-1px)] sm:py-[calc(theme(spacing[3])-1px)]',

                // Horizontal padding
                'pl-[calc(theme(spacing[3.5])-1px)] pr-[calc(theme(spacing.7)-1px)] sm:pl-[calc(theme(spacing.3)-1px)]',
    
                // Typography
                'text-left text-base/6 text-zinc-950 placeholder:text-zinc-500 sm:text-sm/6 dark:text-white forced-colors:text-[CanvasText]',
    
                // Border
                'border border-zinc-950/20 group-active:border-zinc-950/30 group-hover:border-zinc-950/30 dark:border-white/10 dark:group-data-[active]:border-white/20 dark:group-data-[hover]:border-white/20',
    
                // Background color
                'bg-transparent dark:bg-white/5',
    
                // Invalid state
                'group-data-[invalid]:border-red-500 group-data-[invalid]:group-data-[hover]:border-red-500 group-data-[invalid]:dark:border-red-600 group-data-[invalid]:data-[hover]:dark:border-red-600',
    
                // Disabled state
                'group-data-[disabled]:border-zinc-950/20 group-data-[disabled]:opacity-100 group-data-[disabled]:dark:border-white/15 group-data-[disabled]:dark:bg-white/[2.5%] dark:data-[hover]:group-data-[disabled]:border-white/15',
              )}
              displayValue={(option: ComboBoxOption) => option?.name}
              onChange={(event) => setQuery(event.target.value)}
            />
            <ComboboxButton onClick={changeWidthDropdown} className="group absolute inset-y-0 right-0 px-2.5">
              <GoChevronDown className="size-6 fill-blueGrayTitles group-data-[hover]:fill-blueGrayTitles"  />
            </ComboboxButton>
          </div>
          <ComboboxOptions
            ref={dropdownRef}
            anchor={{to: "bottom"}}
            style={{width: `${width}px`}}
            className={clsx(
              'rounded-xl border border-white/5 bg-white p-1 [--anchor-gap:var(--spacing-1)] empty:invisible z-50 shadow-lg',
              'transition duration-100 ease-in data-[leave]:data-[closed]:opacity-0',
              // Border
              'border border-zinc-950/10 group-active:border-zinc-950/20 group-hover:border-zinc-950/20 dark:border-white/10 dark:group-data-[active]:border-white/20 dark:group-data-[hover]:border-white/20',
              className
            )}
          >
            {filteredOptions.map((option) => (
              <ComboboxOption
                key={option.id}
                value={option}
                className={clsx("group flex items-center hover:!bg-primary gap-2 rounded-lg hover:!text-white py-1.5 px-3 select-none  data-[focus]:bg-white/10 cursor-pointer",
                )}
              >
                <CheckIcon className="invisible size-4 fill-darkBlueFont group-hover:fill-white group-data-[selected]:visible" />
                <div className="text-sm/6 text-darkBlueFont group-hover:text-white">{option.name}</div>
              </ComboboxOption>
            ))}
          </ComboboxOptions>
        </HeadlessCombobox>
      </div>
    </>
  )
}