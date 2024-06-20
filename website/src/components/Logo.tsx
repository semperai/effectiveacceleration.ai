import Image from 'next/image'
import { useTheme } from 'next-themes'

import logoLight from '@/images/logo-light.png'
import logoDark from '@/images/logo-dark.png'
import logoWhite from '@/images/logo-white.svg'

export function Logo(props: React.ComponentPropsWithoutRef<'div'>) {
  let { resolvedTheme } = useTheme()

  return (
    <div {...props}>
      {resolvedTheme === 'dark' ? (
        <Image src={logoWhite} alt="Logo" />
        ) : (
        <Image src={logoWhite} alt="Logo" />
        )
      }
    </div>
  )
}
