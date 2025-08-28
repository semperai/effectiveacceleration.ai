import React from 'react';
import {
  AcceptButton,
  ArbitrateButton,
  CloseButton,
  DeliverResultButton,
  DisputeButton,
  RefundButton,
  RefuseArbitrationButton,
  RemoveFromWhitelistButton,
  ReopenButton,
  ReviewButton,
  UpdateButton,
  WhitelistButton,
  WithdrawCollateralButton,
  TakeJobButton,
  AssignWorkerButton,
} from './JobActions';
import {
  type Job,
  type JobEventWithDiffs,
  JobState,
  JobEventType,
  type User,
} from '@effectiveacceleration/contracts';
import { zeroAddress, zeroHash } from 'viem';
import {
  PiWarning,
  PiCheckCircle,
  PiXCircle,
  PiArrowsClockwise,
  PiUserPlus,
  PiCoin,
  PiScales,
  PiPackage,
  PiStar,
  PiPencilSimple,
  PiRocket,
  PiHandshake,
} from 'react-icons/pi';

// Section wrapper for grouping related actions
const ActionSection = ({
  title,
  icon: Icon,
  children,
  variant = 'default',
}: {
  title?: string;
  icon?: any;
  children: React.ReactNode;
  variant?: 'default' | 'warning' | 'success' | 'info';
}) => {
  const variantStyles = {
    default:
      'from-gray-50 to-gray-100 dark:from-gray-800/30 dark:to-gray-900/30 border-gray-200 dark:border-gray-700',
    warning:
      'from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800',
    success:
      'from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20 border-emerald-200 dark:border-emerald-800',
    info: 'from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800',
  };

  if (!React.Children.count(children)) return null;

  return (
    <div
      className={`relative rounded-xl bg-gradient-to-br ${variantStyles[variant]} border p-4 transition-all duration-200 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20`}
    >
      {title && (
        <div className='mb-3 flex items-center gap-2 border-b border-gray-200/50 pb-2 dark:border-gray-700/50'>
          {Icon && (
            <Icon className='h-4 w-4 text-gray-600 dark:text-gray-400' />
          )}
          <span className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
            {title}
          </span>
        </div>
      )}
      <div className='space-y-2'>{children}</div>
    </div>
  );
};

