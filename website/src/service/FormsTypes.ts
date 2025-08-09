import type { ReactNode } from 'react';

export type ComboBoxOption = {
  id: string;
  name: string;
};

export type Tag = {
  id: number;
  name: string;
};

export type JobSummaryProps = {
  formInputs: FormInputData[];
  submitJob: () => void;
};

export type FormInputData = {
  label: string;
  inputInfo: ReactNode | string | undefined;
};
