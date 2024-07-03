import { ReactNode } from "react";

export type ComboBoxOption = {
    id: number | string,
    name: string,
  }

export type JobSummaryProps {
    formInputs: FormInputData[];
    submitJob: () => void;
  }


export type FormInputData = {
    label: string, 
    inputInfo: ReactNode | string | undefined 
  }