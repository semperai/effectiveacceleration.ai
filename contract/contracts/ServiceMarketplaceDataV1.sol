// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";

struct ServiceEventData {
    uint8 type_;
    bytes address_;
    bytes data_;
    uint32 timestamp_;
}

enum ServiceEventType {
    // Service Events
    ServiceCreated,
    ServiceUpdated,
    ServicePaused,
    ServiceActivated,
    ServiceDeleted,

    // Order Events
    OrderCreated,
    OrderStarted,
    OrderDelivered,
    OrderCompleted,
    OrderCancelled,
    OrderRefunded,
    OrderDisputed,
    OrderArbitrated,
    ArbitrationRefused,
    OrderBuyerMessage,
    OrderSellerMessage
}

struct ServiceRating {
    uint16 averageRating;  // Scaled by 10000
    uint256 numberOfRatings;
}

struct ServiceReview {
    address reviewer;
    uint256 orderId;
    uint8 rating;
    string text;
    uint32 timestamp;
}

struct SellerStats {
    uint16 servicesCreated;
    uint16 ordersCompleted;
    uint16 ordersRefunded;
}

contract ServiceMarketplaceDataV1 is OwnableUpgradeable, PausableUpgradeable {
    address public serviceMarketplace;

    // serviceId -> events
    mapping(uint256 => ServiceEventData[]) public serviceEvents;

    // orderId -> events
    mapping(uint256 => ServiceEventData[]) public orderEvents;

    // serviceId -> rating stats
    mapping(uint256 => ServiceRating) public serviceRatings;

    // serviceId -> reviews
    mapping(uint256 => ServiceReview[]) public serviceReviews;

    // seller address -> stats
    mapping(address => SellerStats) public sellerStats;

    uint256[41] __gap;

    event ServiceMarketplaceAddressChanged(address serviceMarketplaceAddress);
    event ServiceEvent(uint256 indexed serviceId, ServiceEventData eventData);
    event OrderEvent(uint256 indexed orderId, ServiceEventData eventData);

    modifier onlyServiceMarketplace() {
        require(msg.sender == serviceMarketplace, "not service marketplace");
        _;
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address serviceMarketplace_) public initializer {
        __Ownable_init(msg.sender);
        __Pausable_init();

        serviceMarketplace = serviceMarketplace_;
        emit ServiceMarketplaceAddressChanged(serviceMarketplace_);
    }

    function setServiceMarketplaceAddress(
        address serviceMarketplaceAddress_
    ) public onlyOwner {
        serviceMarketplace = serviceMarketplaceAddress_;
        emit ServiceMarketplaceAddressChanged(serviceMarketplaceAddress_);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function transferOwnership(
        address to_
    ) public override(OwnableUpgradeable) onlyOwner {
        super.transferOwnership(to_);
    }

    // Event publishing
    function publishServiceEvent(
        uint256 serviceId_,
        ServiceEventData memory event_
    ) public onlyServiceMarketplace {
        event_.timestamp_ = uint32(block.timestamp);
        serviceEvents[serviceId_].push(event_);
        emit ServiceEvent(serviceId_, event_);
    }

    function publishOrderEvent(
        uint256 orderId_,
        ServiceEventData memory event_
    ) public onlyServiceMarketplace {
        event_.timestamp_ = uint32(block.timestamp);
        orderEvents[orderId_].push(event_);
        emit OrderEvent(orderId_, event_);
    }

    // View functions for events
    function serviceEventsLength(uint256 serviceId_) public view returns (uint256) {
        return serviceEvents[serviceId_].length;
    }

    function orderEventsLength(uint256 orderId_) public view returns (uint256) {
        return orderEvents[orderId_].length;
    }

    function getServiceEvents(
        uint256 serviceId_,
        uint256 index_,
        uint256 limit_
    ) public view returns (ServiceEventData[] memory) {
        uint256 eventsLength_ = serviceEvents[serviceId_].length;
        require(index_ < eventsLength_, "index out of bounds");

        uint length = eventsLength_ - index_;
        if (limit_ == 0) {
            limit_ = length;
        }
        length = length > limit_ ? limit_ : length;

        ServiceEventData[] memory result = new ServiceEventData[](length);
        for (uint i = 0; i < length; i++) {
            result[i] = serviceEvents[serviceId_][i + index_];
        }
        return result;
    }

    function getOrderEvents(
        uint256 orderId_,
        uint256 index_,
        uint256 limit_
    ) public view returns (ServiceEventData[] memory) {
        uint256 eventsLength_ = orderEvents[orderId_].length;
        require(index_ < eventsLength_, "index out of bounds");

        uint length = eventsLength_ - index_;
        if (limit_ == 0) {
            limit_ = length;
        }
        length = length > limit_ ? limit_ : length;

        ServiceEventData[] memory result = new ServiceEventData[](length);
        for (uint i = 0; i < length; i++) {
            result[i] = orderEvents[orderId_][i + index_];
        }
        return result;
    }

    // Rating management
    function updateServiceRating(
        uint256 serviceId_,
        uint8 reviewRating_
    ) public onlyServiceMarketplace {
        require(
            reviewRating_ >= 1 && reviewRating_ <= 5,
            "Invalid review score"
        );

        ServiceRating storage rating = serviceRatings[serviceId_];

        rating.averageRating = uint16(
            (rating.averageRating * rating.numberOfRatings + reviewRating_ * 10000) /
                (rating.numberOfRatings + 1)
        );
        rating.numberOfRatings++;
    }

    function getServiceRating(
        uint256 serviceId_
    ) public view returns (ServiceRating memory) {
        return serviceRatings[serviceId_];
    }

    // Review management
    function addServiceReview(
        uint256 serviceId_,
        address seller_,
        address reviewer_,
        uint256 orderId_,
        uint8 rating_,
        string memory text_
    ) public onlyServiceMarketplace {
        require(
            rating_ >= 1 && rating_ <= 5,
            "Invalid review score"
        );

        serviceReviews[serviceId_].push(
            ServiceReview({
                reviewer: reviewer_,
                orderId: orderId_,
                rating: rating_,
                text: text_,
                timestamp: uint32(block.timestamp)
            })
        );
    }

    function getServiceReviews(
        uint256 serviceId_,
        uint256 index_,
        uint256 limit_
    ) public view returns (ServiceReview[] memory) {
        uint256 reviewsLength_ = serviceReviews[serviceId_].length;
        if (reviewsLength_ == 0) {
            return new ServiceReview[](0);
        }
        require(index_ < reviewsLength_, "index out of bounds");

        uint length = reviewsLength_ - index_;
        if (limit_ == 0) {
            limit_ = length;
        }
        length = length > limit_ ? limit_ : length;

        ServiceReview[] memory result = new ServiceReview[](length);
        for (uint i = 0; i < length; i++) {
            result[i] = serviceReviews[serviceId_][i + index_];
        }
        return result;
    }

    function serviceReviewsLength(uint256 serviceId_) public view returns (uint256) {
        return serviceReviews[serviceId_].length;
    }

    // Seller stats management
    function incrementServicesCreated(address seller_) public onlyServiceMarketplace {
        sellerStats[seller_].servicesCreated += 1;
    }

    function sellerDelivered(address seller_) public onlyServiceMarketplace {
        sellerStats[seller_].ordersCompleted += 1;
    }

    function sellerRefunded(address seller_) public onlyServiceMarketplace {
        sellerStats[seller_].ordersRefunded += 1;
    }

    function getSellerStats(
        address seller_
    ) public view returns (SellerStats memory) {
        return sellerStats[seller_];
    }
}
