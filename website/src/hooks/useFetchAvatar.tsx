import { useEffect, useState, useMemo } from 'react';
import { safeGetMediaFromIpfs } from '@effectiveacceleration/contracts';

const useFetchAvatar = (avatar: string | undefined, sessionKey: string | undefined) => {
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  useMemo(() => {
    const cidLength = 46;
    if (!avatar || avatar.length > cidLength) return;

    const fetchContent = async () => {
      try {
        const { fileName, mimeType, mediaBytes } = await safeGetMediaFromIpfs(
          avatar!,
          sessionKey as any
        );
        const blob = new Blob([mediaBytes], { type: mimeType });
        const objectURL = URL.createObjectURL(blob);
        setAvatarUrl(objectURL);
      } catch (error) {
        console.error('Error fetching content from IPFS:', error);
      }
    };

    fetchContent();
  }, [avatar, sessionKey]);

  return avatarUrl;
};

export default useFetchAvatar;