// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import { encodeString, encodeBytes, encodeStringArray, encodeAddressArray } from "./libraries/Encoding.sol";

import "./unicrow/Unicrow.sol";
import "./unicrow/UnicrowDispute.sol";
import "./unicrow/UnicrowArbitrator.sol";
import "./unicrow/UnicrowTypes.sol";

// import "hardhat/console.sol";

enum JobState {
    Open,
    Taken,
    Closed
}

uint32 constant _24_HRS = 60 * 60 * 24;

uint8 constant RATING_MIN = 1;
uint8 constant RATING_MAX = 5;

struct JobRoles {
    address creator;
    address arbitrator;
    address worker; // who took the job
}

struct JobPost {
    uint8 state;
    // if true, only workers in allowedWorkers can take or message
    bool whitelistWorkers;
    JobRoles roles;
    string title;
    string[] tags;
    bytes32 contentHash; // 32 bytes
    bool multipleApplicants;
    uint256 amount; // wei
    address token;
    uint256 timestamp; // Timestamp of the latest update on the job (posted, started, closed)
    uint32 maxTime; // 4 bytes
    string deliveryMethod;
    uint256 collateralOwed; // amount locked until 24 hours after the job is created or reopened
    uint256 escrowId;
    bytes32 resultHash;
    uint8 rating;
    bool disputed;
}

enum JobEventType {
    Created,
    Taken,
    Paid,
    Updated,
    Signed,
    Completed,
    Delivered,
    Closed,
    Reopened,
    Rated,
    Refunded,
    Disputed,
    Arbitrated,
    ArbitrationRefused,
    WhitelistedWorkerAdded,
    WhitelistedWorkerRemoved,
    CollateralWithdrawn,
    WorkerMessage,
    OwnerMessage
}

struct JobEventData {
    uint8 type_;      // 1 byte / type of object
    bytes address_;   // empty or context dependent address data, either who sent it or whom it targets
    bytes data_;      // extra event data, e.g. 34 bytes for CID
    uint32 timestamp_; // 4 bytes
}

struct JobArbitrator {
    bytes publicKey;
    string name;
    uint16 fee;
    uint16 settledCount;
    uint16 refusedCount;
}

/// @dev Stores current average user's rating and number of reviews so it can be updated with every new review
struct UserRating {
    /// @dev Current rating multiplied by 10,000 to achieve sufficient granularity even with lots of existing reviews
    uint16 averageRating;
    uint256 numberOfReviews;
}

