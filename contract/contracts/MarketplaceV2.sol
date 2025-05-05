// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {encodeString, encodeBytes, encodeStringArray} from "./libraries/Encoding.sol";

import "./unicrow/interfaces/IUnicrow.sol";
import "./unicrow/interfaces/IUnicrowDispute.sol";
import "./unicrow/interfaces/IUnicrowArbitrator.sol";
import "./MarketplaceDataV1.sol";

// import "hardhat/console.sol";

contract MarketplaceV2 is OwnableUpgradeable, PausableUpgradeable {
    MarketplaceDataV1 public marketplaceData; // address of helper contract which stores the marketplace data which is not jobs

    uint256 public version; // version (should be updated when performing updates)

    JobPost[] public jobs;

    // jobId -> address -> bool
    mapping(uint256 => mapping(address => bool)) public whitelistWorkers;

    address public unicrowAddress;
    address public unicrowDisputeAddress;
    address public unicrowArbitratorAddress;

    address public treasuryAddress;
    uint16 public unicrowMarketplaceFee;

    IERC20 public eaccToken; // v2
    address public eaccBar; // v2
    // token -> percent as 1eth
    mapping(address => uint256) public eaccRewardTokensEnabled; // v2
    // e.g. 10 eacc per usdt
    uint256 public eaccTokensPerToken; // v2

    uint256[37] __gap; // upgradeable gap

    modifier onlyJobCreator(uint256 jobId_) {
        require(jobs[jobId_].roles.creator == msg.sender, "not creator");
        _;
    }

    modifier onlyWorker(uint256 jobId_) {
        require(jobs[jobId_].roles.worker == msg.sender, "not worker");
        _;
    }

    modifier onlyCreatorOrWorker(uint256 jobId_) {
        require(
            jobs[jobId_].roles.creator == msg.sender ||
                jobs[jobId_].roles.worker == msg.sender,
            "not worker or creator"
        );
        _;
    }

    modifier onlyArbitrator(uint256 jobId_) {
        require(jobs[jobId_].roles.arbitrator == msg.sender, "not arbitrator");
        _;
    }

    event UnicrowAddressesChanged(
        address unicrowAddress,
        address unicrowDisputeAddress,
        address unicrowArbitratorAddress
    );
    event UnicrowMarketplaceFeeChanged(uint16 unicrowMarketplaceFee);
    event TreasuryAddressChanged(address treasuryAddress);

    event EACCRewardTokensEnabledChanged(address indexed token, uint256 amount); // v2
    event EACCRewardsDistributed(uint256 indexed jobId, address indexed worker, address indexed creator, uint256 rewardAmount); // v2


    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        //NOTE: do not put any state initialization here
        _disableInitializers();
    }

    /// @notice Initialize contract
    /// @dev For upgradeable contracts this function necessary
    /// @param eaccToken_ Address of EACCToken
    /// @param eaccBar_ Address of EACCBar
    /// @param eaccTokensPerToken_ How many EACC tokens per token
    function initialize(
        IERC20 eaccToken_,
        address eaccBar_,
        uint256 eaccTokensPerToken_
    ) public reinitializer(2) {
        eaccToken = eaccToken_;
        eaccBar = eaccBar_;
        eaccTokensPerToken = eaccTokensPerToken_;
    }

    // v2
    function setEACCRewardTokensEnabled(
        address token_,
        uint256 reward_
    ) external onlyOwner {
        eaccRewardTokensEnabled[token_] = reward_;
        emit EACCRewardTokensEnabledChanged(token_, reward_);
    }

    function setUnicrowMarketplaceFee(
        uint16 unicrowMarketplaceFee_
    ) public onlyOwner {
        unicrowMarketplaceFee = unicrowMarketplaceFee_;
        emit UnicrowMarketplaceFeeChanged(unicrowMarketplaceFee_);
    }

    /// @notice Transfer ownership
    /// @param to_ Address to transfer ownership to
    function transferOwnership(
        address to_
    ) public override(OwnableUpgradeable) onlyOwner {
        super.transferOwnership(to_);
    }

    /// @notice Pauses contract
    function pause() external onlyOwner {
        _pause();
    }

    /// @notice Unpauses contract
    function unpause() external onlyOwner {
        _unpause();
    }

    function setTreasuryAddress(address treasuryAddress_) public onlyOwner {
        treasuryAddress = treasuryAddress_;
        emit TreasuryAddressChanged(treasuryAddress_);
    }

    function updateUnicrowAddresses(
        address unicrowAddress_,
        address unicrowDisputeAddress_,
        address unicrowArbitratorAddress_
    ) public onlyOwner {
        unicrowAddress = unicrowAddress_;
        unicrowDisputeAddress = unicrowDisputeAddress_;
        unicrowArbitratorAddress = unicrowArbitratorAddress_;

        emit UnicrowAddressesChanged(
            unicrowAddress_,
            unicrowDisputeAddress_,
            unicrowArbitratorAddress_
        );
    }

    function jobsLength() public view returns (uint256) {
        return jobs.length;
    }

    function getJob(uint256 jobId_) public view returns (JobPost memory) {
        return jobs[jobId_];
    }

    function publishJobEvent(
        uint256 jobId_,
        JobEventData memory event_
    ) internal {
        marketplaceData.publishJobEvent(jobId_, event_);
    }

    function checkParams(
        string memory title_,
        string[] memory tags_,
        uint256 amount_,
        address arbitrator_,
        address creator_
    ) internal view {
        uint256 titleLength = bytes(title_).length;
        require(
            titleLength > 0 && titleLength < 255,
            "title too short or long"
        );
        require(amount_ > 0, "amount must be greater than 0");
        require(tags_.length > 0, "At least one tag is required");
        if (arbitrator_ != address(0)) {
            require(
                marketplaceData.arbitratorRegistered(arbitrator_),
                "arbitrator not registered"
            );
            require(
                arbitrator_ != creator_,
                "arbitrator and job creator can not be the same person"
            );
        }

        uint meceCount = 0;

        // Check for exactly one MECE tag
        for (uint8 i = 0; i < tags_.length; i++) {
            if (bytes(marketplaceData.meceTags(tags_[i])).length != 0) {
                meceCount++;
                if (meceCount > 1) {
                    revert("Only one MECE tag is allowed");
                }
            }
        }

        require(meceCount == 1, "Exactly one MECE tag is required");
    }

    /**
     * @notice Publish a new job post
     * @notice To assign the job to a specific worker, set multipleApplicants_ to false and add the worker to the allowedWorkers_. In such a case, title and description can be encrypted for the worker
     * @notice The function will request a collateral deposit in the amount_ and token_ from the caller.
     * @notice Great care should be taken both by job creator and worker accepting the job to verify that the reward token does not have side effects, e.g. those of rebasing tokens. This can cause locked funds problem or lack of liquidity problem due to discrepancy in marketplace contract's state (stored amounts) and token contract's state (actual balance).
     * @notice This contract does not try to solve the potential problem of job creator and arbitrator colluding to profit from the worker. Platform users bare the responsibility of choosing the arbitrators and working with them.
     * @notice Maintaining a whitelist of trusted tokens and/or arbitrators does not appear to be a solution for two possible problems mentioned above for this marketplace, as it would empair the freedom of choice of the platform users and would require further maintenance work from contract owner/governing group.
     * @param title_ job title - must be not null
     * @param contentHash_ short job description published on IPFS
     * @param multipleApplicants_ do you want to select from multiple applicants or let the first one take the job?
     * @param tags_ labels to help the workers search for the job. Each job must have exactly one of the labels listed above, and any number of other labels
     * @param token_ token in which you prefer to pay the job with - must be a valid ERC20 token, e.g. WETH
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
    ) public whenNotPaused returns (uint256) {
        checkParams(title_, tags_, amount_, arbitrator_, msg.sender);

        require(
            token_.code.length > 0 && IERC20(token_).balanceOf(msg.sender) > 0,
            "invalid token"
        );
        SafeERC20.forceApprove(
            IERC20(token_),
            address(this),
            type(uint256).max
        );

        uint256 deliveyMethodLength = bytes(deliveryMethod_).length;
        require(
            deliveyMethodLength > 0 && deliveyMethodLength < 255,
            "delivery method too short or long"
        );
        require(marketplaceData.userRegistered(msg.sender), "not registered");

        SafeERC20.safeTransferFrom(
            IERC20(token_),
            msg.sender,
            address(this),
            amount_
        );

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
        jobPost.timestamp = uint32(block.timestamp);
        jobPost.maxTime = maxTime_;
        jobPost.deliveryMethod = deliveryMethod_;
        jobPost.roles.arbitrator = arbitrator_;
        // jobPost.roles.worker = address(0); // will be zero anyway

        publishJobEvent(
            jobId,
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
                    abi.encodePacked(jobPost.whitelistWorkers) // whitelisted addresses will come in following notifications
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
    ) public whenNotPaused onlyJobCreator(jobId_) {
        require(jobs[jobId_].state == uint8(JobState.Open), "not open");

        checkParams(
            title_,
            tags_,
            amount_,
            arbitrator_,
            jobs[jobId_].roles.creator
        );

        JobPost storage job = jobs[jobId_];

        if (job.amount != amount_) {
            if (amount_ > job.amount) {
                uint256 difference = amount_ - job.amount;
                require(
                    difference >= job.collateralOwed,
                    "Invalid collateral-adjusted amount increase"
                );

                SafeERC20.safeTransferFrom(
                    IERC20(job.token),
                    msg.sender,
                    address(this),
                    difference - job.collateralOwed
                );
                job.collateralOwed = 0; // Clear the collateral record
            } else {
                uint256 difference = job.amount - amount_;
                if (block.timestamp >= job.timestamp + _24_HRS) {
                    SafeERC20.safeTransfer(
                        IERC20(job.token),
                        msg.sender,
                        difference + job.collateralOwed
                    );
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
            jobs[jobId_].tags = tags_;
        }
        {
            jobs[jobId_].whitelistWorkers = whitelistWorkers_;
            jobs[jobId_].maxTime = uint32(maxTime_);
        }

        {
            jobs[jobId_].roles.arbitrator = arbitrator_;
        }

        publishJobEvent(
            jobId_,
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
    ) public whenNotPaused onlyJobCreator(jobId_) {
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

            publishJobEvent(
                jobId_,
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

            publishJobEvent(
                jobId_,
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
    function closeJob(
        uint256 jobId_
    ) public whenNotPaused onlyJobCreator(jobId_) {
        require(jobs[jobId_].state == uint8(JobState.Open), "not open");
        JobPost storage job = jobs[jobId_];
        job.state = uint8(JobState.Closed);

        if (block.timestamp >= job.timestamp + _24_HRS) {
            uint256 amount = job.amount + job.collateralOwed;
            job.collateralOwed = 0; // Clear the collateral record
            SafeERC20.safeTransfer(
                IERC20(job.token),
                job.roles.creator,
                amount
            );
        } else {
            job.collateralOwed += job.amount;
        }

        publishJobEvent(
            jobId_,
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
    function withdrawCollateral(uint256 jobId_) public whenNotPaused {
        // check if the job is closed
        require(jobs[jobId_].state == uint8(JobState.Closed), "not closed");

        JobPost storage job = jobs[jobId_];
        require(
            block.timestamp >= job.timestamp + _24_HRS,
            "24 hours have not passed yet"
        );
        require(job.collateralOwed > 0, "No collateral to withdraw");

        uint256 amount = job.collateralOwed;
        SafeERC20.safeTransfer(IERC20(job.token), job.roles.creator, amount);
        job.collateralOwed = 0; // Reset the owed amount

        publishJobEvent(
            jobId_,
            JobEventData({
                type_: uint8(JobEventType.CollateralWithdrawn),
                address_: bytes(""),
                data_: bytes(""),
                timestamp_: 0
            })
        );
    }

    function reopenJob(
        uint256 jobId_
    ) public whenNotPaused onlyJobCreator(jobId_) {
        JobPost storage job = jobs[jobId_];

        require(job.state == uint8(JobState.Closed), "not closed");

        if (job.collateralOwed < job.amount) {
            SafeERC20.safeTransferFrom(
                IERC20(job.token),
                msg.sender,
                address(this),
                job.amount - job.collateralOwed
            );
            job.collateralOwed = 0;
        } else {
            job.collateralOwed -= job.amount;
        }

        job.state = uint8(JobState.Open);
        job.resultHash = 0;
        job.timestamp = uint32(block.timestamp);

        publishJobEvent(
            jobId_,
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
        bytes32 contentHash_,
        address recipient
    ) public whenNotPaused {
        require(jobs[jobId_].state != uint8(JobState.Closed), "job closed");
        require(msg.sender != recipient, "can't message yourself");

        bool isOwner = jobs[jobId_].roles.creator == msg.sender;
        if (!isOwner) {
            require(
                marketplaceData.userRegistered(msg.sender),
                "not registered"
            );

            if (jobs[jobId_].state == uint8(JobState.Taken)) {
                // only assigned workers can message on the job if it is taken
                require(
                    jobs[jobId_].roles.worker == msg.sender,
                    "taken/not worker"
                );
            } else {
                require(
                    // only whitelisted workers can message on the job if it is open
                    jobs[jobId_].whitelistWorkers == false ||
                        whitelistWorkers[jobId_][msg.sender],
                    "not whitelisted"
                );
            }

            // override any possibly-invalid recipient if the message is from the worker
            recipient = jobs[jobId_].roles.creator;
        } else {
            // restrict messaging only to registered users
            require(
                marketplaceData.userRegistered(recipient),
                "not registered"
            );
        }

        publishJobEvent(
            jobId_,
            JobEventData({
                type_: uint8(
                    isOwner
                        ? JobEventType.OwnerMessage
                        : JobEventType.WorkerMessage
                ),
                address_: abi.encodePacked(msg.sender),
                data_: abi.encodePacked(contentHash_, recipient),
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
    function takeJob(
        uint256 jobId_,
        bytes calldata signature_
    ) public whenNotPaused {
        require(marketplaceData.userRegistered(msg.sender), "not registered");
        require(
            msg.sender != jobs[jobId_].roles.creator,
            "worker and job creator can not be the same person"
        );
        require(
            msg.sender != jobs[jobId_].roles.arbitrator,
            "worker and arbitrator can not be the same person"
        );
        uint256 eventsLength = marketplaceData.eventsLength(jobId_);

        JobPost storage job = jobs[jobId_];

        require(job.state == uint8(JobState.Open), "not open");
        require(
            job.whitelistWorkers == false ||
                whitelistWorkers[jobId_][msg.sender],
            "not whitelisted"
        );

        bytes32 digest = keccak256(
            bytes.concat(
                "\x19Ethereum Signed Message:\n32",
                keccak256(abi.encode(eventsLength, jobId_))
            )
        );
        require(
            ECDSA.recover(digest, signature_) == msg.sender,
            "invalid signature"
        );

        publishJobEvent(
            jobId_,
            JobEventData({
                type_: uint8(JobEventType.Signed),
                address_: abi.encodePacked(msg.sender),
                data_: bytes.concat(
                    abi.encodePacked(
                        uint16(eventsLength),
                        abi.encodePacked(signature_)
                    )
                ),
                timestamp_: 0
            })
        );

        if (!job.multipleApplicants) {
            job.state = uint8(JobState.Taken);
            job.roles.worker = msg.sender;

            IUnicrow unicrow = IUnicrow(unicrowAddress);

            IERC20 token = IERC20(job.token);
            SafeERC20.forceApprove(
                IERC20(token),
                unicrowAddress,
                type(uint256).max
            );
            EscrowInput memory escrowInput = EscrowInput(
                address(this), // owner address
                msg.sender, // worker address
                treasuryAddress,
                unicrowMarketplaceFee,
                job.token,
                job.maxTime + _24_HRS,
                job.maxTime + _24_HRS,
                job.amount,
                string(abi.encodePacked("EACC #", jobId_))
            );

            job.escrowId = unicrow.pay(
                address(this),
                escrowInput,
                job.roles.arbitrator,
                marketplaceData.getArbitratorFee(job.roles.arbitrator)
            );

            publishJobEvent(
                jobId_,
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
    function payStartJob(
        uint256 jobId_,
        address worker_
    ) public payable whenNotPaused onlyJobCreator(jobId_) {
        JobPost storage job = jobs[jobId_];
        require(job.state == uint8(JobState.Open), "not open");
        require(marketplaceData.userRegistered(worker_), "not registered");
        require(
            worker_ != jobs[jobId_].roles.creator,
            "worker and job creator can not be the same person"
        );
        require(
            worker_ != jobs[jobId_].roles.arbitrator,
            "worker and arbitrator can not be the same person"
        );

        job.state = uint8(JobState.Taken);
        job.roles.worker = worker_;

        IUnicrow unicrow = IUnicrow(unicrowAddress);

        IERC20 token = IERC20(job.token);
        SafeERC20.forceApprove(
            IERC20(token),
            address(unicrowAddress),
            type(uint256).max
        );
        EscrowInput memory escrowInput = EscrowInput(
            address(this), // owner address
            worker_, // worker address
            treasuryAddress,
            unicrowMarketplaceFee,
            job.token,
            job.maxTime + _24_HRS,
            job.maxTime + _24_HRS,
            job.amount,
            string(abi.encodePacked("EACC #", jobId_))
        );

        job.escrowId = unicrow.pay(
            address(this),
            escrowInput,
            job.roles.arbitrator,
            marketplaceData.getArbitratorFee(job.roles.arbitrator)
        );

        publishJobEvent(
            jobId_,
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
    function deliverResult(
        uint256 jobId_,
        bytes32 resultHash_
    ) public whenNotPaused onlyWorker(jobId_) {
        JobPost storage job = jobs[jobId_];

        job.resultHash = resultHash_;

        publishJobEvent(
            jobId_,
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
    function approveResult(
        uint256 jobId_,
        uint8 reviewRating_,
        string calldata reviewText_
    ) public whenNotPaused onlyJobCreator(jobId_) {
        JobPost storage job = jobs[jobId_];

        require(job.state == uint8(JobState.Taken), "job in invalid state");

        IUnicrow unicrow = IUnicrow(unicrowAddress);

        unicrow.release(job.escrowId);

        job.state = uint8(JobState.Closed);

        if (reviewRating_ > 0) {
            review(jobId_, reviewRating_, reviewText_);
        }

        marketplaceData.userDelivered(job.roles.worker);

        publishJobEvent(
            jobId_,
            JobEventData({
                type_: uint8(JobEventType.Completed),
                address_: bytes(""),
                data_: bytes(""),
                timestamp_: 0
            })
        );

        // v2
        if (eaccRewardTokensEnabled[job.token] > 0) {
            uint256 reward = (job.amount *
                eaccRewardTokensEnabled[job.token]) /
                1 ether * eaccTokensPerToken / 1 ether;

            if (eaccToken.balanceOf(address(this)) >= reward*3) {
                eaccToken.transfer(job.roles.worker, reward);
                eaccToken.transfer(job.roles.creator, reward);
                eaccToken.transfer(eaccBar, reward);

                emit EACCRewardsDistributed(
                    jobId_,
                    job.roles.worker,
                    job.roles.creator,
                    reward
                );
            }
        }
    }

    function review(
        uint256 jobId_,
        uint8 reviewRating_,
        string calldata reviewText_
    ) public whenNotPaused onlyJobCreator(jobId_) {
        require(jobs[jobId_].rating == 0, "already rated");
        require(
            jobs[jobId_].state == uint8(JobState.Closed),
            "Job doesn't exist or not closed"
        );
        require(bytes(reviewText_).length <= 100, "Review text too long");

        jobs[jobId_].rating = reviewRating_;
        marketplaceData.updateUserRating(
            jobs[jobId_].roles.worker,
            reviewRating_
        );

        marketplaceData.addReview(
            jobs[jobId_].roles.worker,
            msg.sender,
            jobId_,
            reviewRating_,
            reviewText_
        );

        publishJobEvent(
            jobId_,
            JobEventData({
                type_: uint8(JobEventType.Rated),
                address_: bytes(""),
                data_: bytes.concat(
                    abi.encodePacked(reviewRating_),
                    bytes(reviewText_)
                ),
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
        job.disputed = false;

        IUnicrow unicrow = IUnicrow(unicrowAddress);

        unicrow.refund(job.escrowId);

        job.state = uint8(JobState.Open);
        job.escrowId = 0;

        // remove the worker from the whitelist
        if (byWorker) {
            marketplaceData.userRefunded(job.roles.worker);

            address[] memory disallowedWorkers_ = new address[](1);
            disallowedWorkers_[0] = job.roles.worker;
            _updateJobWhitelist(jobId_, new address[](0), disallowedWorkers_);
        }

        publishJobEvent(
            jobId_,
            JobEventData({
                type_: uint8(JobEventType.Refunded),
                address_: byWorker
                    ? abi.encodePacked(job.roles.worker)
                    : abi.encodePacked(job.roles.arbitrator),
                data_: bytes(""),
                timestamp_: 0
            })
        );

        job.roles.worker = address(0);
    }

    /**
     * @notice Worker refunds the buyer and switches the job back to non-started state
     */
    function refund(uint256 jobId_) public whenNotPaused onlyWorker(jobId_) {
        _refund(jobId_, true);
    }

    /**
     * @notice Raise a dispute with the arbitrator.
     * @notice If the buyer is calling the dispute, the function will challenge the payment on Unicrow.
     * @param sessionKey_ Encrypted session key for the arbitrator to decrypt owner's and worker's messages
     * @param content_ Encrypted short description for the arbitrator, encrypted with owner-worker session key
     */
    function dispute(
        uint256 jobId_,
        bytes calldata sessionKey_,
        bytes calldata content_
    ) public whenNotPaused onlyCreatorOrWorker(jobId_) {
        JobPost storage job = jobs[jobId_];
        require(job.state == uint8(JobState.Taken), "job in invalid state");
        require(job.roles.arbitrator != address(0), "no arbitrator");

        require(job.disputed == false, "already disputed");
        job.disputed = true;

        if (msg.sender == job.roles.creator) {
            IUnicrowDispute unicrowDispute = IUnicrowDispute(
                unicrowDisputeAddress
            );

            unicrowDispute.challenge(job.escrowId);
        }

        publishJobEvent(
            jobId_,
            JobEventData({
                type_: uint8(JobEventType.Disputed),
                address_: abi.encodePacked(msg.sender),
                data_: bytes.concat(
                    encodeBytes(sessionKey_),
                    encodeBytes(content_)
                ),
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
    function arbitrate(
        uint256 jobId_,
        uint16 buyerShare_,
        uint16 workerShare_,
        bytes32 reasonHash_
    ) public whenNotPaused onlyArbitrator(jobId_) {
        marketplaceData.arbitratorSettled(msg.sender);

        JobPost storage job = jobs[jobId_];
        require(job.state == uint8(JobState.Taken), "job in invalid state");
        require(job.disputed, "not disputed");
        job.disputed = false;
        job.state = uint8(JobState.Closed);

        IUnicrowArbitrator unicrowArbitrator = IUnicrowArbitrator(
            unicrowArbitratorAddress
        );

        // the arbitrate function checks that the shares equal 100%, otherwise throws an error
        // also it sends the shares to all the parties
        uint256[5] memory amounts = unicrowArbitrator.arbitrate(
            job.escrowId,
            [buyerShare_, workerShare_]
        );
        job.collateralOwed += amounts[0];

        publishJobEvent(
            jobId_,
            JobEventData({
                type_: uint8(JobEventType.Arbitrated),
                address_: bytes(""),
                data_: abi.encodePacked(
                    buyerShare_,
                    amounts[0],
                    workerShare_,
                    amounts[1],
                    reasonHash_,
                    job.roles.worker,
                    amounts[4]
                ),
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
    function refuseArbitration(
        uint256 jobId_
    ) public whenNotPaused onlyArbitrator(jobId_) {
        JobPost storage job = jobs[jobId_];
        require(job.state != uint8(JobState.Closed), "job in invalid state");

        marketplaceData.arbitratorRefused(msg.sender);

        publishJobEvent(
            jobId_,
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
        job.roles.arbitrator = address(0);
    }
}
