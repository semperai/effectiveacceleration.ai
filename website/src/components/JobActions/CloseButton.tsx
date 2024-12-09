import { Job } from '@effectiveacceleration/contracts';
import { ActionButton } from './ActionButton';

export type CloseButtonProps = {
  job: Job;
};

export function CloseButton({
  job,
  ...rest
}: CloseButtonProps & React.ComponentPropsWithoutRef<'div'>) {
  return (
    <ActionButton
      functionName='closeJob'
      args={[job.id]}
      label='Close'
      performingLabel='Closing...'
    />
  );
}