contract MarketplaceV1 is OwnableUpgradeable, PausableUpgradeable {
    address public treasury; // where treasury fees/rewards go

    address public pauser; // who can pause contract

    uint256 public version; // version (should be updated when performing updates)

    // users must register their public keys (compressed, 33 bytes)
    // this allows others to guarantee they can message securely
    mapping(address => bytes) public publicKeys;

    mapping(address => JobArbitrator) public arbitrators;
    address[] public arbitratorAddresses;

    JobPost[] public jobs;

    mapping(string => string) private meceTags;

    // jobId -> address -> bool
    mapping(uint256 => mapping(address => bool)) public whitelistWorkers;

    // jobId -> JobEvents
    mapping(uint256 => JobEventData[]) public jobEvents;

    // Current average rating and number of ratings for each user
    mapping(address => UserRating) public userRatings;

    address public unicrowAddress;
    address public unicrowDisputeAddress;
    address public unicrowArbitratorAddress;

    address public unicrowMarketplaceAddress;
    uint16 public unicrowMarketplaceFee;

    uint256[34] __gap; // upgradeable gap

    /// @notice Modifier to restrict to only pauser
    modifier onlyPauser() {
        require(msg.sender == pauser, "not pauser");
        _;
    }

    modifier onlyJobCreator(uint256 jobId_) {
        require(jobs[jobId_].roles.creator == msg.sender, "not creator");
        _;
    }

    modifier onlyWorker(uint256 jobId_) {
        require(jobs[jobId_].roles.worker == msg.sender, "not worker");
        _;
    }

    modifier onlyCreatorOrWorker(uint256 jobId_) {
        require(jobs[jobId_].roles.creator == msg.sender || jobs[jobId_].roles.worker == msg.sender, "not worker or creator");
        _;
    }

    modifier onlyArbitrator(uint256 jobId_) {
        require(jobs[jobId_].roles.arbitrator == msg.sender, "not arbitrator");
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
    event JobEvent(uint256 indexed jobId, JobEventData eventData);

    event PublicKeyRegistered(address indexed addr, bytes pubkey);

    event ArbitratorRegistered(address indexed addr, bytes pubkey, string name, uint16 fee);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        //NOTE: do not put any state initialization here
        _disableInitializers();
    }

    /// @notice Initialize contract
    /// @dev For upgradeable contracts this function necessary
    /// @param treasury_ Address of treasury
    /// @param unicrowAddress_ Address of Unicrow contract
    /// @param unicrowDisputeAddress_ Address of UnicrowDispute contract
    /// @param unicrowArbitratorAddress_ Address of UnicrowArbitrator contract
    /// @param unicrowMarketplaceAddress_ Address which will collect this marketplace fees, better not to set it to address(this) to not mess up with collateral values
    /// @param unicrowMarketplaceFee_ Fee for this marketplace in bips
    function initialize(
            address treasury_,
            address unicrowAddress_,
            address unicrowDisputeAddress_,
            address unicrowArbitratorAddress_,
            address unicrowMarketplaceAddress_,
            uint16 unicrowMarketplaceFee_
        ) public initializer {
        __Ownable_init(msg.sender);
        __Pausable_init();
        pauser = msg.sender;
        treasury = treasury_;

        unicrowAddress = unicrowAddress_;
        unicrowDisputeAddress = unicrowDisputeAddress_;
        unicrowArbitratorAddress = unicrowArbitratorAddress_;

        unicrowMarketplaceAddress = unicrowMarketplaceAddress_;
        unicrowMarketplaceFee = unicrowMarketplaceFee_;

        meceTags["DA"] = "DIGITAL_AUDIO";
        meceTags["DV"] = "DIGIAL_VIDEO";
        meceTags["DT"] = "DIGITAL_TEXT";
        meceTags["DS"] = "DIGITAL_SOFTWARE";
        meceTags["DO"] = "DIGITAL_OTHERS";
        meceTags["DG"] = "NON_DIGITAL_GOODS";
        meceTags["DS"] = "NON_DIGITAL_SERVICES";
        meceTags["DO"] = "NON_DIGITAL_OTHERS";
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

    function setUnicrowMarketplaceAddress(address unicrowMarketplaceAddress_) public onlyOwner {
        unicrowMarketplaceAddress = unicrowMarketplaceAddress_;
    }

    function updateUnicrowAddresses(address unicrowAddress_, address unicrowDisputeAddress_, address unicrowArbitratorAddress_) public onlyOwner {
        unicrowAddress = unicrowAddress_;
        unicrowDisputeAddress = unicrowDisputeAddress_;
        unicrowArbitratorAddress = unicrowArbitratorAddress_;
    }

    // allow users to register their *message encryption* public key
    // this is used to allow others to message you securely
    // we do not do verification here because we want to allow contracts to register
    function registerPublicKey(bytes calldata pubkey) public {
        // presently we do not allow to update the public keys otherwise the decryption of old messages will become impossible
        require(publicKeys[msg.sender].length == 0, "already registered");
        require(pubkey.length == 33, "invalid pubkey length, must be compressed, 33 bytes");
        publicKeys[msg.sender] = pubkey;
        emit PublicKeyRegistered(msg.sender, pubkey);
    }

    // registers an arbitrator with their *message encryption* public key, name and fee they charge
    function registerArbitrator(bytes calldata pubkey, string calldata name, uint16 fee) public {
        // presently we do not allow to update the public keys otherwise the decryption of old messages will become impossible
        require(arbitrators[msg.sender].publicKey.length == 0, "already registered");
        require(pubkey.length == 33, "invalid pubkey length, must be compressed, 33 bytes");
        arbitrators[msg.sender] = JobArbitrator(
            pubkey,
            name,
            fee,
            0,
            0
        );

        arbitratorAddresses.push(msg.sender);

        emit ArbitratorRegistered(msg.sender, pubkey, name, fee);
    }

    function arbitratorsLength() public view returns (uint256) {
        return arbitratorAddresses.length;
    }

    // function getArbitrators(uint256 index_, uint256 limit_) public view returns (JobArbitrator[] memory) {
    //     require(index_ < arbitratorAddresses.length, "index out of bounds");

    //     uint length = arbitratorAddresses.length - index_;
    //     if (limit_ == 0) {
    //         limit_ = length;
    //     }
    //     length = length > limit_ ? limit_ : length;
    //     JobArbitrator[] memory result = new JobArbitrator[](length);
    //     for (uint i = 0; i < length; i++) {
    //         result[i] = arbitrators[arbitratorAddresses[i + index_]];
    //     }
    //     return result;
    // }

    function eventsLength(uint256 jobId_) public view returns (uint256) {
        return jobEvents[jobId_].length;
    }

    // // Function to get past job events starting from a specific index
    // function getEvents(uint256 jobId_, uint256 index_, uint256 limit_) public view returns (JobEventData[] memory) {
    //     require(index_ < jobEvents[jobId_].length, "index out of bounds");

    //     uint length = jobEvents[jobId_].length - index_;
    //     if (limit_ == 0) {
    //         limit_ = length;
    //     }
    //     length = length > limit_ ? limit_ : length;
    //     JobEventData[] memory result = new JobEventData[](length);
    //     for (uint i = 0; i < length; i++) {
    //         result[i] = jobEvents[jobId_][i + index_];
    //     }

    //     return result;
    // }

    function jobsLength() public view returns (uint256) {
        return jobs.length;
    }

    function getJob(uint256 jobId_) public view returns (JobPost memory) {
        return jobs[jobId_];
    }

    function publishJobEvent(uint256 jobId_, JobEventData memory event_) internal {
        event_.timestamp_ = uint32(block.timestamp);
        jobEvents[jobId_].push(event_);
        emit JobEvent(jobId_, event_);
    }

    // Function to read MECE tag's long form given the short form
    function readMeceTag(string memory shortForm) public view returns (string memory) {
        require(bytes(meceTags[shortForm]).length != 0, "Invalid MECE tag");
        return meceTags[shortForm];
    }

    // Governance function to add or update MECE tags
    function updateMeceTag(string memory shortForm, string memory longForm) public onlyOwner {
        require(bytes(shortForm).length > 0 && bytes(longForm).length > 0, "Invalid tag data");
        meceTags[shortForm] = longForm;
    }

    function removeMeceTag(string memory shortForm) public onlyOwner {
        require(bytes(meceTags[shortForm]).length != 0, "MECE tag does not exist");
        delete meceTags[shortForm];
    }

    function checkParams(
        string memory title_,
        string[] memory tags_,
        uint256 amount_,
        address arbitrator_
    ) internal {
        uint256 titleLength = bytes(title_).length;
        require(titleLength > 0 && titleLength < 255, "title too short or long");
        require(amount_ > 0, "amount must be greater than 0");
        require(tags_.length > 0, "At least one tag is required");
        if (arbitrator_ != address(0)) {
            require(arbitrators[arbitrator_].publicKey.length > 0, "arbitrator not registered");
        }

        uint meceCount = 0;
        string memory meceShortForm = "";

        // Check for exactly one MECE tag
        for (uint8 i = 0; i < tags_.length; i++) {
            if (bytes(meceTags[tags_[i]]).length != 0) {
                meceCount++;
                if (meceCount > 1) {
                    revert("Only one MECE tag is allowed");
                }
                meceShortForm = tags_[i]; // Save the short form
            }
        }

        require(meceCount == 1, "Exactly one MECE tag is required");
    }

    /**
     * @notice Publish a new job post
     * @notice To assign the job to a specific worker, set multipleApplicants_ to false and add the worker to the allowedWorkers_. In such a case, title and description can be encrypted for the worker
     * @notice The function will request a collateral deposit in the amount_ and token_ from the caller.
     * @param title_ job title - must be not null
     * @param contentHash_ short job description published on IPFS
     * @param multipleApplicants_ do you want to select from multiple applicants or let the first one take the job?
     * @param tags_ labels to help the workers search for the job. Each job must have exactly one of the labels listed above, and any number of other labels
     * @param token_ token in which you prefer to pay the job with - must be a valid ERC20 token or 0x00..00 for ETH
     * @param amount_ expected amount to pay for the job - must be greater than 0
     * @param maxTime_ maximum expected time (in sec) to deliver the job - must be greater than 0
     * @param deliveryMethod_ preferred method of delivery (e.g. "IPFS", "Courier")
     * @param arbitrator_ address of an arbitrator preferred by the customer
     * @param allowedWorkers_ list of workers that can apply for the job. Leave empty if any worker can apply
     */
    function publishJobPost(
        string calldata title_,
        bytes32 contentHash_,
        bool multipleApplicants_,
        string[] calldata tags_,
        address token_,
        uint256 amount_,
        uint32 maxTime_,
        string calldata deliveryMethod_,
        address arbitrator_,
        address[] calldata allowedWorkers_
    ) public returns (uint256) {
        checkParams(title_, tags_, amount_, arbitrator_);

        // uint256 titleLength = bytes(title_).length;
        // require(titleLength > 0 && titleLength < 255, "title too short or long");
        require(token_.code.length > 0 && IERC20(token_).balanceOf(msg.sender) > 0, "invalid token");
        IERC20(token_).approve(address(this), type(uint256).max);
        // require(amount_ > 0, "amount must be greater than 0");

        uint256 deliveyMethodLength = bytes(deliveryMethod_).length;
        require(deliveyMethodLength > 0 && deliveyMethodLength < 255, "delivery method too short or long");
        require(publicKeys[msg.sender].length > 0, "not registered");
        // require(tags_.length > 0, "At least one tag is required");

        // uint meceCount = 0;
        // string memory meceShortForm = "";

        // // Check for exactly one MECE tag
        // for (uint8 i = 0; i < tags_.length; i++) {
        //     if (bytes(meceTags[tags_[i]]).length != 0) {
        //         meceCount++;
        //         if (meceCount > 1) {
        //             revert("Only one MECE tag is allowed");
        //         }
        //         meceShortForm = tags_[i]; // Save the short form
        //     }
        // }

        // require(meceCount == 1, "Exactly one MECE tag is required");

        // if (arbitrator_ != address(0)) {
        //     require(arbitrators[arbitrator_].publicKey.length > 0, "arbitrator not registered");
        // }

        SafeERC20.safeTransferFrom(IERC20(token_), msg.sender, address(this), amount_);

        jobs.push();

        uint256 jobId = jobs.length - 1;

        JobPost storage jobPost = jobs[jobId];

        // jobPost.state = uint8(JobState.Open); // will be zero anyway
        jobPost.whitelistWorkers = allowedWorkers_.length > 0;
        jobPost.roles.creator = msg.sender;
        jobPost.title = title_;
        jobPost.tags = tags_;
        jobPost.contentHash = contentHash_;
        jobPost.multipleApplicants = multipleApplicants_;
        jobPost.token = token_;
        jobPost.amount = amount_;
        jobPost.timestamp = block.timestamp;
        jobPost.maxTime = maxTime_;
        jobPost.deliveryMethod = deliveryMethod_;
        jobPost.roles.arbitrator = arbitrator_;
        // jobPost.roles.worker = address(0); // will be zero anyway

        bytes memory allowedWorkerData = encodeAddressArray(allowedWorkers_);
        publishJobEvent(jobId,
            JobEventData({
                type_: uint8(JobEventType.Created),
                address_: abi.encodePacked(msg.sender),
                data_: bytes.concat(
                    encodeString(title_),
                    abi.encodePacked(contentHash_),
                    abi.encodePacked(multipleApplicants_),
                    encodeStringArray(tags_),
                    abi.encodePacked(uint160(token_)),
                    abi.encodePacked(amount_),
                    abi.encodePacked(uint32(maxTime_)),
                    encodeString(deliveryMethod_),
                    abi.encodePacked(uint160(arbitrator_)),
                    allowedWorkerData
                ),
                timestamp_: 0
            })
        );

        if (allowedWorkers_.length > 0) {
            updateJobWhitelist(jobId, allowedWorkers_, new address[](0));
        }

        return jobId;
    }

    function updateJobPost(
        uint256 jobId_,
        string calldata title_,
        bytes32 contentHash_,
        string[] calldata tags_,
        uint256 amount_,
        uint32 maxTime_,
        address arbitrator_,
        bool whitelistWorkers_
    ) public onlyJobCreator(jobId_) {
        require(jobs[jobId_].state == uint8(JobState.Open), "not open");

        checkParams(title_, tags_, amount_, arbitrator_);

        // uint256 titleLength = bytes(title_).length;
        // require(titleLength > 0 && titleLength < 255, "title too short or long");
        // require(amount_ > 0, "amount must be greater than 0");
        // if (arbitrator_ != address(0)) {
        //     require(arbitrators[arbitrator_].publicKey.length > 0, "arbitrator not registered");
        // }
        JobPost storage job = jobs[jobId_];

        if (job.amount != amount_ ) {
            if (amount_ > job.amount) {
                uint256 difference = amount_ - job.amount;

                SafeERC20.safeTransferFrom(IERC20(job.token), msg.sender, address(this), difference - job.collateralOwed);
                job.collateralOwed = 0; // Clear the collateral record
            } else {
                uint256 difference = job.amount - amount_;
                if (block.timestamp >= job.timestamp + _24_HRS) {
                    SafeERC20.safeTransferFrom(IERC20(job.token), address(this), msg.sender, difference + job.collateralOwed);
                    job.collateralOwed = 0; // Clear the collateral record
                } else {
                    job.collateralOwed += difference; // Record to owe later
                }
            }

            job.amount = amount_;
        }

        {
            jobs[jobId_].title = title_;
        }
        {
            jobs[jobId_].contentHash = contentHash_;
        }
        {
            jobs[jobId_].whitelistWorkers = whitelistWorkers_;
            jobs[jobId_].maxTime = uint32(maxTime_);
        }

        {
            jobs[jobId_].roles.arbitrator = arbitrator_;
        }

        publishJobEvent(jobId_,
            JobEventData({
                type_: uint8(JobEventType.Updated),
                address_: bytes(""),
                data_: bytes.concat(
                    encodeString(title_),
                    abi.encodePacked(jobs[jobId_].contentHash),
                    encodeStringArray(tags_),
                    abi.encodePacked(amount_),
                    abi.encodePacked(uint32(maxTime_)),
                    abi.encodePacked(uint160(arbitrator_)),
                    abi.encodePacked(whitelistWorkers_)
                ),
                timestamp_: 0
            })
        );
    }

    function updateJobWhitelist(
        uint256 jobId_,
        address[] memory allowedWorkers_,
        address[] memory disallowedWorkers_
    ) public onlyJobCreator(jobId_) {
        _updateJobWhitelist(jobId_, allowedWorkers_, disallowedWorkers_);
    }

    function _updateJobWhitelist(
        uint256 jobId_,
        address[] memory allowedWorkers_,
        address[] memory disallowedWorkers_
    ) internal {
        require(jobs[jobId_].state == uint8(JobState.Open), "not open");

        for (uint256 i = 0; i < allowedWorkers_.length; i++) {
            whitelistWorkers[jobId_][allowedWorkers_[i]] = true;

            publishJobEvent(jobId_,
                JobEventData({
                    type_: uint8(JobEventType.WhitelistedWorkerAdded),
                    address_: abi.encodePacked(allowedWorkers_[i]),
                    data_: bytes(""),
                    timestamp_: 0
                })
            );
        }

        for (uint256 i = 0; i < disallowedWorkers_.length; i++) {
            whitelistWorkers[jobId_][disallowedWorkers_[i]] = false;

            publishJobEvent(jobId_,
                JobEventData({
                    type_: uint8(JobEventType.WhitelistedWorkerRemoved),
                    address_: abi.encodePacked(disallowedWorkers_[i]),
                    data_: bytes(""),
                    timestamp_: 0
                })
            );
        }
    }

    /**
     * @notice Close the job that hasn't been started. 
     * @notice If it's been more than 24 hrs since the job was posted, the collateral will be automatically returned.
     * @notice Otherwise the buyer must withdraw the collateral separately.
     */
    function closeJob(uint256 jobId_) public onlyJobCreator(jobId_) {
        require(jobs[jobId_].state == uint8(JobState.Open), "not open");
        JobPost storage job = jobs[jobId_];
        job.state = uint8(JobState.Closed);

        if (block.timestamp >= job.timestamp + _24_HRS) {
            uint256 amount = job.amount + job.collateralOwed;
            job.collateralOwed = 0; // Clear the collateral record
            SafeERC20.safeTransferFrom(IERC20(job.token), address(this), job.roles.creator, amount);
        } else {
            job.collateralOwed += job.amount;
        }

        publishJobEvent(jobId_,
            JobEventData({
                type_: uint8(JobEventType.Closed),
                address_: bytes(""),
                data_: bytes(""),
                timestamp_: 0
            })
        );
    }

    /**
     * @notice Withdraw collateral from the closed job 
     */
    function withdrawCollateral(uint256 jobId_, address token_) public {
        // check if the job is closed
        require(jobs[jobId_].state == uint8(JobState.Closed), "not closed");

        JobPost storage job = jobs[jobId_];
        require(block.timestamp >= job.timestamp + _24_HRS, "24 hours have not passed yet");
        require(job.collateralOwed > 0, "No collateral to withdraw");

        uint256 amount = job.collateralOwed;
        SafeERC20.safeTransferFrom(IERC20(token_), address(this), job.roles.creator, amount);
        job.collateralOwed = 0; // Reset the owed amount

        publishJobEvent(jobId_,
            JobEventData({
                type_: uint8(JobEventType.CollateralWithdrawn),
                address_: bytes(""),
                data_: bytes(""),
                timestamp_: 0
            })
        );
    }

    function reopenJob(uint256 jobId_) public onlyJobCreator(jobId_) {
        JobPost storage job = jobs[jobId_];

        require(job.state == uint8(JobState.Closed), "not closed");

        job.resultHash = 0;

        if (job.collateralOwed < job.amount) {
            SafeERC20.safeTransferFrom(IERC20(job.token), msg.sender, address(this), job.amount - job.collateralOwed);
            job.collateralOwed = 0;
        } else {
            job.collateralOwed -= job.amount;
        }

        job.state = uint8(JobState.Open);
        job.timestamp = block.timestamp;

        publishJobEvent(jobId_,
            JobEventData({
                type_: uint8(JobEventType.Reopened),
                address_: bytes(""),
                data_: bytes(""),
                timestamp_: 0
            })
        );
    }

    function postThreadMessage(
        uint256 jobId_,
        bytes32 contentHash_
    ) public {
        require(jobs[jobId_].state != uint8(JobState.Closed), "job closed");

        bool isOwner = jobs[jobId_].roles.creator == msg.sender;
        if (!isOwner) {
            if (jobs[jobId_].state == uint8(JobState.Taken)) {
                // only assigned workers can message on the job if it is taken
                require(jobs[jobId_].roles.worker == msg.sender, "taken/not worker");
            } else {
                require(
                    // only whitelisted workers can message on the job if it is open
                    jobs[jobId_].whitelistWorkers == false ||
                        whitelistWorkers[jobId_][msg.sender],
                    "not whitelisted"
                );
            }
        }

        publishJobEvent(jobId_,
            JobEventData({
                type_: uint8(isOwner ? JobEventType.OwnerMessage : JobEventType.WorkerMessage),
                address_: abi.encodePacked(msg.sender),
                data_: abi.encodePacked(contentHash_),
                timestamp_: 0
            })
        );
    }

    /**
     * @notice The worker takes the job, i.e. is ready to start working on it. 
     *         The worker also cryptographically signs job parameters to prevent disputes about job specification.
     *         If this is FCFS job, the function may move money to the 
     * @param jobId_ id of the job
     * @param signature_ worker's signature of all the job parameters
     */
    function takeJob(uint256 jobId_, bytes calldata signature_) public {
        require(publicKeys[msg.sender].length > 0, "not registered");

        JobPost storage job = jobs[jobId_];

        require(job.state == uint8(JobState.Open), "not open");
        require(
            job.whitelistWorkers == false ||
                whitelistWorkers[jobId_][msg.sender],
            "not whitelisted"
        );

        bytes32 digest = keccak256(bytes.concat("\x19Ethereum Signed Message:\n32", keccak256(abi.encode(jobEvents[jobId_].length, jobId_))));
        require(ECDSA.recover(digest, signature_) == msg.sender, "invalid signature");

        publishJobEvent(jobId_,
            JobEventData({
                type_: uint8(JobEventType.Signed),
                address_: abi.encodePacked(msg.sender),
                data_: bytes.concat(abi.encodePacked(uint16(jobEvents[jobId_].length), abi.encodePacked(signature_))),
                timestamp_: 0
            })
        );

        if (!job.multipleApplicants) {
            job.state = uint8(JobState.Taken);
            job.roles.worker = msg.sender;

            Unicrow unicrow = Unicrow(unicrowAddress);

            IERC20 token = IERC20(job.token);
            token.approve(unicrowAddress, type(uint256).max);
            EscrowInput memory escrowInput = EscrowInput(
                msg.sender, // worker address
                unicrowMarketplaceAddress,
                unicrowMarketplaceFee,
                job.token,
                job.maxTime + _24_HRS,
                job.maxTime + _24_HRS,
                job.amount
            );

            job.escrowId = unicrow.pay(escrowInput, job.roles.arbitrator, arbitrators[job.roles.arbitrator].fee);

            publishJobEvent(jobId_,
                JobEventData({
                    type_: uint8(JobEventType.Taken),
                    address_: abi.encodePacked(msg.sender),
                    data_: abi.encodePacked(job.escrowId),
                    timestamp_: 0
                })
            );
        }
    }

    /**
     * @notice Pay for a job so that the it gets started.
     * @param jobId_ ID of the job
     * @param worker_ An address of the worker selected for the job
     */
    function payStartJob(uint256 jobId_, address worker_) public payable onlyJobCreator(jobId_) {
        JobPost storage job = jobs[jobId_];
        require(job.state == uint8(JobState.Open), "not open");
        require(publicKeys[worker_].length > 0, "not registered");

        job.state = uint8(JobState.Taken);
        job.roles.worker = worker_;

        Unicrow unicrow = Unicrow(unicrowAddress);

        IERC20 token = IERC20(job.token);
        token.approve(unicrowAddress, type(uint256).max);
        EscrowInput memory escrowInput = EscrowInput(
            worker_,
            unicrowMarketplaceAddress,
            unicrowMarketplaceFee,
            job.token,
            job.maxTime + _24_HRS,
            job.maxTime + _24_HRS,
            job.amount
        );

        job.escrowId = unicrow.pay(escrowInput, job.roles.arbitrator, arbitrators[job.roles.arbitrator].fee);

        publishJobEvent(jobId_,
            JobEventData({
                type_: uint8(JobEventType.Paid),
                address_: abi.encodePacked(worker_),
                data_: abi.encodePacked(job.escrowId),
                timestamp_: 0
            })
        );
    }

    //NOTE: perhaps this is redundant and might be handled by a message with a specific type
    /** 
     * @notice Information about the job delivery
     * @param jobId_ Id of the job
     * @param resultHash_ e.g. IPFS url or a tracking no.
    */
    function deliverResult(uint256 jobId_, bytes32 resultHash_) public onlyWorker(jobId_) {
        JobPost storage job = jobs[jobId_];

        job.resultHash = resultHash_;

        publishJobEvent(jobId_,
            JobEventData({
                type_: uint8(JobEventType.Delivered),
                address_: abi.encodePacked(msg.sender),
                data_: abi.encodePacked(resultHash_),
                timestamp_: 0
            })
        );
    }


    /**
     * @notice Buyer approves the result delivered by the seller, releases funds from the escrow, and optionally leaves a review.
     * @param reviewRating_ 1-5 (tbd) score of the worker. Set to 0 for no review
     * @param reviewText_ Optional review text. Empty string for no text
     */
    function approveResult(uint256 jobId_, uint8 reviewRating_, string calldata reviewText_) public onlyJobCreator(jobId_) {
        JobPost storage job = jobs[jobId_];

        require(job.state == uint8(JobState.Taken), "job in invalid state");

        Unicrow unicrow = Unicrow(unicrowAddress);

        unicrow.release(job.escrowId);

        job.state = uint8(JobState.Closed);

        if (reviewRating_ > 0) {
            review(jobId_, reviewRating_, reviewText_);
        }

        publishJobEvent(jobId_,
            JobEventData({
                type_: uint8(JobEventType.Closed),
                address_: bytes(""),
                data_: bytes(""),
                timestamp_: 0
            })
        );
    }

    function review(uint256 jobId_, uint8 reviewRating_, string calldata reviewText_) public onlyJobCreator(jobId_) {
        require(jobs[jobId_].rating == 0, "already rated");
        require(jobs[jobId_].state == uint8(JobState.Closed), "Job doesn't exist or not closed");
        require(reviewRating_ >= RATING_MIN && reviewRating_ <= RATING_MAX, "Invalid review score");
        require(bytes(reviewText_).length <= 100, "Review text too long");

        jobs[jobId_].rating = reviewRating_;
        UserRating storage rating = userRatings[jobs[jobId_].roles.worker];

        rating.averageRating = uint16((rating.averageRating * rating.numberOfReviews + reviewRating_ * 10000) / (rating.numberOfReviews + 1));
        rating.numberOfReviews++;

        publishJobEvent(jobId_,
            JobEventData({
                type_: uint8(JobEventType.Rated),
                address_: bytes(""),
                data_: bytes.concat(abi.encodePacked(reviewRating_), bytes(reviewText_)),
                timestamp_: 0
            })
        );
    }

    /**
     * @notice Worker refunds the buyer and switches the job back to non-started state
     */
    function _refund(uint256 jobId_, bool byWorker) internal {
        JobPost storage job = jobs[jobId_];
        require(job.state == uint8(JobState.Taken), "job in invalid state");

        Unicrow unicrow = Unicrow(unicrowAddress);

        unicrow.refund(job.escrowId);

        job.state = uint8(JobState.Open);

        // remove the worker from the whitelist
        if (byWorker) {
            address[] memory disallowedWorkers_ = new address[](1);
            disallowedWorkers_[0] = job.roles.worker;
            _updateJobWhitelist(jobId_, new address[](0), disallowedWorkers_);
        }

        job.roles.worker = address(0);

        publishJobEvent(jobId_,
            JobEventData({
                type_: uint8(JobEventType.Refunded),
                address_: bytes(""),
                data_: bytes(""),
                timestamp_: 0
            })
        );
    }

    /**
     * @notice Worker refunds the buyer and switches the job back to non-started state
     */
    function refund(uint256 jobId_) public onlyWorker(jobId_) {
        _refund(jobId_, true);
    }

    /**
     * @notice Raise a dispute with the arbitrator.
     * @notice If the buyer is calling the dispute, the function will challenge the payment on Unicrow.
     * @param sessionKey_ Encrypted session key for the arbitrator to decrypt owner's and worker's messages
     * @param content_ Encrypted short description for the arbitrator
     */
    function dispute(uint256 jobId_, bytes calldata sessionKey_, bytes calldata content_) public onlyCreatorOrWorker(jobId_) {
        JobPost storage job = jobs[jobId_];
        require(job.state == uint8(JobState.Taken), "job in invalid state");
        require(job.roles.arbitrator != address(0), "no arbitrator");

        require(job.disputed == false, "already disputed");
        job.disputed = true;

        if (msg.sender == job.roles.creator) {
            UnicrowDispute unicrowDispute = UnicrowDispute(unicrowDisputeAddress);

            unicrowDispute.challenge(job.escrowId);
        }

        publishJobEvent(jobId_,
            JobEventData({
                type_: uint8(JobEventType.Disputed),
                address_: abi.encodePacked(msg.sender),
                data_: bytes.concat(encodeBytes(sessionKey_), encodeBytes(content_)),
                timestamp_: 0
            })
        );
    }

    /**
     * @notice decide on a dispute about the job.
     * @param buyerShare_ how much of the payment should be refunded back to the buyer (in BPS)
     * @param workerShare_ how much of the payment should be released to the worker (in BPS)
     * @param reasonHash_ reason for arbitrator's decision (encrypted for all three parties)
     */
    function arbitrate(uint256 jobId_, uint16 buyerShare_, uint16 workerShare_, bytes32 reasonHash_) public onlyArbitrator(jobId_) {
        arbitrators[msg.sender].settledCount += 1;

        JobPost storage job = jobs[jobId_];
        require(job.state == uint8(JobState.Taken), "job in invalid state");
        require(job.disputed, "not disputed");
        job.state = uint8(JobState.Closed);

        UnicrowArbitrator unicrowArbitrator = UnicrowArbitrator(unicrowArbitratorAddress);

        // the arbitrate function checks that the shares equal 100%, otherwise throws an error
        // also it sends the shares to all the parties
        uint256[5] memory amounts = unicrowArbitrator.arbitrate(job.escrowId, [buyerShare_, workerShare_]);
        job.collateralOwed += amounts[0];

        publishJobEvent(jobId_,
            JobEventData({
                type_: uint8(JobEventType.Arbitrated),
                address_: abi.encodePacked(msg.sender),
                data_: abi.encodePacked(buyerShare_, amounts[0], workerShare_, amounts[1], reasonHash_),
                timestamp_: 0
            })
        );
    }

    /**
     * @notice If an arbitrator has been included in a job they're not comfortable with, they can remove themselves. 
     * @notice If the job has been started and paid into the escrow, the escrow will be fully refunded
     * TBD: we discussed that the in this case, the arbitrator fee should be refunded as well so t hat the arbitrator doesn't keep 
     *      funds from potentially illicit transactions. However, perhaps it might be better for the arbitrator to keep the fee to prevent spam? 
     *      More in Notion
     */
    function refuseArbitration(uint256 jobId_) public onlyArbitrator(jobId_) {
        JobPost storage job = jobs[jobId_];
        require(job.state != uint8(JobState.Closed), "job in invalid state");
        job.roles.arbitrator = address(0);

        arbitrators[msg.sender].refusedCount += 1;

        publishJobEvent(jobId_,
            JobEventData({
                type_: uint8(JobEventType.ArbitrationRefused),
                address_: bytes(""),
                data_: bytes(""),
                timestamp_: 0
            })
        );

        if (job.state == uint8(JobState.Taken)) {
            _refund(jobId_, false);
        }
    }
}