const JobButtonActions = ({
  job,
  address,
  sessionKeys,
  addresses,
  events,
  whitelistedWorkers,
  timePassed,
  selectedWorker,
  currentUser,
}: {
  job: Job | undefined;
  address: string | undefined;
  sessionKeys: Record<string, string>;
  addresses: string[];
  events: JobEventWithDiffs[];
  whitelistedWorkers: string[];
  timePassed?: boolean;
  selectedWorker?: string;
  currentUser?: User | null;
}) => {
  // Early return if no job
  if (!job) return null;

  // CREATOR ACTIONS

  const showUpdateButton =
    job.state === JobState.Open && address === job.roles.creator;

  const showCloseButton =
    job.state === JobState.Open && address === job.roles.creator;

  const showReopenButton =
    job.state === JobState.Closed &&
    address === job.roles.creator &&
    job.resultHash === zeroHash;

  const showWithdrawCollateralButton =
    job.state === JobState.Closed &&
    address === job.roles.creator &&
    job.collateralOwed > 0n &&
    timePassed;

  const showWhitelistButton =
    job.state === JobState.Open &&
    address === job.roles.creator &&
    job.whitelistWorkers;

  const showRemoveFromWhitelistButton =
    job.state === JobState.Open &&
    address === job.roles.creator &&
    job.whitelistWorkers &&
    events.length > 0 &&
    events.at(-1)!.job.allowedWorkers!.length! > 0;

  const showReviewButton =
    job.state === JobState.Closed &&
    job.rating === 0 &&
    job.resultHash !== zeroHash &&
    address === job.roles.creator;

  // Show assign button for creator when they've selected a worker
  // Works for both FCFS and multiple applicant jobs
  const showAssignWorkerButton =
    job.state === JobState.Open &&
    address === job.roles.creator &&
    selectedWorker && // A worker has been selected in the UI
    selectedWorker !== address; // Not trying to assign to themselves

  // WORKER ACTIONS

  // For FCFS jobs - workers can immediately take them
  const showTakeJobButton =
    currentUser && 
    job.state === JobState.Open &&
    job.multipleApplicants === false && // FCFS job
    address !== job.roles.creator && // Not the creator
    address !== job.roles.arbitrator && // Not the arbitrator
    (!job.whitelistWorkers || whitelistedWorkers.includes(address!)); // Either no whitelist or user is whitelisted

  // For multiple applicant jobs - workers can apply (signal interest)
  // The AcceptButton actually calls takeJob to signal interest, not to immediately get the job
  const showApplyButton =
    currentUser && 
    job.state === JobState.Open &&
    job.multipleApplicants === true &&
    address !== job.roles.creator &&
    address !== job.roles.arbitrator &&
    (!job.whitelistWorkers || whitelistedWorkers.includes(address!)) &&
    // Check if the worker hasn't already applied (signed)
    !events.some(
      (event) =>
        event.type_ === JobEventType.Signed && event.address_ === address
    );

  const showRefundButton =
    job.state === JobState.Taken && address === job.roles.worker;

  const showDeliverResultButton =
    job.state === JobState.Taken &&
    address === job.roles.worker &&
    Object.keys(sessionKeys).length > 0;

  // ARBITRATOR ACTIONS

  const showArbitrateButton =
    job.state === JobState.Taken && address === job.roles.arbitrator;

  const showRefuseArbitrationButton =
    job.state !== JobState.Closed && address === job.roles.arbitrator;

  // DISPUTE ACTIONS

  const showDisputeButton =
    job.state === JobState.Taken &&
    job.roles.arbitrator !== zeroAddress &&
    address !== job.roles.arbitrator &&
    addresses.length &&
    !job.disputed &&
    (job.roles.creator === address || job.roles.worker === address) &&
    Object.keys(sessionKeys).length > 0;

  // Group actions by category
  const ownerActions = [];
  const workerActions = [];
  const arbitratorActions = [];
  const disputeActions = [];

  // Populate owner actions
  if (showUpdateButton)
    ownerActions.push(
      <UpdateButton key='update' address={address} job={job} />
    );
  if (showCloseButton) ownerActions.push(<CloseButton key='close' job={job} />);
  if (showReopenButton)
    ownerActions.push(<ReopenButton key='reopen' job={job} />);
  if (showReviewButton)
    ownerActions.push(
      <ReviewButton key='review' address={address} job={job} />
    );
  if (showWithdrawCollateralButton)
    ownerActions.push(<WithdrawCollateralButton key='withdraw' job={job} />);
  if (showWhitelistButton)
    ownerActions.push(
      <WhitelistButton
        key='whitelist'
        address={address}
        job={job}
        whitelist={whitelistedWorkers}
      />
    );
  if (showRemoveFromWhitelistButton)
    ownerActions.push(
      <RemoveFromWhitelistButton
        key='remove-whitelist'
        address={address}
        job={job}
        whitelist={whitelistedWorkers}
      />
    );
  if (showAssignWorkerButton && selectedWorker)
    ownerActions.push(
      <AssignWorkerButton
        key='assign'
        address={address}
        job={job}
        selectedWorker={selectedWorker}
      />
    );

  // Populate worker actions
  if (showTakeJobButton)
    workerActions.push(
      <TakeJobButton key='take' address={address} job={job} />
    );
  if (showApplyButton)
    workerActions.push(
      <AcceptButton key='apply' address={address} job={job} events={events} />
    );
  if (showDeliverResultButton)
    workerActions.push(
      <DeliverResultButton
        key='deliver'
        address={address}
        job={job}
        sessionKeys={sessionKeys}
      />
    );
  if (showRefundButton)
    workerActions.push(<RefundButton key='refund' job={job} />);

  // Populate arbitrator actions
  if (showArbitrateButton)
    arbitratorActions.push(
      <ArbitrateButton
        key='arbitrate'
        address={address}
        job={job}
        sessionKeys={sessionKeys}
      />
    );
  if (showRefuseArbitrationButton)
    arbitratorActions.push(<RefuseArbitrationButton key='refuse' job={job} />);

  // Dispute action (shared)
  if (showDisputeButton)
    disputeActions.push(
      <DisputeButton
        key='dispute'
        address={address}
        sessionKeys={sessionKeys}
        job={job}
      />
    );

  // Special highlight for FCFS jobs
  const isFCFSJob = job.state === JobState.Open && !job.multipleApplicants;
  const isMultipleApplicantJob =
    job.state === JobState.Open && job.multipleApplicants;

  return (
    <div className='jobButtonActions space-y-3'>
      {/* FCFS Job Notice */}
      {isFCFSJob && address !== job.roles.creator && (
        <div className='rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 p-3 dark:border-blue-800 dark:from-blue-950/20 dark:to-purple-950/20'>
          <div className='flex items-center gap-2'>
            <PiRocket className='h-5 w-5 text-blue-600 dark:text-blue-400' />
            <div>
              <p className='text-sm font-semibold text-blue-900 dark:text-blue-300'>
                First Come, First Served Job
              </p>
              <p className='text-xs text-blue-700 dark:text-blue-400'>
                Take this job immediately - no application process required!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Multiple Applicant Job Notice for Workers */}
      {isMultipleApplicantJob &&
        address !== job.roles.creator &&
        address !== job.roles.arbitrator && (
          <div className='rounded-lg border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-3 dark:border-green-800 dark:from-green-950/20 dark:to-emerald-950/20'>
            <div className='flex items-center gap-2'>
              <PiHandshake className='h-5 w-5 text-green-600 dark:text-green-400' />
              <div>
                <p className='text-sm font-semibold text-green-900 dark:text-green-300'>
                  Application Required
                </p>
                <p className='text-xs text-green-700 dark:text-green-400'>
                  Apply to this job and wait for the creator to review your
                  application
                </p>
              </div>
            </div>
          </div>
        )}

      {/* Owner Actions */}
      {ownerActions.length > 0 && (
        <ActionSection
          title='Owner Actions'
          icon={PiUserPlus}
          variant='default'
        >
          {ownerActions}
        </ActionSection>
      )}

      {/* Worker Actions */}
      {workerActions.length > 0 && (
        <ActionSection title='Worker Actions' icon={PiPackage} variant='info'>
          {workerActions}
        </ActionSection>
      )}

      {/* Arbitrator Actions */}
      {arbitratorActions.length > 0 && (
        <ActionSection
          title='Arbitrator Actions'
          icon={PiScales}
          variant='warning'
        >
          {arbitratorActions}
        </ActionSection>
      )}

      {/* Dispute Actions */}
      {disputeActions.length > 0 && (
        <ActionSection variant='warning'>{disputeActions}</ActionSection>
      )}
    </div>
  );
};

export default JobButtonActions;
