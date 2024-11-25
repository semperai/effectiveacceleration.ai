import { Layout } from '@/components/FullLayout';
import { Link } from '@/components/Link';
import BackgroundImage from '@/images/lost.webp';
import Image from 'next/image';

export default function NotFound() {
  return (
    <Layout>
      <main className='relative isolate min-h-full'>
        <Image
          src={BackgroundImage}
          alt='lost robot'
          className='absolute inset-0 -z-10 h-full w-full object-cover object-top blur-sm'
        />
        <div className='mx-auto max-w-7xl px-6 py-32 text-center sm:py-40 lg:px-8'>
          <p className='text-gray text-base font-semibold leading-8'>404</p>
          <h1 className='text-gray mt-4 text-3xl font-bold tracking-tight sm:text-5xl'>
            Page not found
          </h1>
          <p className='text-gray/70 mt-4 text-base sm:mt-6'>
            Sorry, we couldn’t find the page you’re looking for.
          </p>
          <div className='mt-10 flex justify-center'>
            <Link
              href='/'
              className='text-gray text-sm font-semibold leading-7'
            >
              <span aria-hidden='true'>&larr;</span> Back to home
            </Link>
          </div>
        </div>
      </main>
    </Layout>
  );
}
