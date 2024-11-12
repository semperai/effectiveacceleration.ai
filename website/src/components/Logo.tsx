import Image from 'next/image';
import logoWhite from '@/images/logo-white.svg';

export function Logo(props: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div {...props}>
      <Image src={logoWhite} alt='Logo' />
    </div>
  );
}
