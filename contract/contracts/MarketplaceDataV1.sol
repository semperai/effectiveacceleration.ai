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
    string bio;
    string avatar;
    uint16 fee;
    uint16 settledCount;
    uint16 refusedCount;
}

struct User {
    bytes publicKey;
    string name;
    string bio;
    string avatar;
    uint16 reputationUp;
    uint16 reputationDown;
}

/// @dev Stores current average user's rating and number of reviews so it can be updated with every new review
struct UserRating {
    /// @dev Current rating multiplied by 10,000 to achieve sufficient granularity even with lots of existing reviews
    uint16 averageRating;
    uint256 numberOfReviews;
}

struct Review {
    address reviewer;
    uint256 jobId;
    uint8 rating;
    string text;
    uint32 timestamp;
}

contract MarketplaceDataV1 is OwnableUpgradeable {
    event JobEvent(uint256 indexed jobId, JobEventData eventData);
    event PublicKeyRegistered(address indexed addr, bytes pubkey);
    event UserRegistered(address indexed addr, bytes pubkey, string name, string bio, string avatar);
    event UserUpdated(address indexed addr, string name, string bio, string avatar);
    event ArbitratorRegistered(address indexed addr, bytes pubkey, string name, string bio, string avatar, uint16 fee);
    event ArbitratorUpdated(address indexed addr, string name, string bio, string avatar);

    MarketplaceV1 public marketplace;

    // jobId -> JobEvents
    mapping(uint256 => JobEventData[]) public jobEvents;

    // users must register their public keys (compressed, 33 bytes)
    // this allows others to guarantee they can message securely
    mapping(address => User) public users;
    address[] public userAddresses;

    mapping(address => JobArbitrator) public arbitrators;
    address[] public arbitratorAddresses;

    // Current average rating and number of ratings for each user
    mapping(address => UserRating) public userRatings;

    mapping(address => Review[]) public userReviews;

    mapping(string => string) public meceTags;

    uint256[41] __gap; // upgradeable gap

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

        meceTags["DA"] = "DIGITAL_AUDIO";
        meceTags["DV"] = "DIGIAL_VIDEO";
        meceTags["DT"] = "DIGITAL_TEXT";
        meceTags["DS"] = "DIGITAL_SOFTWARE";
        meceTags["DO"] = "DIGITAL_OTHERS";
        meceTags["NDG"] = "NON_DIGITAL_GOODS";
        meceTags["NDS"] = "NON_DIGITAL_SERVICES";
        meceTags["NDO"] = "NON_DIGITAL_OTHERS";
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

    function checkUserParams(string calldata name_, string calldata bio_, string calldata avatar_) internal {
        require(bytes(name_).length > 0 && bytes(name_).length < 20, "name too short or long");
        require(bytes(bio_).length < 255, "bio too long");
        require(bytes(avatar_).length < 100, "avatar too long");
    }

    // allow users to register their *message encryption* public key
    // this is used to allow others to message you securely
    // we do not do verification here because we want to allow contracts to register
    function registerUser(bytes calldata pubkey_, string calldata name_, string calldata bio_, string calldata avatar_) public {
        // presently we do not allow to update the public keys otherwise the decryption of old messages will become impossible
        require(users[msg.sender].publicKey.length == 0, "already registered");
        require(pubkey_.length == 33, "invalid pubkey length, must be compressed, 33 bytes");
        checkUserParams(name_, bio_, avatar_);
        users[msg.sender] = User(
            pubkey_,
            name_,
            bio_,
            avatar_,
            0,
            0
        );

        userAddresses.push(msg.sender);

        emit UserRegistered(msg.sender, pubkey_, name_, bio_, avatar_);
    }

    function updateUser(string calldata name_, string calldata bio_, string calldata avatar_) public {
        require(users[msg.sender].publicKey.length > 0, "not registered");
        checkUserParams(name_, bio_, avatar_);

        users[msg.sender].name = name_;
        users[msg.sender].bio = bio_;
        users[msg.sender].avatar = avatar_;

        emit UserUpdated(msg.sender, name_, bio_, avatar_);
    }

    function userRegistered(address address_) public view returns (bool) {
        return users[address_].publicKey.length > 0;
    }

    function userRefunded(address address_) public onlyMarketplace() {
        users[address_].reputationDown += 1;
    }

    function userDelivered(address address_) public onlyMarketplace() {
        users[address_].reputationUp += 1;
    }

    function usersLength() public view returns (uint256) {
        return userAddresses.length;
    }

    function getUsers(uint256 index_, uint256 limit_) public view returns (User[] memory) {
        uint256 usersLength_ = userAddresses.length;
        require(index_ < usersLength_, "index out of bounds");

        uint length = usersLength_ - index_;
        if (limit_ == 0) {
            limit_ = length;
        }
        length = length > limit_ ? limit_ : length;
        User[] memory result = new User[](length);
        for (uint i = 0; i < length; i++) {
            result[i] = users[userAddresses[i + index_]];
        }
        return result;
    }

    function publicKeys(address userAddress_) public view returns (bytes memory) {
        return users[userAddress_].publicKey;
    }

    function getUser(address userAddress_) public view returns (User memory) {
        return users[userAddress_];
    }

    // registers an arbitrator with their *message encryption* public key, name and fee they charge
    function registerArbitrator(bytes calldata pubkey_, string calldata name_, string calldata bio_, string calldata avatar_, uint16 fee_) public {
        // presently we do not allow to update the public keys otherwise the decryption of old messages will become impossible
        require(arbitrators[msg.sender].publicKey.length == 0, "already registered");
        require(pubkey_.length == 33, "invalid pubkey length, must be compressed, 33 bytes");
        checkUserParams(name_, bio_, avatar_);
        arbitrators[msg.sender] = JobArbitrator(
            pubkey_,
            name_,
            bio_,
            avatar_,
            fee_,
            0,
            0
        );

        arbitratorAddresses.push(msg.sender);

        emit ArbitratorRegistered(msg.sender, pubkey_, name_, bio_, avatar_, fee_);
    }

    function updateArbitrator(string calldata name_, string calldata bio_, string calldata avatar_) public {
        require(arbitrators[msg.sender].publicKey.length > 0, "not registered");
        checkUserParams(name_, bio_, avatar_);

        arbitrators[msg.sender].name = name_;
        arbitrators[msg.sender].bio = bio_;
        arbitrators[msg.sender].avatar = avatar_;

        emit ArbitratorUpdated(msg.sender, name_, bio_, avatar_);
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

    function addReview(address target_, address reviewer_, uint256 jobId_, uint8 rating_, string memory text_) public onlyMarketplace {
        userReviews[target_].push(Review({
            reviewer: reviewer_,
            jobId: jobId_,
            rating: rating_,
            text: text_,
            timestamp: uint32(block.timestamp)
        }));
    }

    function getReviews(address target_, uint256 index_, uint256 limit_) public view returns (Review[] memory) {
        uint256 reviewsLength_ = userReviews[target_].length;
        require(index_ < reviewsLength_, "index out of bounds");

        uint length = reviewsLength_ - index_;
        if (limit_ == 0) {
            limit_ = length;
        }
        length = length > limit_ ? limit_ : length;
        Review[] memory result = new Review[](length);
        for (uint i = 0; i < length; i++) {
            result[i] = userReviews[target_][i + index_];
        }

        return result;
    }
}
