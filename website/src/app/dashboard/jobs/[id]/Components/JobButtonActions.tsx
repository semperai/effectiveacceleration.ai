import { AcceptButton } from '@/components/JobActions/AcceptButton';
import { ArbitrateButton } from '@/components/JobActions/ArbitrateButton';
import { CloseButton } from '@/components/JobActions/CloseButton';
import { DeliverResultButton } from '@/components/JobActions/DeliverResultButton';
import { DisputeButton } from '@/components/JobActions/DisputeButton';
import { RefundButton } from '@/components/JobActions/RefundButton';
import { RefuseArbitrationButton } from '@/components/JobActions/RefuseArbitrationButton';
import { RemoveFromWhitelistButton } from '@/components/JobActions/RemoveFromWhitelistButton';
import { ReopenButton } from '@/components/JobActions/ReopenButton';
import { ReviewButton } from '@/components/JobActions/ReviewButton';
import { UpdateButton } from '@/components/JobActions/UpdateButton';
import { WhitelistButton } from '@/components/JobActions/WhitelistButton';
import { WithdrawCollateralButton } from '@/components/JobActions/WithdrawCollateralButton';
import {
  Job,
  JobEventWithDiffs,
  JobState,
} from '@effectiveacceleration/contracts';
import { zeroAddress, zeroHash } from 'viem';

const JobButtonActions = ({
  job,
  address,
  sessionKeys,
  addresses,
  events,
  whitelistedWorkers,
  timePassed,
}: {
  job: Job | undefined;
  address: string | undefined;
  sessionKeys: Record<string, string>;
  addresses: string[];
  events: JobEventWithDiffs[];
  whitelistedWorkers: string[];
  timePassed?: boolean;
}) => {
  const showDisputeButton =
    job?.state === JobState.Taken &&
    // job.resultHash !== zeroHash &&
    job.roles.arbitrator !== zeroAddress &&
    address !== job.roles.arbitrator &&
    addresses.length &&
    !job.disputed &&
    (job?.roles.creator === address ||
    job?.roles.worker === address)
    Object.keys(sessionKeys).length > 0;

  const showReviewButton =
    job?.state === JobState.Closed &&
    job.rating === 0 &&
    job.resultHash !== zeroHash &&
    address === job.roles.creator;

  const showCloseButton =
    job?.state === JobState.Open && address === job.roles.creator;

  const showReopenButton =
    job?.state === JobState.Closed &&
    address === job.roles.creator &&
    job.resultHash === zeroHash;

  const showWithdrawCollateralButton =
    job?.state === JobState.Closed &&
    address === job.roles.creator &&
    job.collateralOwed > 0n &&
    timePassed;

  const showWhitelistButton =
    job?.state === JobState.Open &&
    address === job.roles.creator &&
    job.whitelistWorkers;

  const showRemoveFromWhitelistButton =
    job?.state === JobState.Open &&
    address === job.roles.creator &&
    job.whitelistWorkers &&
    events.length > 0 &&
    events.at(-1)!.job.allowedWorkers!.length! > 0;

  const showUpdateButton =
    job?.state === JobState.Open && address === job.roles.creator;

  const showRefundButton =
    job?.state === JobState.Taken && address === job.roles.worker;

  // TODO shouldnt this be from creator side ?
  const showAcceptButton =
    job?.state === JobState.Open &&
    address === job.roles.worker &&
    events.length > 0;

  const showDeliverResultButton =
    job?.state === JobState.Taken &&
    address === job.roles.worker &&
    Object.keys(sessionKeys).length > 0;

  const showArbitrateButton =
    job?.state === JobState.Taken && address === job.roles.arbitrator;

  const showRefuseArbitrationButton =
    job?.state !== JobState.Closed && address === job?.roles.arbitrator;

  return (
    <div className='jobButtonActions'>
      {job && (
        <div className='flex flex-col gap-2'>
          {/* owner & worker actions */}
          {showDisputeButton && (
            <DisputeButton
              address={address}
              sessionKeys={sessionKeys}
              job={job}
            />
          )}

          {/* owner actions */}
          {/* {job.state === JobState.Open && address === job.roles.creator && events.length > 0 &&
        <AssignWorkerButton address={address} job={job}></AssignWorkerButton>
      } */}
          {/* {job.state === JobState.Taken && job.resultHash !== zeroHash && address === job.roles.creator &&
        <ApproveButton address={address} job={job}></ApproveButton>
      } */}
          {showReviewButton && <ReviewButton address={address} job={job} />}
          {showCloseButton && <CloseButton job={job} />}
          {showReopenButton && <ReopenButton job={job} />}
          {showWithdrawCollateralButton && (
            <WithdrawCollateralButton job={job} />
          )}
          {showWhitelistButton && (
            <WhitelistButton
              address={address}
              job={job}
              whitelist={whitelistedWorkers}
            />
          )}
          {showRemoveFromWhitelistButton && (
            <RemoveFromWhitelistButton
              address={address}
              job={job}
              whitelist={whitelistedWorkers}
            />
          )}
          {showUpdateButton && <UpdateButton address={address} job={job} />}

          {/* worker actions */}
          {showRefundButton && <RefundButton job={job} />}
          {showAcceptButton && (
            <AcceptButton address={address} job={job} events={events} />
          )}
          {showDeliverResultButton && (
            <DeliverResultButton
              address={address}
              job={job}
              sessionKeys={sessionKeys}
            />
          )}

          {/* arbitrator actions */}
          {showArbitrateButton && (
            <ArbitrateButton
              address={address}
              job={job}
              sessionKeys={sessionKeys}
            />
          )}
          {showRefuseArbitrationButton && <RefuseArbitrationButton job={job} />}
        </div>
      )}
    </div>
  );
};

export default JobButtonActions;
