'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className='group inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3 font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:border-white/30 hover:bg-white/10'
    >
      <ArrowLeft className='h-5 w-5 text-white transition-transform group-hover:-translate-x-1' />
      <span className='text-white'>Go Back</span>
    </button>
  );
}
