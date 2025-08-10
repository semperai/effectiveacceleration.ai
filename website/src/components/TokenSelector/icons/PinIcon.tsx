import { SvgIcon } from '@mui/material';

export const PinIcon = (props: any) => {
  return (
    <SvgIcon alt='Pin' {...props}>
      <svg
        viewBox='0 0 14 14'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        {...props}
      >
        <path
          fillRule='evenodd'
          clipRule='evenodd'
          d='M8.382 1.137a.5.5 0 0 1 .707 0l1.13 1.13 1.507 1.507 1.13 1.13a.5.5 0 1 1-.707.707l-.723-.722-3.914 5.22 1.2 1.2a.5.5 0 1 1-.707.706L6.498 10.51 5.344 9.355a.506.506 0 0 1-.022.023l-3.485 3.485a.5.5 0 0 1-.707-.707l3.484-3.485a.51.51 0 0 1 .024-.022L3.484 7.495 1.977 5.988a.5.5 0 1 1 .707-.707l1.2 1.2 5.22-3.914-.722-.723a.5.5 0 0 1 0-.707Z'
          fill='#6259FF'
        />
      </svg>
    </SvgIcon>
  );
};
