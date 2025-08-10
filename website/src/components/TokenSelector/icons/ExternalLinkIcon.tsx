import { SvgIcon } from '@mui/material';

export const ExternalLinkIcon = (props: any) => {
  return (
    <SvgIcon alt='ExternalLink' {...props}>
      <svg
        viewBox='0 0 12 13'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        {...props}
      >
        <path
          fillRule='evenodd'
          clipRule='evenodd'
          d='M11.853 1.137c.103.103.152.24.146.374V4.79a.5.5 0 0 1-1 0V2.698L5.255 8.443a.5.5 0 0 1-.707-.708l5.745-5.745H8.2a.5.5 0 0 1 0-1h3.3c.127 0 .255.05.353.147ZM1.002.99a1 1 0 0 0-1 1v9.998a1 1 0 0 0 1 1H11a1 1 0 0 0 1-1V8.09a.5.5 0 0 0-1 0v3.9H1.002V1.99H4.9a.5.5 0 0 0 0-1H1.002Z'
          fill='#6259FF'
        />
      </svg>
    </SvgIcon>
  );
};
