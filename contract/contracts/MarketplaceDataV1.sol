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

contract MarketplaceDataV1 is OwnableUpgradeable {
    event JobEvent(uint256 indexed jobId, JobEventData eventData);

    MarketplaceV1 public marketplace;

    // jobId -> JobEvents
    mapping(uint256 => JobEventData[]) public jobEvents;

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

    function publishJobEvent(uint256 jobId_, JobEventData memory event_) public {
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

    function arbitratorsLength() public view returns (uint256) {
        return marketplace.arbitratorsLength();
    }

    function getArbitrators(uint256 index_, uint256 limit_) public view returns (JobArbitrator[] memory) {
        uint256 arbitratorsLength_ = marketplace.arbitratorsLength();
        require(index_ < arbitratorsLength_, "index out of bounds");

        uint length = arbitratorsLength_ - index_;
        if (limit_ == 0) {
            limit_ = length;
        }
        length = length > limit_ ? limit_ : length;
        JobArbitrator[] memory result = new JobArbitrator[](length);
        for (uint i = 0; i < length; i++) {
            (bytes memory publicKey, string memory name, uint16 fee, uint16 settledCount, uint16 refusedCount) = marketplace.arbitrators(marketplace.arbitratorAddresses(i + index_));
            result[i] = JobArbitrator({
                publicKey: publicKey,
                name: name,
                fee: fee,
                settledCount: settledCount,
                refusedCount: refusedCount
            });
        }
        return result;
    }

    function getArbitrator(address arbitratorAddress_) public view returns (JobArbitrator memory) {
        (bytes memory publicKey, string memory name, uint16 fee, uint16 settledCount, uint16 refusedCount) = marketplace.arbitrators(arbitratorAddress_);
        return JobArbitrator({
            publicKey: publicKey,
            name: name,
            fee: fee,
            settledCount: settledCount,
            refusedCount: refusedCount
        });
    }
}