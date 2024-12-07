import { Job } from '@effectiveacceleration/contracts';
import { ActionButton } from './ActionButton';

export type WithdrawCollateralButtonProps = {
  job: Job;
};

export function WithdrawCollateralButton({
  job,
  ...rest
}: WithdrawCollateralButtonProps & React.ComponentPropsWithoutRef<'div'>) {
  return (
    <ActionButton
      functionName='withdrawCollateral'
      args={[job.id]}
      label='Withdraw'
      performingLabel='Withdrawing...'
    />
  );
}