import React from 'react';
import Image from 'next/image';

const DefaultNavBar = () => {
  return (
    <div className='flex h-20 w-full justify-center bg-primary sm:h-16'>
      <div className='content-center'>
        <Image
          height={50}
          width={50}
          src={'/negativeLogo.svg'}
          alt={'Effective Acceleration Logo'}
        ></Image>
      </div>
    </div>
  );
};

export default DefaultNavBar;
