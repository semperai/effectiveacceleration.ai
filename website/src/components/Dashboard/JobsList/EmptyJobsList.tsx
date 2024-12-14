import Image, { StaticImageData } from 'next/image';

export const EmptyJobsList = ({ image, text }: {
  image: StaticImageData;
  text: string;
}) => {
  return (
    <div className='flex flex-col items-center justify-center w-full h-full'>
      <Image src={image} alt='' className='w-1/2' />
      <p className='text-lg text-gray-500 mt-4'>{text}</p>
    </div>
  );
};
