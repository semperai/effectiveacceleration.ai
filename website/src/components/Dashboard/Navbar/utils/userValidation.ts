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


