import type { Job } from '@effectiveacceleration/contracts';
import { ActionButton } from './ActionButton';

export type ReopenButtonProps = {
  job: Job;
};

export function ReopenButton({
  job,
  ...rest
}: ReopenButtonProps & React.ComponentPropsWithoutRef<'div'>) {
  return (
    <ActionButton
      functionName='reopenJob'
      args={[job.id]}
      label='Reopen'
      performingLabel='Reopening...'
    />
  );
}
