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
} from './JobActions';
import {
  type Job,
  type JobEventWithDiffs,
  JobState,
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
}: {
  job: Job | undefined;
  address: string | undefined;
  sessionKeys: Record<string, string>;
  addresses: string[];
  events: JobEventWithDiffs[];
  whitelistedWorkers: string[];
  timePassed?: boolean;
}) => {
  // Early return if no job
  if (!job) return null;

  const showDisputeButton =
    job.state === JobState.Taken &&
    job.roles.arbitrator !== zeroAddress &&
    address !== job.roles.arbitrator &&
    addresses.length &&
    !job.disputed &&
    (job.roles.creator === address || job.roles.worker === address) &&
    Object.keys(sessionKeys).length > 0;

  const showReviewButton =
    job.state === JobState.Closed &&
    job.rating === 0 &&
    job.resultHash !== zeroHash &&
    address === job.roles.creator;

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

  const showUpdateButton =
    job.state === JobState.Open && address === job.roles.creator;

  const showRefundButton =
    job.state === JobState.Taken && address === job.roles.worker;

  const showAcceptButton =
    job.state === JobState.Open &&
    address === job.roles.worker &&
    events.length > 0;

  const showDeliverResultButton =
    job.state === JobState.Taken &&
    address === job.roles.worker &&
    Object.keys(sessionKeys).length > 0;

  const showArbitrateButton =
    job.state === JobState.Taken && address === job.roles.arbitrator;

  const showRefuseArbitrationButton =
    job.state !== JobState.Closed && address === job.roles.arbitrator;

  // Group actions by category
  const ownerActions = [];
  const workerActions = [];
  const arbitratorActions = [];
  const disputeActions = [];

  // Populate owner actions - directly render the buttons without wrapper
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

  // Populate worker actions
  if (showAcceptButton)
    workerActions.push(
      <AcceptButton key='accept' address={address} job={job} events={events} />
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

  return (
    <div className='jobButtonActions space-y-3'>
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
