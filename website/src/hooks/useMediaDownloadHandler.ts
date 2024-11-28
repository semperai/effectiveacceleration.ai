import { safeGetMediaFromIpfs } from '@effectiveacceleration/contracts';
import { useEffect } from 'react';

export const useMediaDownloadHandler = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    window.onhashchange = () => {
      if (window.history.state === null) {
        Object.defineProperty(window.history, 'state', {
          enumerable: false,
          configurable: false,
          writable: false,
          value: {},
        });
      }

      const hash = location.hash.slice(1);
      const params = new URLSearchParams(decodeURIComponent(hash));
      const cid = params.get('cid');
      const filename = params.get('filename');
      const sessionKey = params.get('sessionKey');
      if (!cid || !filename) return;

      const download = async () => {
        const downloadURL = (data: string, fileName: string) => {
          const a = document.createElement('a');
          a.href = data;
          a.download = fileName;
          document.body.appendChild(a);
          a.style.display = 'none';
          a.click();
          a.remove();
        };

        const { mimeType, mediaBytes } = await safeGetMediaFromIpfs(
          cid!,
          sessionKey as any
        );

        if (!mediaBytes.length) {
          alert('File is encrypted and you do not have the decryption key');
          return;
        }

        const blob = new Blob([mediaBytes], { type: mimeType });
        const url = URL.createObjectURL(blob);
        downloadURL(url, filename);
        setTimeout(function () {
          return URL.revokeObjectURL(url);
        }, 1000);
      };

      history.replaceState(
        null,
        document.title,
        location.pathname + location.search
      );
      download();
    };

    // trigger on initial load
    window.onhashchange({} as any);
  }, []);
};
