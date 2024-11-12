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
          Before you submit your form, check your answers.
        </span>
      </div>
      <div className='flex flex-col rounded-3xl bg-white p-8 shadow-md'>
        {formInputs.map(
          (inputData, index) =>
            inputData.inputInfo && (
              <div key={index} className='mb-8 flex'>
                <div className='flex grow md:min-w-[14rem] md:max-w-[14rem]'>
                  <span className='font-bold'>{inputData.label}</span>
                </div>
                <div className='flex grow-[2]'>
                  <span className=''>{inputData.inputInfo}</span>
                </div>
              </div>
            )
        )}
      </div>
      <div className='mt-5 flex justify-end'>
        <Button
          color={'cancelBorder'}
          className={'mr-5'}
          onClick={handleSummary}
        >
          Go back
        </Button>
        <Button disabled={postButtonDisabled || isPending} onClick={submitJob}>
          {isPending ? 'Posting...' : 'Post Job'}
        </Button>
        {isConfirming && <div>Waiting for confirmation...</div>}
        {isConfirmed && <div>Transaction confirmed.</div>}
      </div>
    </div>
  );
};

export default JobSummary;
