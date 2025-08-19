# Testing Plan

## Test Scenarios

1. **FCFS Job - Complete Flow**

Test ID: FCFS-001

Steps:

- Creator posts FCFS job
- Worker A views job → Should see FCFSAvailable status with Take Job button
- Worker B views job → Should also see FCFSAvailable status
- Worker A takes job → Should see "Job Started" confirmation
- Creator views job → Should see WorkerAccepted status
- Worker B views job → Should see JobObserver status (no messages)
- Worker A delivers → Creator should see ResultVerification
- Creator approves → Both should see ResultAccepted
- Observer views → Should see JobObserver with system events only

2. **Multiple Applicants - Selection Flow**

Test ID: MULTI-001

Steps:

- Creator posts multiple applicant job
- Worker A sends message → Creator sees message from Worker A
- Worker B sends message → Creator sees separate chat for Worker B
- Creator selects Worker A → Job becomes Taken
- Worker A views → Sees full conversation and WorkerAccepted
- Worker B views → Sees NotSelected status with own history
- Observer views → Sees JobObserver, no messages


3. **Delivery and Approval**

Test ID: DELIVERY-001

Steps:

- Setup: FCFS job taken by worker
- Worker delivers result
- Creator views → Should see ResultVerification with Approve/Dispute
- Creator approves → Should see ResultAccepted
- Check: Payment released notification shown

4: **Dispute Flow**

Test ID: DISPUTE-001

Steps:

- Setup: Job with arbitrator, worker delivered
- Creator disputes → All parties see DisputeStarted
- Arbitrator views → Can see all messages and arbitrate
- Arbitrator resolves → All see ArbitratedStatus with fund distribution

5. **Edge Cases**

Test ID: EDGE-001

Steps:

- FCFS job with no events → Worker should still see FCFSAvailable
- User switches roles → UI should update immediately
- Applicant becomes observer → Should transition from NotSelected to JobObserver
- No arbitrator + dispute attempt → Should show warning

## Testing Checklist

For Each Scenario Test:

- Visual Elements

    - Correct status component displays
    - Proper empty states
    - Loading states work


- Events Display

    - Correct events shown for role
    - No encrypted message errors for observers
    - Timeline displays correctly


- Actions

    - Correct buttons show for role/state
    - Buttons are disabled when inappropriate
    - Actions complete successfully


- Transitions

    - State changes reflect immediately
    - No flashing/jumping UI
    - Smooth status component transitions


- Error Cases

    - No session keys → appropriate message
    - Network errors → handled gracefully
    - Invalid states → fallback behavior



## Manual Testing Script

### Setup
1. Deploy contracts or use testnet
2. Create test accounts:
   - Account A: Creator
   - Account B: Worker 1
   - Account C: Worker 2
   - Account D: Arbitrator
   - Account E: Observer

### Test FCFS Job

1. [Account A] Create FCFS job with arbitrator
2. [Account E] View job → Verify observer sees no "Apply" option for FCFS
3. [Account B] View job → Verify "Take Job" button visible
4. [Account B] Take job → Verify immediate assignment
5. [Account C] View job → Verify sees "Job in progress" not messages
6. [Account B] Send message → Verify creator receives
7. [Account B] Deliver work
8. [Account A] View → Verify "Approve" button visible
9. [Account A] Approve → Verify completion status

### Test Multiple Applicants

1. [Account A] Create multiple applicant job
2. [Account B] Send application message
3. [Account C] Send application message
4. [Account A] View → Verify sees both chats separately
5. [Account A] Select Account B
6. [Account C] View → Verify sees "Not Selected" status
7. Continue with delivery flow...

### Test Protection

1. [Account E] View taken job → Verify no encrypted errors
2. [Account E] Check events → Verify only system events visible
