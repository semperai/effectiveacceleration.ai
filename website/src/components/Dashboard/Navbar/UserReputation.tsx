import { Field, Label } from '@/components/Fieldset';

interface UserReputationProps {
  isArbitrator: boolean;
  positiveCount: number;
  negativeCount: number;
}

export const UserReputation = ({
  isArbitrator,
  positiveCount,
  negativeCount
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

// ===== src/components/Dashboard/Navbar/utils/userValidation.ts =====
interface ValidationInput {
  name: string;
  bio: string;
  fee: number;
  isArbitrator: boolean;
}

interface ValidationErrors {
  name: string;
  bio: string;
  fee: string;
}

export const validateUserForm = ({
  name,
  bio,
  fee,
  isArbitrator
}: ValidationInput): ValidationErrors => {
  const errors: ValidationErrors = {
    name: '',
    bio: '',
    fee: ''
  };

  // Name validation
  if (!name || name.length === 0) {
    errors.name = 'Name is required';
  } else if (name.length > 20) {
    errors.name = 'Name is too long (20 characters max)';
  }

  // Bio validation
  if (bio && bio.length > 255) {
    errors.bio = 'Bio is too long (255 characters max)';
  }

  // Fee validation (arbitrators only)
  if (isArbitrator) {
    if (fee < 0) {
      errors.fee = 'Fee cannot be negative';
    } else if (!Number.isInteger(fee)) {
      errors.fee = 'Fee must be a whole number';
    }
  }

  return errors;
};

