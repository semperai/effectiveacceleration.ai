export const SABLIER_LOCKUP_ABI = [
  {
    inputs: [
      { internalType: 'uint256', name: 'streamId', type: 'uint256' },
      { internalType: 'address', name: 'to', type: 'address' }
    ],
    name: 'withdrawMax',
    outputs: [{ internalType: 'uint128', name: 'withdrawnAmount', type: 'uint128' }],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: 'streamId', type: 'uint256' }],
    name: 'withdrawableAmountOf',
    outputs: [{ internalType: 'uint128', name: 'withdrawableAmount', type: 'uint128' }],
    stateMutability: 'view',
    type: 'function'
  },
  // Event for withdraw
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'streamId', type: 'uint256' },
      { indexed: true, internalType: 'address', name: 'to', type: 'address' },
      { indexed: true, internalType: 'address', name: 'token', type: 'address' },
      { indexed: false, internalType: 'uint128', name: 'amount', type: 'uint128' }
    ],
    name: 'WithdrawFromLockupStream',
    type: 'event'
  }
] as const;
