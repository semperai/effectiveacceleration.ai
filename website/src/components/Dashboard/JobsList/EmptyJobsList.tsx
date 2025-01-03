import Image, { StaticImageData } from 'next/image';

export const EmptyJobsList = ({
  image,
  text,
}: {
  image: StaticImageData;
  text: string;
}) => {
  return (
    <div className='flex h-full w-full flex-col items-center justify-center'>
      <Image src={image} alt='' className='w-1/4 pt-32' />
      <p className='mt-4 text-lg text-gray-500'>{text}</p>
    </div>
  );
};
