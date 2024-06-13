import Image from 'next/image'
import { useTheme } from 'next-themes'

import logoLight from '@/images/logo-light.png'
import logoDark from '@/images/logo-dark.png'

export function Logo(props: React.ComponentPropsWithoutRef<'div'>) {
  let { resolvedTheme } = useTheme()

  return (
    <div {...props}>
      {resolvedTheme === 'dark' ? (
        <Image src={logoDark} alt="Logo" />
        ) : (
        <Image src={logoLight} alt="Logo" />
        )
      }
    </div>
  )
}
