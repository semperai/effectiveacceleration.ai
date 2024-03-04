// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@arbitrum/nitro-contracts/src/precompiles/ArbSys.sol";
import {getIPFSCID} from "./libraries/IPFS.sol";

uint256 constant ARBITRUM_NOVA_CHAINID = 0xa4ba;
uint256 constant ARBITRUM_GOERLI_CHAINID = 0x66eed;
uint256 constant ARBITRUM_SEPOLIA_CHAINID = 0x66eee;
// https://github.com/OffchainLabs/arbitrum-classic/blob/master/docs/sol_contract_docs/md_docs/arb-os/arbos/builtin/ArbSys.md
address constant ARBSYS_ADDRESS = address(100);

// tags
// messages

// a discussion thread looks like this:
// object (type jobpost (1 byte), address(20 bytes), index of cid of input text(8 bytes),

uint8 constant JOB_STATE_OPEN = 0;
uint8 constant JOB_STATE_CLOSED = 1;
uint8 constant JOB_STATE_TAKEN = 2;

struct JobPost {
    uint8 state;
    // if true, only workers in allowedWorkers can take or message
    bool whitelist_workers;
    address creator;
    uint40 title_blob_idx; // 5 bytes
    uint40 content_cid_blob_idx; // 5 bytes
    address token;
    uint32 allowed_time; // 4 bytes
    uint256 amount; // wei
}

uint8 constant JOB_UPDATE_TITLE = 1; // update title
uint8 constant JOB_UPDATE_CONTENT = 2; // update content
uint8 constant JOB_UPDATE_OFFER = 3; // update token/allowed_time/amount
uint8 constant JOB_UPDATE_ADD_WORKER = 4; // add whitelist worker
uint8 constant JOB_UPDATE_REMOVE_WORKER = 5; // remove whitelist worker
uint8 constant JOB_UPDATE_ENABLE_WHITELIST = 6; // enable whitelist
uint8 constant JOB_UPDATE_DISABLE_WHITELIST = 7; // disable whitelist
uint8 constant JOB_UPDATE_CLOSE = 8; // close job
uint8 constant JOB_UPDATE_REOPEN = 9; // reopen job
uint8 constant JOB_UPDATE_CANCEL = 10; // cancel job

struct JobUpdate {
    uint8 t; // 1 byte / type of object
    uint40 blob_idx; // 5 bytes (used for title or content)
    address user; // 20 bytes (used for whitelist worker)
}

uint8 constant JOB_THREAD_WORKER_MESSAGE = 1;
uint8 constant JOB_THREAD_OWNER_MESSAGE = 2;
struct JobThreadObject {
    uint8 t; // 1 byte / type of object
    uint40 blob_idx; // 5 bytes
}

uint8 constant NOTIFICATION_WHITELISTED_FOR_JOB = 1;
uint8 constant NOTIFICATION_REMOVE_WHITELISTED_FOR_JOB = 2;
uint8 constant NOTIFICATION_CREATE_JOB = 3;

struct Notification {
    uint8 t; // 1 byte / type of object
    uint40 jobid; // job index
    uint40 threadid; // thread index
    address from; // who sent it
}

