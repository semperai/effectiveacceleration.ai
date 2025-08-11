import React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/Tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/Popover';

type TooltipInfoProps = {
  tooltipContent: React.ReactNode;
  popoverContent?: React.ReactNode;
  className?: string;
  ariaLabel?: string;
  children: React.ReactNode; // trigger element
};

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = React.useState(
    () => window.innerWidth < breakpoint
  );

  React.useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < breakpoint);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);

  return isMobile;
}

export const TooltipInfo = React.forwardRef<HTMLSpanElement, TooltipInfoProps>(
  (
    {
      tooltipContent,
      popoverContent,
      className,
      ariaLabel = 'More info',
      children,
    },
    ref
  ) => {
    const isMobile = useIsMobile();
    const [popoverOpen, setPopoverOpen] = React.useState(false);
    const [tooltipOpen, setTooltipOpen] = React.useState(false);

    React.useEffect(() => {
      // Reset states when switching modes
      setPopoverOpen(false);
      setTooltipOpen(false);
    }, [isMobile]);

    return (
      <TooltipProvider>
        <Tooltip
          open={!isMobile && tooltipOpen}
          onOpenChange={(open) => {
            if (!tooltipContent) {
              setTooltipOpen(false);
              return;
            }
            setTooltipOpen(open);
          }}
        >
          <TooltipTrigger asChild>
            {isMobile ? (
              <Popover
                open={popoverOpen}
                onOpenChange={(open) => {
                  if (!popoverContent) {
                    setPopoverOpen(false);
                    return;
                  }
                  setPopoverOpen(open);
                }}
              >
                <PopoverTrigger asChild>
                  <span
                    ref={ref}
                    tabIndex={0}
                    aria-label={ariaLabel}
                    role='button'
                    className={`inline-flex cursor-pointer items-center justify-center text-gray-500 ${className ?? ''}`}
                  >
                    {children}
                  </span>
                </PopoverTrigger>
                <PopoverContent side='top'>{popoverContent}</PopoverContent>
              </Popover>
            ) : (
              <span
                ref={ref}
                tabIndex={0}
                aria-label={ariaLabel}
                role='tooltip-trigger'
                className={`inline-flex cursor-pointer items-center justify-center text-gray-500 ${className ?? ''}`}
              >
                {children}
              </span>
            )}
          </TooltipTrigger>
          <TooltipContent side='top' align='center' className='max-w-xs'>
            {tooltipContent}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
);

// Add display name for debugging
TooltipInfo.displayName = 'TooltipInfo';
