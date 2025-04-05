export const SABLIER_LOCKUP_ABI = [
  // Withdraw function
  {
    inputs: [{ internalType: 'uint256', name: 'streamId', type: 'uint256' }],
    name: 'withdrawMax',
    outputs: [{ internalType: 'uint128', name: 'withdrawnAmount', type: 'uint128' }],
    stateMutability: 'payable',
    type: 'function'
  },
  // Get withdrawable amount
  {
    inputs: [{ internalType: 'uint256', name: 'streamId', type: 'uint256' }],
    name: 'withdrawableAmountOf',
    outputs: [{ internalType: 'uint128', name: 'withdrawableAmount', type: 'uint128' }],
    stateMutability: 'view',
    type: 'function'
  },
  // Get start time
  {
    inputs: [{ internalType: 'uint256', name: 'streamId', type: 'uint256' }],
    name: 'getStartTime',
    outputs: [{ internalType: 'uint40', name: 'startTime', type: 'uint40' }],
    stateMutability: 'view',
    type: 'function'
  },
  // Get end time
  {
    inputs: [{ internalType: 'uint256', name: 'streamId', type: 'uint256' }],
    name: 'getEndTime',
    outputs: [{ internalType: 'uint40', name: 'endTime', type: 'uint40' }],
    stateMutability: 'view',
    type: 'function'
  },
  // Get deposited amount
  {
    inputs: [{ internalType: 'uint256', name: 'streamId', type: 'uint256' }],
    name: 'getDepositedAmount',
    outputs: [{ internalType: 'uint128', name: 'depositedAmount', type: 'uint128' }],
    stateMutability: 'view',
    type: 'function'
  },
  // Get withdrawn amount
  {
    inputs: [{ internalType: 'uint256', name: 'streamId', type: 'uint256' }],
    name: 'getWithdrawnAmount',
    outputs: [{ internalType: 'uint128', name: 'withdrawnAmount', type: 'uint128' }],
    stateMutability: 'view',
    type: 'function'
  },
  // Check if stream is cold (settled, canceled, or depleted)
  {
    inputs: [{ internalType: 'uint256', name: 'streamId', type: 'uint256' }],
    name: 'isCold',
    outputs: [{ internalType: 'bool', name: 'result', type: 'bool' }],
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
