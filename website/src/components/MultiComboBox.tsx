'use client'
import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions} from '@headlessui/react'
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/20/solid'
import { IoIosClose } from "react-icons/io";
import clsx from 'clsx'
import { useEffect, useRef, useState } from 'react'
import useDimensions from '@/hooks/useDimensions'
import { ComboBoxOption } from '@/service/FormsTypes';

export default function MultiComboBox ({data, selected, setSelected}: {data: ComboBoxOption[], selected: ComboBoxOption[], setSelected: (value: ComboBoxOption[]) => void}): JSX.Element {
  const [query, setQuery] = useState('')
  const dropdownRef = useRef<HTMLUListElement>(null)
  const inputRef = useRef(null)
  const {width, height} = useDimensions(inputRef)

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

  const filteredData =
    query === ''
      ? data
      : data.filter((value: { name: string }) => {
          return value.name.toLowerCase().includes(query.toLowerCase())
        })

  return (
    <>
      <Combobox multiple value={selected} onChange={(value: { id: number; name: string; }[]) => setSelected(value)}>
        <div className="relative group" ref={inputRef}>
          <Combobox.Input
            className={clsx(

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
            // displayValue={() => selected.length > 0 ? selected[0].name : ''}
            placeholder='Search Tags...'
            onChange={(event) => setQuery(event.target.value)}
          />
          <Combobox.Button onClick={changeWidthDropdown} className="group absolute b-10 inset-y-0 right-0 px-2.5">
            <ChevronDownIcon className="size-4 fill-black/60 group-data-[hover]:fill-black" />
          </Combobox.Button>
        </div>
        <div className="flex flex-wrap items-center">
          {selected.map((value) => (
            <div
              key={value.id}
              className={clsx("bg-white text-white px-3 py-1 m-1 cursor-pointer rounded-full inline border border-zinc-950/10 active:border-zinc-950/20 hover:border-zinc-950/20 dark:border-white/10 dark:group-data-[active]:border-white/20 dark:group-data-[hover]:border-white/20")}
              onClick={() => setSelected(selected.filter((p) => p.id !== value.id))}
            >
              <span className='text-darkBlueFont text-sm inline'>
                {value.name}
              </span>
              <IoIosClose className={clsx('ml-1 text-darkBlueFont inline text-xl')} />
            </div>
          ))}
        </div>
        <Combobox.Options
         ref={dropdownRef}
          anchor={{ to: "bottom start" }}
          // transition
          className={clsx(
            'rounded-xl border border-white/5 bg-white p-1 [--anchor-gap:var(--spacing-1)] empty:invisible z-50 shadow-lg',
            'transition duration-100 ease-in data-[leave]:data-[closed]:opacity-0',
            // Border
            'border border-zinc-950/10 group-active:border-zinc-950/20 group-hover:border-zinc-950/20 dark:border-white/10 dark:group-data-[active]:border-white/20 dark:group-data-[hover]:border-white/20',
    
          )}
        >
          {filteredData.map((value: ComboBoxOption) => (
            <Combobox.Option
              key={value.id}
              value={value}
              className={clsx("group flex items-center hover:!bg-primary gap-2 rounded-lg hover:!text-white py-1.5 px-3 select-none  data-[focus]:bg-white/10 cursor-pointer",

              )}
            >
              <CheckIcon className={clsx("invisible size-4 fill-darkBlueFont group-hover:fill-white group-data-[selected]:visible",
              )} />
              <div className={clsx("text-sm/6 group-hover:text-white text-darkBlueFont ")}>{value.name}</div>
            </Combobox.Option>
          ))}
        </Combobox.Options>
      </Combobox>
    </>
  )
}