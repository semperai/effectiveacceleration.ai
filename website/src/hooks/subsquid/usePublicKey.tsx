import useUser from './useUser';

export default function usePublicKey(targetAddress: string) {
  const { data, ...rest } = useUser(targetAddress);

  return { data: data ? data.publicKey : undefined, ...rest };
}
