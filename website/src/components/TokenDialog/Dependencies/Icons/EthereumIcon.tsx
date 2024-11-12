import { SvgIcon } from '@mui/material';

export const EthereumIcon = (props: any) => {
  return (
    <SvgIcon alt='Ethereum' {...props}>
      <svg
        viewBox='0 0 25 24'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        {...props}
      >
        <circle cx={12.5} cy={12} r={12} fill='#EDF0F4' />
        <path
          d='m12.467 4.8-.096.324v9.409l.096.095 4.367-2.582L12.467 4.8Z'
          fill='#343434'
        />
        <path d='M12.467 4.8 8.1 12.046l4.367 2.582V4.8Z' fill='#8C8C8C' />
        <path
          d='m12.467 15.455-.054.065v3.352l.054.157 4.37-6.155-4.37 2.58Z'
          fill='#3C3C3B'
        />
        <path
          d='M12.467 19.029v-3.574L8.1 12.875l4.367 6.154Z'
          fill='#8C8C8C'
        />
        <path
          d='m12.467 14.628 4.367-2.582-4.367-1.985v4.567Z'
          fill='#141414'
        />
        <path d='m8.1 12.046 4.367 2.582V10.06L8.1 12.046Z' fill='#393939' />
      </svg>
    </SvgIcon>
  );
};
