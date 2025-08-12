export const jobMeceTags: { id: string; name: string }[] = [
  { id: 'DA', name: 'Digital Audio' },
  { id: 'DV', name: 'Digital Video' },
  { id: 'DT', name: 'Digital Text' },
  { id: 'DS', name: 'Digital Software' },
  { id: 'DO', name: 'Digital Others' },
  { id: 'NDG', name: 'Non-Digital Goods' },
  { id: 'NDS', name: 'Non-Digital Services' },
  { id: 'NDO', name: 'Non-Digital Others' },
];

export const unitsDeliveryTime = [
  { id: '0', name: 'minutes' },
  { id: '1', name: 'hours' },
  { id: '2', name: 'days' },
  { id: '3', name: 'weeks' },
  { id: '4', name: 'months' },
  { id: '5', name: 'years' },
];

export const deliveryMethods: { id: string; name: string }[] = [
  { id: 'ipfs', name: 'IPFS' },
  { id: 'courier', name: 'Courier' },
  { id: 'digital_proof', name: 'Digital Proof' },
  { id: 'other', name: 'Other' },
];

export const noYesOptions: { id: string; name: string }[] = [
  { id: 'no', name: 'No' },
  { id: 'yes', name: 'Yes' },
];

export const ERC20_ABI = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'name',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'value', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'value', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'value', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;
