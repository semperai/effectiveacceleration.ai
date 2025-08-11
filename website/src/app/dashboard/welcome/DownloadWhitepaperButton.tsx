'use client';

import { Download } from 'lucide-react';

export function DownloadWhitepaperButton() {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '/effectiveacceleration.pdf';
    link.download = 'effectiveacceleration-whitepaper.pdf';
    link.click();
  };

  return (
    <button
      onClick={handleDownload}
      className='inline-flex items-center gap-2 text-sm font-medium text-white/80 transition-colors hover:text-white'
    >
      <Download className='h-4 w-4' />
      Download PDF
    </button>
  );
}
