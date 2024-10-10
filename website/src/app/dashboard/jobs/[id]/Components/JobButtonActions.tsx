import { ApproveButton } from '@/components/JobActions/ApproveButton'
import { AcceptButton } from '@/components/JobActions/AcceptButton'
import { ArbitrateButton } from '@/components/JobActions/ArbitrateButton'
import { AssignWorkerButton } from '@/components/JobActions/AssignWorkerButton'
import { CloseButton } from '@/components/JobActions/CloseButton'
import { DeliverResultButton } from '@/components/JobActions/DeliverResultButton'
import { DisputeButton } from '@/components/JobActions/DisputeButton'
import { PostMessageButton } from '@/components/JobActions/PostMessageButton'
import { RefundButton } from '@/components/JobActions/RefundButton'
import { RefuseArbitrationButton } from '@/components/JobActions/RefuseArbitrationButton'
import { RemoveFromWhitelistButton } from '@/components/JobActions/RemoveFromWhitelistButton'
import { ReopenButton } from '@/components/JobActions/ReopenButton'
import { ReviewButton } from '@/components/JobActions/ReviewButton'
import { UpdateButton } from '@/components/JobActions/UpdateButton'
import { WhitelistButton } from '@/components/JobActions/WhitelistButton'
import { WithdrawCollateralButton } from '@/components/JobActions/WithdrawCollateralButton'
import { Job, JobEventWithDiffs, JobState } from 'effectiveacceleration-contracts'
import React from 'react'
import { zeroHash, zeroAddress } from 'viem'

const JobButtonActions = ({job, address, sessionKeys, addresses, events, whitelistedWorkers, timePassed} : {job: Job | undefined, address:`0x${string}` | undefined, sessionKeys:Record<string, string>, addresses: string[], events: JobEventWithDiffs[], whitelistedWorkers: string[], timePassed?: boolean}) => {
  return (
    <div className="">
    {job && <div className="flex flex-col gap-2">
      {/* owner & worker actions */}
      {job.state === JobState.Taken && job.resultHash !== zeroHash && job.roles.arbitrator !== zeroAddress && address !== job.roles.arbitrator && addresses.length && Object.keys(sessionKeys).length > 0 &&
        <DisputeButton address={address} sessionKeys={sessionKeys} job={job}></DisputeButton>
      }
      {/* {job.state !== JobState.Closed && address !== job.roles.arbitrator && addresses.length && Object.keys(sessionKeys).length > 0 &&
          <div className='row-span-1 flex flex-1 border border-gray-100'>
              <PostMessageButton address={address} addresses={addresses as any} sessionKeys={sessionKeys} job={job}/>
          </div>
      } */}

      {/* owner actions */}
      {/* {job.state === JobState.Open && address === job.roles.creator && events.length > 0 &&
        <AssignWorkerButton address={address} job={job}></AssignWorkerButton>
      } */}
      {/* {job.state === JobState.Taken && job.resultHash !== zeroHash && address === job.roles.creator &&
        <ApproveButton address={address} job={job}></ApproveButton>
      } */}
      {job.state === JobState.Closed && job.rating === 0 && job.resultHash !== zeroHash && address === job.roles.creator &&
        <ReviewButton address={address} job={job}></ReviewButton>
      }
      {job.state === JobState.Open && address === job.roles.creator &&
        <CloseButton address={address} job={job}></CloseButton>
      }
      {job.state === JobState.Closed && address === job.roles.creator && job.resultHash === zeroHash &&
        <ReopenButton address={address} job={job}></ReopenButton>
      }
      {job.state === JobState.Closed && address === job.roles.creator && job.collateralOwed > 0n && timePassed &&
        <WithdrawCollateralButton address={address} job={job}></WithdrawCollateralButton>
      }
      {job.state === JobState.Open && address === job.roles.creator && job.whitelistWorkers &&
        <WhitelistButton address={address} job={job} whitelist={whitelistedWorkers}></WhitelistButton>
      }
      {job.state === JobState.Open && address === job.roles.creator && job.whitelistWorkers && events.length > 0 && events.at(-1)!.job.allowedWorkers!.length! > 0 &&
        <RemoveFromWhitelistButton address={address} job={job} whitelist={whitelistedWorkers}></RemoveFromWhitelistButton>
      }
      {(job.state === JobState.Open && address === job.roles.creator || job.state === JobState.Closed && address === job.roles.creator && job.resultHash === zeroHash) &&
        <UpdateButton address={address} job={job}></UpdateButton>
      }

      {/* worker actions */}
      {job.state === JobState.Taken && address === job.roles.worker &&
        <RefundButton address={address} job={job}></RefundButton>
      }
      {job.state === JobState.Open && address === job.roles.worker && events.length > 0 &&
        <AcceptButton address={address} job={job} events={events}></AcceptButton>
      }
      {job.state === JobState.Taken && address === job.roles.worker && Object.keys(sessionKeys).length > 0 &&
        <DeliverResultButton address={address} job={job} sessionKeys={sessionKeys}></DeliverResultButton>
      }

      {/* arbitrator actions */}
      {job.state === JobState.Taken && address === job.roles.arbitrator &&
        <ArbitrateButton address={address} job={job} sessionKeys={sessionKeys}></ArbitrateButton>
      }
      {job.state !== JobState.Closed && address === job.roles.arbitrator &&
        <RefuseArbitrationButton job={job}></RefuseArbitrationButton>
      }
    </div>
    }
  </div>
  )
}

export default JobButtonActions