import { useQuery } from '@tanstack/react-query';
import { safeGetMediaFromIpfs } from '@effectiveacceleration/contracts';

const fetchAvatar = async ({
  avatar,
  sessionKey,
}: {
  avatar: string;
  sessionKey?: string;
}) => {
  const { fileName, mimeType, mediaBytes } = await safeGetMediaFromIpfs(
    avatar,
    sessionKey as any
  );

  const blob = new Blob([mediaBytes.buffer as ArrayBuffer], { type: mimeType });
  return URL.createObjectURL(blob);
};

const useFetchAvatar = (
  avatar: string | undefined,
  sessionKey: string | undefined
) => {
  const cidLength = 46;

  const {
    data: avatarUrl,
    isError,
    error,
  } = useQuery({
    queryKey: ['avatar', avatar, sessionKey],
    queryFn: () => fetchAvatar({ avatar: avatar!, sessionKey }),
    enabled: !!avatar && avatar.length <= cidLength,
    staleTime: 1000 * 60 * 60, // Consider data fresh for 1 hour
    gcTime: 1000 * 60 * 60 * 24, // Keep in cache for 24 hours
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Log errors in development
  if (isError) {
    console.error('Error fetching avatar from IPFS:', error);
  }

  // Don't revoke URLs - let React Query manage the cache lifecycle
  // The browser will clean up blob URLs when the page is closed
  // If memory becomes an issue, implement a global cleanup strategy instead

  return avatarUrl;
};

export default useFetchAvatar;
