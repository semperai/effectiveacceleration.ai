import { ReactNode } from "react";

export type ComboBoxOption = {
    id: number | string,
    name: string,
  }

export type JobSummaryProps = {
    formInputs: JobFormInputData[];
    submitJob: () => void;
  }


export type JobFormInputData = {
    label: string, 
    inputInfo: ReactNode | string | undefined 
  }