contract MarketplaceV1 is OwnableUpgradeable, PausableUpgradeable {
    address public treasury; // where treasury fees/rewards go

    address public pauser; // who can pause contract

    uint256 public version; // version (should be updated when performing updates)

    // objects can reference blobs via index to here
    bytes[] public blobs;

    // user and bots receive notifications
    mapping(address => Notification[]) public notifications;

    // users must register by signing a message
    // this allows others to guarantee they can message securely
    mapping(address => bytes) public publicKeys;

    JobPost[] public jobs;

    // tag -> jobid
    mapping(uint256 => uint256[]) public taggedJobs;

    // jobid -> address -> bool
    mapping(uint256 => mapping(address => bool)) public whitelistWorkers;
    // jobid -> JobUpdates
    mapping(uint256 => JobUpdate[]) public jobUpdates;

    mapping(uint256 => JobThreadObject[]) public threads;

    uint256[48] __gap; // upgradeable gap

    /// @notice Modifier to restrict to only pauser
    modifier onlyPauser() {
        require(msg.sender == pauser, "not pauser");
        _;
    }

    modifier onlyJobCreator(uint256 job_id_) {
        require(jobs[job_id_].creator == msg.sender, "not creator");
        _;
    }

    event PauserTransferred(
        address indexed previousPauser,
        address indexed newPauser
    );
    event TreasuryTransferred(
        address indexed previousTreasury,
        address indexed newTreasury
    );
    event VersionChanged(uint256 indexed version);

    event NotificationBroadcast(address indexed addr, uint256 indexed id);

    event JobUpdated(uint256 indexed jobid);

    event PublicKeyRegistered(address indexed addr, bytes pubkey);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /// @notice Initialize contract
    /// @dev For upgradeable contracts this function necessary
    /// @param treasury_ Address of treasury
    function initialize(address treasury_) public initializer {
        __Ownable_init(msg.sender);
        __Pausable_init();
        pauser = msg.sender;
        treasury = treasury_;
    }

    /// @notice Transfer ownership
    /// @param to_ Address to transfer ownership to
    function transferOwnership(
        address to_
    ) public override(OwnableUpgradeable) onlyOwner {
        super.transferOwnership(to_);
    }

    /// @notice Transfer pause ability
    /// @param to_ Address to transfer pauser to
    function transferPauser(address to_) external onlyOwner {
        emit PauserTransferred(pauser, to_);
        pauser = to_;
    }

    /// @notice Transfer treasury
    /// @param to_ Address to transfer treasury to
    function transferTreasury(address to_) external onlyOwner {
        emit TreasuryTransferred(treasury, to_);
        treasury = to_;
    }

    /// @notice Pauses contract
    function pause() external onlyPauser {
        _pause();
    }

    /// @notice Unpauses contract
    function unpause() external onlyPauser {
        _unpause();
    }

    /// @notice Set version
    /// @param version_ Version of contract
    /// @dev This is used for upgrades to inform miners of changes
    function setVersion(uint256 version_) external onlyOwner {
        version = version_;
        emit VersionChanged(version_);
    }

    /// @notice Get IPFS cid
    /// @dev use this for testing
    /// @param content_ Content to get IPFS cid of
    /// @return
    function generateIPFSCID(
        bytes calldata content_
    ) external pure returns (bytes memory) {
        return getIPFSCID(content_);
    }

    /// @notice Get block number (on both arbitrum and l1)
    /// @return Block number
    function getBlockNumberNow() internal view returns (uint256) {
        uint256 id;
        assembly {
            id := chainid()
        }

        if (
            id == ARBITRUM_NOVA_CHAINID ||
            id == ARBITRUM_GOERLI_CHAINID ||
            id == ARBITRUM_SEPOLIA_CHAINID
        ) {
            return ArbSys(ARBSYS_ADDRESS).arbBlockNumber();
        }

        return block.number;
    }

    function blobsLength() public view returns (uint256) {
        return blobs.length;
    }

    function jobUpdatesLength(uint256 job_id_) public view returns (uint256) {
        return jobUpdates[job_id_].length;
    }

    function getThreadKey(
        address bot_,
        uint256 job_id_
    ) public pure returns (uint256) {
        return (uint256(uint160(bot_)) << 160) | job_id_;
    }

    function threadLength(
        address bot_,
        uint256 job_id_
    ) public view returns (uint256) {
        return threads[getThreadKey(bot_, job_id_)].length;
    }

    function notificationLength(address addr_) public view returns (uint256) {
        return notifications[addr_].length;
    }

    // allow users to register their public key
    // this is used to allow others to message you securely
    // we do not do verification here because we want to allow contracts to register
    function registerPublicKey(bytes calldata pubkey) public {
        // we can allow users to update their public key
        // require(publicKeys[msg.sender].length == 0, "already registered");
        publicKeys[msg.sender] = pubkey;
        emit PublicKeyRegistered(msg.sender, pubkey);
    }

    // to subscribe to this, use TYPE_JOB then
    function publishJobPost(
        bytes calldata title_,
        bytes calldata content_,
        address token_,
        uint256 amount_,
        uint256 allowed_time_,
        uint256[] calldata tags_,
        address[] calldata allowed_workers_
    ) public returns (uint256) {
        require(publicKeys[msg.sender].length > 0, "not registered");

        IERC20(token_).transferFrom(msg.sender, address(this), amount_);

        blobs.push(title_);
        uint40 title_blob_idx = uint40(blobs.length);

        {
            bytes memory cid = getIPFSCID(content_);
            blobs.push(cid);
        }
        uint40 content_cid_blob_idx = uint40(blobs.length);

        jobs.push(
            JobPost({
                state: 0,
                whitelist_workers: allowed_workers_.length > 0,
                creator: msg.sender,
                title_blob_idx: uint40(title_blob_idx),
                content_cid_blob_idx: uint40(content_cid_blob_idx),
                token: token_,
                amount: amount_,
                allowed_time: uint32(allowed_time_)
            })
        );

        jobUpdates[jobs.length].push(
            JobUpdate({
                t: JOB_UPDATE_TITLE,
                blob_idx: title_blob_idx,
                user: address(0)
            })
        );
        jobUpdates[jobs.length].push(
            JobUpdate({
                t: JOB_UPDATE_CONTENT,
                blob_idx: content_cid_blob_idx,
                user: address(0)
            })
        );

        blobs.push(abi.encodePacked(token_, allowed_time_, amount_));
        {
            uint40 offer_blob_idx = uint40(blobs.length);
            jobUpdates[jobs.length].push(
                JobUpdate({
                    t: JOB_UPDATE_OFFER,
                    blob_idx: offer_blob_idx,
                    user: address(0)
                })
            );
        }

        if (allowed_workers_.length > 0) {
            jobUpdates[jobs.length].push(
                JobUpdate({
                    t: JOB_UPDATE_ENABLE_WHITELIST,
                    blob_idx: 0,
                    user: address(0)
                })
            );
        }

        for (uint256 i = 0; i < tags_.length; i++) {
            taggedJobs[tags_[i]].push(jobs.length);
        }

        for (uint256 i = 0; i < allowed_workers_.length; i++) {
            whitelistWorkers[jobs.length][allowed_workers_[i]] = true;
            jobUpdates[jobs.length].push(
                JobUpdate({
                    t: JOB_UPDATE_ADD_WORKER,
                    blob_idx: 0,
                    user: allowed_workers_[i]
                })
            );

            notifications[allowed_workers_[i]].push(
                Notification({
                    t: NOTIFICATION_WHITELISTED_FOR_JOB,
                    jobid: uint40(jobs.length),
                    threadid: uint40(jobUpdates[jobs.length].length), // threadid overloaded for jobUpdates index on type
                    from: msg.sender
                })
            );
            emit NotificationBroadcast(
                allowed_workers_[i],
                notifications[allowed_workers_[i]].length
            );
        }

        notifications[msg.sender].push(
            Notification({
                t: NOTIFICATION_CREATE_JOB,
                jobid: uint40(jobs.length),
                threadid: 0,
                from: address(0)
            })
        );
        emit NotificationBroadcast(
            msg.sender,
            notifications[msg.sender].length
        );

        emit JobUpdated(jobs.length);
        return jobs.length;
    }

    function updateJobTitle(
        uint256 job_id_,
        bytes calldata title_
    ) public onlyJobCreator(job_id_) {
        blobs.push(title_);
        uint40 title_blob_idx = uint40(blobs.length);
        jobs[job_id_].title_blob_idx = title_blob_idx;
        jobUpdates[job_id_].push(
            JobUpdate({
                t: JOB_UPDATE_TITLE,
                blob_idx: title_blob_idx,
                user: address(0)
            })
        );
        emit JobUpdated(job_id_);
    }

    function updateJobContent(
        uint256 job_id_,
        bytes calldata content_
    ) public onlyJobCreator(job_id_) {
        bytes memory cid = getIPFSCID(content_);
        blobs.push(cid);
        uint40 content_cid_blob_idx = uint40(blobs.length);
        jobs[job_id_].content_cid_blob_idx = content_cid_blob_idx;
        jobUpdates[job_id_].push(
            JobUpdate({
                t: JOB_UPDATE_CONTENT,
                blob_idx: content_cid_blob_idx,
                user: address(0)
            })
        );
        emit JobUpdated(job_id_);
    }

    function updateJobOffer(
        uint256 job_id_,
        address token_,
        uint256 amount_,
        uint256 allowed_time_
    ) public onlyJobCreator(job_id_) {
        blobs.push(abi.encodePacked(token_, allowed_time_, amount_));
        uint40 offer_blob_idx = uint40(blobs.length);
        jobs[job_id_].token = token_;
        jobs[job_id_].amount = amount_;
        jobs[job_id_].allowed_time = uint32(allowed_time_);
        jobUpdates[job_id_].push(
            JobUpdate({
                t: JOB_UPDATE_OFFER,
                blob_idx: offer_blob_idx,
                user: address(0)
            })
        );
        emit JobUpdated(job_id_);
    }

    function updateJobAddAllowedWorker(
        uint256 job_id_,
        address worker_
    ) public onlyJobCreator(job_id_) {
        whitelistWorkers[job_id_][worker_] = true;
        jobUpdates[job_id_].push(
            JobUpdate({t: JOB_UPDATE_ADD_WORKER, blob_idx: 0, user: worker_})
        );
        notifications[worker_].push(
            Notification({
                t: NOTIFICATION_WHITELISTED_FOR_JOB,
                jobid: uint40(job_id_),
                threadid: uint40(jobUpdates[job_id_].length), // threadid overloaded for jobUpdates index on type
                from: msg.sender
            })
        );
        emit NotificationBroadcast(worker_, notifications[worker_].length);
        emit JobUpdated(job_id_);
    }

    function updateJobRemoveAllowedWorker(
        uint256 job_id_,
        address worker_
    ) public onlyJobCreator(job_id_) {
        whitelistWorkers[job_id_][worker_] = false;
        jobUpdates[job_id_].push(
            JobUpdate({t: JOB_UPDATE_REMOVE_WORKER, blob_idx: 0, user: worker_})
        );
        notifications[worker_].push(
            Notification({
                t: NOTIFICATION_REMOVE_WHITELISTED_FOR_JOB,
                jobid: uint40(job_id_),
                threadid: uint40(jobUpdates[job_id_].length), // threadid overloaded for jobUpdates index on type
                from: msg.sender
            })
        );
        emit NotificationBroadcast(worker_, notifications[worker_].length);
        emit JobUpdated(job_id_);
    }

    function updateJobEnableWhitelist(
        uint256 job_id_
    ) public onlyJobCreator(job_id_) {
        jobs[job_id_].whitelist_workers = true;
        jobUpdates[job_id_].push(
            JobUpdate({
                t: JOB_UPDATE_ENABLE_WHITELIST,
                blob_idx: 0,
                user: address(0)
            })
        );
        emit JobUpdated(job_id_);
    }

    function updateJobDisableWhitelist(
        uint256 job_id_
    ) public onlyJobCreator(job_id_) {
        jobs[job_id_].whitelist_workers = false;
        jobUpdates[job_id_].push(
            JobUpdate({
                t: JOB_UPDATE_DISABLE_WHITELIST,
                blob_idx: 0,
                user: address(0)
            })
        );
        emit JobUpdated(job_id_);
    }

    function closeJob(uint256 job_id_) public onlyJobCreator(job_id_) {
        require(jobs[job_id_].state == JOB_STATE_OPEN, "not open");
        jobs[job_id_].state = JOB_STATE_CLOSED;
        jobUpdates[job_id_].push(
            JobUpdate({t: JOB_UPDATE_CLOSE, blob_idx: 0, user: address(0)})
        );
        emit JobUpdated(job_id_);
    }

    function reopenJob(uint256 job_id_) public onlyJobCreator(job_id_) {
        require(jobs[job_id_].state == JOB_STATE_CLOSED, "not closed");
        jobs[job_id_].state = JOB_STATE_OPEN;
        jobUpdates[job_id_].push(
            JobUpdate({t: JOB_UPDATE_REOPEN, blob_idx: 0, user: address(0)})
        );
        emit JobUpdated(job_id_);
    }

    function postThreadMessage(
        uint256 job_id_,
        bytes calldata content_
    ) public {
        require(jobs[job_id_].state == JOB_STATE_OPEN, "not open");

        bool isOwner = jobs[job_id_].creator == msg.sender;
        if (isOwner) {
            require(
                jobs[job_id_].whitelist_workers == false ||
                    whitelistWorkers[job_id_][msg.sender],
                "not whitelisted"
            );
        }

        bytes memory content_cid = getIPFSCID(content_);
        blobs.push(content_cid);
        uint40 content_cid_blob_idx = uint40(blobs.length);

        uint256 threadid = getThreadKey(msg.sender, job_id_);

        if (isOwner) {
            threads[threadid].push(
                JobThreadObject({
                    t: JOB_THREAD_OWNER_MESSAGE,
                    blob_idx: content_cid_blob_idx
                })
            );
            notifications[jobs[job_id_].creator].push(
                Notification({
                    t: JOB_THREAD_OWNER_MESSAGE,
                    jobid: uint40(job_id_),
                    threadid: uint40(threads[threadid].length),
                    from: msg.sender
                })
            );
        } else {
            threads[threadid].push(
                JobThreadObject({
                    t: JOB_THREAD_WORKER_MESSAGE,
                    blob_idx: content_cid_blob_idx
                })
            );
            notifications[jobs[job_id_].creator].push(
                Notification({
                    t: JOB_THREAD_WORKER_MESSAGE,
                    jobid: uint40(job_id_),
                    threadid: uint40(threads[threadid].length),
                    from: msg.sender
                })
            );
        }
    }
}
