import React from 'react';
import { Button, ButtonProps, styles } from '@/components/Button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/Tooltip"

type TooltipButtonProps = ButtonProps & {
  tooltipContent: React.ReactNode;
}

export const TooltipButton = React.forwardRef(
  function TooltipButton({
    children,
    tooltipContent,
    ...props
  }: TooltipButtonProps,
  ref: React.ForwardedRef<HTMLElement>,
) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            ref={ref}
            {...props}
           >
             {children}
           </Button>
        </TooltipTrigger>
        <TooltipContent className='bg-white shadow-sm border border-gray-300 rounded-lg'>
          {tooltipContent}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});
