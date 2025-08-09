import type { Job } from '@effectiveacceleration/contracts';
import { ActionButton } from './ActionButton';

export type RefundButtonProps = {
  job: Job;
};

export function RefundButton({
  job,
  ...rest
}: RefundButtonProps & React.ComponentPropsWithoutRef<'div'>) {
  return (
    <ActionButton
      functionName='refund'
      args={[job.id]}
      label='Refund'
      performingLabel='Refunding...'
    />
  );
}
