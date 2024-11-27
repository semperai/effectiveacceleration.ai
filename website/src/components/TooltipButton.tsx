import React from 'react';
import {
  Button,
  ButtonProps,
} from '@/components/Button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/Tooltip"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/Popover"

type TooltipButtonProps = ButtonProps & {
  tooltipContent?: React.ReactNode;
  popoverContent?: React.ReactNode;
}

export const TooltipButton = React.forwardRef(
  function TooltipButton({
    children,
    tooltipContent,
    popoverContent,
    ...props
  }: TooltipButtonProps,
  ref: React.ForwardedRef<HTMLElement>,
) {
  const [popoverOpen, setPopoverOpen] = React.useState(false);
  const [tooltipOpen, setTooltipOpen] = React.useState(false);

  return (
    <Popover
      open={popoverOpen}
      onOpenChange={(open) => {
        if (! popoverContent) {
          setPopoverOpen(false);
          return;
        }

        setPopoverOpen(open);
        if (open) {
          setTimeout(() => setPopoverOpen(false), 1000);
        }
      }}
    >
      <TooltipProvider>
        <Tooltip
          open={tooltipOpen}
          onOpenChange={(open) => {
            if (! tooltipContent) {
              setTooltipOpen(false);
              return;
            }

            setTooltipOpen(open);
          }}
        >
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button
                ref={ref}
                {...props}
               >
                 {children}
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent>
            {tooltipContent}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <PopoverContent side="top">
        {popoverContent}
      </PopoverContent>
    </Popover>
  );
});
