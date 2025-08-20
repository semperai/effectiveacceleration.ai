import { Field, Label } from '@/components/Fieldset';

interface UserReputationProps {
  isArbitrator: boolean;
  positiveCount: number;
  negativeCount: number;
}

export const UserReputation = ({
  isArbitrator,
  positiveCount,
  negativeCount,
}: UserReputationProps) => (
  <Field>
    <Label>{isArbitrator ? 'Arbitration Stats' : 'Reputation'}</Label>
    <div className='py-3'>
      <div className='flex items-center gap-3'>
        <div className='flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 dark:bg-green-900/20'>
          <span className='text-sm font-medium text-green-700 dark:text-green-400'>
            {isArbitrator ? 'Settled' : 'Positive'}
          </span>
          <span className='text-sm font-bold text-green-700 dark:text-green-400'>
            {positiveCount}
          </span>
        </div>
        <div className='flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 dark:bg-red-900/20'>
          <span className='text-sm font-medium text-red-700 dark:text-red-400'>
            {isArbitrator ? 'Refused' : 'Negative'}
          </span>
          <span className='text-sm font-bold text-red-700 dark:text-red-400'>
            {negativeCount}
          </span>
        </div>
      </div>
    </div>
  </Field>
);
