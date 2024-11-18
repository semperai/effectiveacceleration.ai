import { Button } from '@/components/Button';
import { Token } from '@/tokens';
import React, { ReactNode } from 'react';
import { JobFormInputData } from '@/service/FormsTypes';

interface JobSummaryProps {
  formInputs: JobFormInputData[];
  isPending: boolean;
  isConfirming: boolean;
  isConfirmed: boolean;
  postButtonDisabled: boolean;
  submitJob: () => void;
  handleSummary: () => void;
}

const JobSummary: React.FC<JobSummaryProps> = ({
  formInputs,
  submitJob,
  isPending,
  isConfirmed,
  isConfirming,
  postButtonDisabled,
  handleSummary,
}) => {
  return (
    <div>
      <div className='mb-6'>
        <h1 className='mb-1 text-3xl font-bold'>Summary</h1>
        <span className='text-darkBlueFont'>
          Before you submit your job, please double check your answers.
        </span>
      </div>
      <div className='flex flex-col rounded-3xl bg-white p-8 shadow-md'>
        <table className='w-full'>
          <tbody>
            {formInputs.map(
              (inputData, index) =>
                inputData.inputInfo && (
                  <tr key={index} className='mb-8 flex'>
                    <td className='w-1/2 font-bold'>{inputData.label}</td>
                    <td className='flex grow-[2]'>{inputData.inputInfo}</td>
                  </tr>
                )
            )}
          </tbody>
        </table>
      </div>
      <div className='mb-40 mt-5 flex justify-end'>
        <Button
          color={'cancelBorder'}
          className={'mr-5'}
          onClick={handleSummary}
        >
          Go back
        </Button>
        <Button disabled={postButtonDisabled || isPending} onClick={submitJob}>
          {(() => {
            if (isConfirmed) {
              return <>Transaction confirmed</>;
            }
            if (isConfirming) {
              return <>Waiting for confirmation...</>;
            }
            if (isPending) {
              return <>Posting...</>;
            }
            return <>Post Job</>;
          })()}
        </Button>
      </div>
    </div>
  );
};

export default JobSummary;
