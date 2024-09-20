'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { AiOutlineLoading } from "react-icons/ai";
import { IconContext } from "react-icons";
import { PiLightbulbLight } from "react-icons/pi";

type Theme = 'dark' | 'light';

function ThemeIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm-5-8a5 5 0 0 0 5 5V7a5 5 0 0 0-5 5Z"
      />
    </svg>
  )
}

export function ThemeToggle() {
  let [mounted, setMounted] = useState(false)
  let { resolvedTheme, setTheme } = useTheme()
  let otherTheme = resolvedTheme === 'dark' ? 'dark' : 'light'

  

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
    <IconContext.Provider value={{ color: `${otherTheme}`}}>
      <div>
        <AiOutlineLoading className="animate-spin animate-loading duration-1500 ease-linear infinite"/>
      </div>
    </IconContext.Provider>
    )
  }

  return (
    <div className="flex justify-between items-center">
    <IconContext.Provider value={{ color: `${otherTheme}`}}>
      <div>
        <PiLightbulbLight className='text-white text-2xl' /> 
      </div>
    </IconContext.Provider>
    <span className={`text-${otherTheme} font-medium text-white `}>Dark mode</span>
    <label className=" cursor-pointer">
    <input
        type="checkbox"
        onClick={() => setTheme((resolvedTheme as Theme) === 'light' ? 'dark' : 'light')}
        value=""
        className="sr-only peer"
        defaultChecked={resolvedTheme === 'dark'}
    />
    <div className="relative w-11 h-6 bg-white bg-opacity-20 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
    </label>
  </div>
  )
} 
