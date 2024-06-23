// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./MarketplaceV1.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";

struct JobEventData {
    uint8 type_;      // 1 byte / type of object
    bytes address_;   // empty or context dependent address data, either who sent it or whom it targets
    bytes data_;      // extra event data, e.g. 34 bytes for CID
    uint32 timestamp_; // 4 bytes
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

contract MarketplaceDataV1 is OwnableUpgradeable {
    event JobEvent(uint256 indexed jobId, JobEventData eventData);
    event PublicKeyRegistered(address indexed addr, bytes pubkey);
    event ArbitratorRegistered(address indexed addr, bytes pubkey, string name, uint16 fee);

    MarketplaceV1 public marketplace;

    // jobId -> JobEvents
    mapping(uint256 => JobEventData[]) public jobEvents;

    // users must register their public keys (compressed, 33 bytes)
    // this allows others to guarantee they can message securely
    mapping(address => bytes) public publicKeys;

    mapping(address => JobArbitrator) public arbitrators;
    address[] public arbitratorAddresses;

    // Current average rating and number of ratings for each user
    mapping(address => UserRating) public userRatings;

    modifier onlyMarketplace() {
        require(msg.sender == address(marketplace), "not marketplace");
        _;
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        //NOTE: do not put any state initialization here
        _disableInitializers();
    }

    /// @notice Initialize contract
    /// @dev For upgradeable contracts this function necessary
    /// @param marketplace_ Address of marketplace
    function initialize(
            address marketplace_
        ) public initializer {
        __Ownable_init(msg.sender);

        marketplace = MarketplaceV1(marketplace_);
    }

    function publishJobEvent(uint256 jobId_, JobEventData memory event_) public onlyMarketplace {
        event_.timestamp_ = uint32(block.timestamp);
        jobEvents[jobId_].push(event_);
        emit JobEvent(jobId_, event_);
    }

    function eventsLength(uint256 jobId_) public view returns (uint256) {
        return jobEvents[jobId_].length;
    }

    function jobsLength() public view returns (uint256) {
        return marketplace.jobsLength();
    }

    function getJobs(uint256 index_, uint256 limit_) public view returns (JobPost[] memory) {
        uint256 jobsLength_ = marketplace.jobsLength();
        require(index_ < jobsLength_, "index out of bounds");

        uint length = jobsLength_ - index_;
        if (limit_ == 0) {
            limit_ = length;
        }
        length = length > limit_ ? limit_ : length;
        JobPost[] memory result = new JobPost[](length);
        for (uint i = 0; i < length; i++) {
            result[i] = marketplace.getJob(i + index_);
        }

        return result;
    }

    function getJob(uint256 jobId_) public view returns (JobPost memory) {
        return marketplace.getJob(jobId_);
    }

    // Function to get past job events starting from a specific index
    function getEvents(uint256 jobId_, uint256 index_, uint256 limit_) public view returns (JobEventData[] memory) {
        uint256 eventsLength_ = jobEvents[jobId_].length;
        require(index_ < eventsLength_, "index out of bounds");

        uint length = eventsLength_ - index_;
        if (limit_ == 0) {
            limit_ = length;
        }
        length = length > limit_ ? limit_ : length;
        JobEventData[] memory result = new JobEventData[](length);
        for (uint i = 0; i < length; i++) {
            result[i] = jobEvents[jobId_][i + index_];
        }

        return result;
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

    function publicKeyRegistered(address address_) public view returns (bool) {
        return publicKeys[address_].length > 0;
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

    function arbitratorRefused(address address_) public onlyMarketplace() {
        arbitrators[address_].refusedCount += 1;
    }

    function arbitratorSettled(address address_) public onlyMarketplace() {
        arbitrators[address_].settledCount += 1;
    }

    function arbitratorRegistered(address address_) public view returns (bool) {
        return arbitrators[address_].publicKey.length > 0;
    }

    function getArbitratorFee(address address_) public view returns (uint16) {
        return arbitrators[address_].fee;
    }

    function arbitratorsLength() public view returns (uint256) {
        return arbitratorAddresses.length;
    }

    function getArbitrators(uint256 index_, uint256 limit_) public view returns (JobArbitrator[] memory) {
        uint256 arbitratorsLength_ = arbitratorAddresses.length;
        require(index_ < arbitratorsLength_, "index out of bounds");

        uint length = arbitratorsLength_ - index_;
        if (limit_ == 0) {
            limit_ = length;
        }
        length = length > limit_ ? limit_ : length;
        JobArbitrator[] memory result = new JobArbitrator[](length);
        for (uint i = 0; i < length; i++) {
            result[i] = arbitrators[arbitratorAddresses[i + index_]];
        }
        return result;
    }

    function getArbitrator(address arbitratorAddress_) public view returns (JobArbitrator memory) {
        return arbitrators[arbitratorAddress_];
    }

    function updateUserRating(address userAddress_, uint8 reviewRating_) public onlyMarketplace() {
        UserRating storage rating = userRatings[userAddress_];

        rating.averageRating = uint16((rating.averageRating * rating.numberOfReviews + reviewRating_ * 10000) / (rating.numberOfReviews + 1));
        rating.numberOfReviews++;
    }
}