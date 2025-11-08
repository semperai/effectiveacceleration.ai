// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {encodeString, encodeBytes, encodeStringArray} from "./libraries/Encoding.sol";

import "./unicrow/interfaces/IUnicrow.sol";
import "./unicrow/interfaces/IUnicrowDispute.sol";
import "./unicrow/interfaces/IUnicrowArbitrator.sol";
import "./ServiceMarketplaceDataV1.sol";
import "./MarketplaceDataV1.sol";

// import "hardhat/console.sol";

enum ServiceState {
    Active,      // Available for purchase
    Paused,      // Temporarily unavailable
    Deleted      // Permanently removed
}

enum OrderState {
    Pending,     // Payment made, seller hasn't started
    InProgress,  // Seller working on it
    Delivered,   // Seller submitted work
    Completed,   // Buyer approved, payment released
    Disputed,    // Dispute raised
    Refunded,    // Fully refunded
    Cancelled    // Cancelled before work started
}

struct ServiceRoles {
    address seller;
    address arbitrator;
}

struct ServiceListing {
    uint8 state;                  // ServiceState enum
    ServiceRoles roles;
    string title;
    string[] tags;                // Reuse MECE tags
    bytes32 contentHash;          // IPFS: description, gallery, FAQ
    uint256 price;                // Fixed price in wei
    address token;                // Payment token (ERC20)
    uint32 deliveryTime;          // Expected delivery time (seconds)
    string deliveryMethod;        // e.g., "IPFS", "Email", "Other"
    uint256 totalOrders;          // Lifetime order count
    uint256 completedOrders;      // Successfully completed orders
    uint8 averageRating;          // Service average rating (0-5, scaled by 10)
    uint32 createdAt;             // Timestamp of creation
    uint32 updatedAt;             // Timestamp of last update
}

struct ServiceOrder {
    uint256 serviceId;            // Reference to service
    uint8 state;                  // OrderState enum
    address buyer;
    address seller;
    uint256 price;                // Locked price at purchase time
    address token;                // Payment token
    uint256 escrowId;             // Unicrow escrow ID
    bytes32 requirementsHash;     // IPFS: buyer's specific requirements
    bytes32 resultHash;           // IPFS: delivered work
    uint8 rating;                 // Order rating (1-5)
    bool disputed;
    uint32 createdAt;
    uint32 deliveredAt;
    uint32 completedAt;
}

contract ServiceMarketplaceV1 is OwnableUpgradeable, PausableUpgradeable {
    ServiceMarketplaceDataV1 public serviceMarketplaceData;
    MarketplaceDataV1 public marketplaceData; // For user registration checks

    uint256 public version;

    ServiceListing[] public services;
    ServiceOrder[] public orders;

    // serviceId -> buyer -> orderIds
    mapping(uint256 => mapping(address => uint256[])) public buyerOrders;

    address public unicrowAddress;
    address public unicrowDisputeAddress;
    address public unicrowArbitratorAddress;

    address public treasuryAddress;
    uint16 public unicrowMarketplaceFee;

    uint256[41] __gap; // Upgradeable gap

    // Modifiers
    modifier onlyServiceSeller(uint256 serviceId_) {
        require(services[serviceId_].roles.seller == msg.sender, "not seller");
        _;
    }

    modifier onlyOrderBuyer(uint256 orderId_) {
        require(orders[orderId_].buyer == msg.sender, "not buyer");
        _;
    }

    modifier onlyOrderSeller(uint256 orderId_) {
        require(orders[orderId_].seller == msg.sender, "not seller");
        _;
    }

    modifier onlyBuyerOrSeller(uint256 orderId_) {
        require(
            orders[orderId_].buyer == msg.sender ||
                orders[orderId_].seller == msg.sender,
            "not buyer or seller"
        );
        _;
    }

    modifier onlyOrderArbitrator(uint256 orderId_) {
        ServiceOrder storage order = orders[orderId_];
        ServiceListing storage service = services[order.serviceId];
        require(service.roles.arbitrator == msg.sender, "not arbitrator");
        _;
    }

    // Events
    event ServiceMarketplaceDataAddressChanged(address serviceMarketplaceDataAddress);
    event MarketplaceDataAddressChanged(address marketplaceDataAddress);
    event UnicrowAddressesChanged(
        address unicrowAddress,
        address unicrowDisputeAddress,
        address unicrowArbitratorAddress
    );
    event UnicrowMarketplaceFeeChanged(uint16 unicrowMarketplaceFee);
    event TreasuryAddressChanged(address treasuryAddress);
    event VersionChanged(uint256 indexed version);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /// @notice Initialize contract
    /// @param unicrowAddress_ Address of Unicrow contract
    /// @param unicrowDisputeAddress_ Address of UnicrowDispute contract
    /// @param unicrowArbitratorAddress_ Address of UnicrowArbitrator contract
    /// @param treasuryAddress_ Address for marketplace fee collection
    /// @param unicrowMarketplaceFee_ Marketplace fee in basis points
    function initialize(
        address unicrowAddress_,
        address unicrowDisputeAddress_,
        address unicrowArbitratorAddress_,
        address treasuryAddress_,
        uint16 unicrowMarketplaceFee_
    ) public initializer {
        __Ownable_init(msg.sender);
        __Pausable_init();

        unicrowAddress = unicrowAddress_;
        unicrowDisputeAddress = unicrowDisputeAddress_;
        unicrowArbitratorAddress = unicrowArbitratorAddress_;
        treasuryAddress = treasuryAddress_;
        unicrowMarketplaceFee = unicrowMarketplaceFee_;

        emit UnicrowAddressesChanged(
            unicrowAddress_,
            unicrowDisputeAddress_,
            unicrowArbitratorAddress_
        );
        emit TreasuryAddressChanged(treasuryAddress_);
        emit UnicrowMarketplaceFeeChanged(unicrowMarketplaceFee_);
    }

    // Admin functions
    function setServiceMarketplaceDataAddress(
        address serviceMarketplaceDataAddress_
    ) public onlyOwner {
        serviceMarketplaceData = ServiceMarketplaceDataV1(serviceMarketplaceDataAddress_);
        emit ServiceMarketplaceDataAddressChanged(serviceMarketplaceDataAddress_);
    }

    function setMarketplaceDataAddress(
        address marketplaceDataAddress_
    ) public onlyOwner {
        marketplaceData = MarketplaceDataV1(marketplaceDataAddress_);
        emit MarketplaceDataAddressChanged(marketplaceDataAddress_);
    }

    function setUnicrowMarketplaceFee(uint16 unicrowMarketplaceFee_) public onlyOwner {
        unicrowMarketplaceFee = unicrowMarketplaceFee_;
        emit UnicrowMarketplaceFeeChanged(unicrowMarketplaceFee_);
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

    function setVersion(uint256 version_) external onlyOwner {
        version = version_;
        emit VersionChanged(version_);
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

    // View functions
    function servicesLength() public view returns (uint256) {
        return services.length;
    }

    function ordersLength() public view returns (uint256) {
        return orders.length;
    }

    function getService(uint256 serviceId_) public view returns (ServiceListing memory) {
        return services[serviceId_];
    }

    function getOrder(uint256 orderId_) public view returns (ServiceOrder memory) {
        return orders[orderId_];
    }

    function getBuyerOrders(
        uint256 serviceId_,
        address buyer_
    ) public view returns (uint256[] memory) {
        return buyerOrders[serviceId_][buyer_];
    }

    // Internal helper functions
    function publishServiceEvent(
        uint256 serviceId_,
        ServiceEventData memory event_
    ) internal {
        serviceMarketplaceData.publishServiceEvent(serviceId_, event_);
    }

    function publishOrderEvent(
        uint256 orderId_,
        ServiceEventData memory event_
    ) internal {
        serviceMarketplaceData.publishOrderEvent(orderId_, event_);
    }

    function checkServiceParams(
        string memory title_,
        string[] memory tags_,
        uint256 price_,
        address arbitrator_,
        address seller_
    ) internal view {
        uint256 titleLength = bytes(title_).length;
        require(
            titleLength > 0 && titleLength < 255,
            "title too short or long"
        );
        require(price_ > 0, "price must be greater than 0");
        require(tags_.length > 0, "At least one tag is required");

        if (arbitrator_ != address(0)) {
            require(
                marketplaceData.arbitratorRegistered(arbitrator_),
                "arbitrator not registered"
            );
            require(
                arbitrator_ != seller_,
                "arbitrator and seller can not be the same person"
            );
        }

        // Check for exactly one MECE tag
        uint meceCount = 0;
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
     * @notice Create a new service listing
     * @param title_ Service title - must be 1-255 characters
     * @param contentHash_ IPFS hash of service description, gallery, FAQ
     * @param tags_ Tags including exactly one MECE tag
     * @param token_ Payment token address (must be valid ERC20)
     * @param price_ Fixed service price in wei
     * @param deliveryTime_ Expected delivery time in seconds
     * @param deliveryMethod_ Delivery method (e.g., "IPFS", "Email")
     * @param arbitrator_ Preferred arbitrator address (can be zero address)
     */
    function createService(
        string calldata title_,
        bytes32 contentHash_,
        string[] calldata tags_,
        address token_,
        uint256 price_,
        uint32 deliveryTime_,
        string calldata deliveryMethod_,
        address arbitrator_
    ) public whenNotPaused returns (uint256) {
        require(marketplaceData.userRegistered(msg.sender), "not registered");

        checkServiceParams(title_, tags_, price_, arbitrator_, msg.sender);

        require(
            token_.code.length > 0,
            "invalid token"
        );

        uint256 deliveryMethodLength = bytes(deliveryMethod_).length;
        require(
            deliveryMethodLength > 0 && deliveryMethodLength < 255,
            "delivery method too short or long"
        );

        services.push();
        uint256 serviceId = services.length - 1;

        ServiceListing storage service = services[serviceId];
        service.state = uint8(ServiceState.Active);
        service.roles.seller = msg.sender;
        service.roles.arbitrator = arbitrator_;
        service.title = title_;
        service.tags = tags_;
        service.contentHash = contentHash_;
        service.price = price_;
        service.token = token_;
        service.deliveryTime = deliveryTime_;
        service.deliveryMethod = deliveryMethod_;
        service.createdAt = uint32(block.timestamp);
        service.updatedAt = uint32(block.timestamp);

        publishServiceEvent(
            serviceId,
            ServiceEventData({
                type_: uint8(ServiceEventType.ServiceCreated),
                address_: abi.encodePacked(msg.sender),
                data_: bytes.concat(
                    encodeString(title_),
                    abi.encodePacked(contentHash_),
                    encodeStringArray(tags_),
                    abi.encodePacked(uint160(token_)),
                    abi.encodePacked(price_),
                    abi.encodePacked(deliveryTime_),
                    encodeString(deliveryMethod_),
                    abi.encodePacked(uint160(arbitrator_))
                ),
                timestamp_: 0
            })
        );

        serviceMarketplaceData.incrementServicesCreated(msg.sender);

        return serviceId;
    }

    /**
     * @notice Update an existing service listing
     * @dev Can only be called by service seller
     * @dev Service must be in Active or Paused state
     */
    function updateService(
        uint256 serviceId_,
        string calldata title_,
        bytes32 contentHash_,
        string[] calldata tags_,
        uint256 price_,
        uint32 deliveryTime_,
        address arbitrator_
    ) public whenNotPaused onlyServiceSeller(serviceId_) {
        ServiceListing storage service = services[serviceId_];
        require(
            service.state == uint8(ServiceState.Active) ||
                service.state == uint8(ServiceState.Paused),
            "service deleted"
        );

        checkServiceParams(
            title_,
            tags_,
            price_,
            arbitrator_,
            service.roles.seller
        );

        service.title = title_;
        service.contentHash = contentHash_;
        service.tags = tags_;
        service.price = price_;
        service.deliveryTime = deliveryTime_;
        service.roles.arbitrator = arbitrator_;
        service.updatedAt = uint32(block.timestamp);

        publishServiceEvent(
            serviceId_,
            ServiceEventData({
                type_: uint8(ServiceEventType.ServiceUpdated),
                address_: bytes(""),
                data_: bytes.concat(
                    encodeString(title_),
                    abi.encodePacked(contentHash_),
                    encodeStringArray(tags_),
                    abi.encodePacked(price_),
                    abi.encodePacked(deliveryTime_),
                    abi.encodePacked(uint160(arbitrator_))
                ),
                timestamp_: 0
            })
        );
    }

    /**
     * @notice Pause a service listing (temporarily hide from marketplace)
     */
    function pauseService(
        uint256 serviceId_
    ) public whenNotPaused onlyServiceSeller(serviceId_) {
        ServiceListing storage service = services[serviceId_];
        require(service.state == uint8(ServiceState.Active), "not active");

        service.state = uint8(ServiceState.Paused);
        service.updatedAt = uint32(block.timestamp);

        publishServiceEvent(
            serviceId_,
            ServiceEventData({
                type_: uint8(ServiceEventType.ServicePaused),
                address_: bytes(""),
                data_: bytes(""),
                timestamp_: 0
            })
        );
    }

    /**
     * @notice Activate a paused service listing
     */
    function activateService(
        uint256 serviceId_
    ) public whenNotPaused onlyServiceSeller(serviceId_) {
        ServiceListing storage service = services[serviceId_];
        require(service.state == uint8(ServiceState.Paused), "not paused");

        service.state = uint8(ServiceState.Active);
        service.updatedAt = uint32(block.timestamp);

        publishServiceEvent(
            serviceId_,
            ServiceEventData({
                type_: uint8(ServiceEventType.ServiceActivated),
                address_: bytes(""),
                data_: bytes(""),
                timestamp_: 0
            })
        );
    }

    /**
     * @notice Permanently delete a service listing
     * @dev Cannot be undone
     */
    function deleteService(
        uint256 serviceId_
    ) public whenNotPaused onlyServiceSeller(serviceId_) {
        ServiceListing storage service = services[serviceId_];
        require(service.state != uint8(ServiceState.Deleted), "already deleted");

        service.state = uint8(ServiceState.Deleted);
        service.updatedAt = uint32(block.timestamp);

        publishServiceEvent(
            serviceId_,
            ServiceEventData({
                type_: uint8(ServiceEventType.ServiceDeleted),
                address_: bytes(""),
                data_: bytes(""),
                timestamp_: 0
            })
        );
    }

    /**
     * @notice Purchase a service (instant buy)
     * @param serviceId_ ID of the service to purchase
     * @param requirementsHash_ IPFS hash of buyer's specific requirements
     */
    function purchaseService(
        uint256 serviceId_,
        bytes32 requirementsHash_
    ) public whenNotPaused returns (uint256) {
        require(marketplaceData.userRegistered(msg.sender), "not registered");

        ServiceListing storage service = services[serviceId_];
        require(service.state == uint8(ServiceState.Active), "service not active");
        require(
            msg.sender != service.roles.seller,
            "seller cannot buy own service"
        );
        require(
            msg.sender != service.roles.arbitrator,
            "arbitrator cannot buy service"
        );

        // Transfer payment to this contract
        SafeERC20.safeTransferFrom(
            IERC20(service.token),
            msg.sender,
            address(this),
            service.price
        );

        // Create order
        orders.push();
        uint256 orderId = orders.length - 1;

        ServiceOrder storage order = orders[orderId];
        order.serviceId = serviceId_;
        order.state = uint8(OrderState.Pending);
        order.buyer = msg.sender;
        order.seller = service.roles.seller;
        order.price = service.price;
        order.token = service.token;
        order.requirementsHash = requirementsHash_;
        order.createdAt = uint32(block.timestamp);

        // Create Unicrow escrow
        IUnicrow unicrow = IUnicrow(unicrowAddress);
        IERC20 token = IERC20(service.token);
        SafeERC20.forceApprove(token, unicrowAddress, type(uint256).max);

        EscrowInput memory escrowInput = EscrowInput(
            address(this),              // buyer (contract holds funds)
            service.roles.seller,       // seller
            treasuryAddress,            // marketplace
            unicrowMarketplaceFee,      // marketplace fee
            service.token,              // token
            service.deliveryTime + _24_HRS, // challenge period (delivery + 24h)
            service.deliveryTime + _24_HRS, // settlement period
            service.price,              // amount
            string(abi.encodePacked("Service Order #", orderId))
        );

        order.escrowId = unicrow.pay(
            address(this),
            escrowInput,
            service.roles.arbitrator,
            service.roles.arbitrator != address(0)
                ? marketplaceData.getArbitratorFee(service.roles.arbitrator)
                : 0
        );

        // Update service stats
        service.totalOrders++;

        // Track buyer's order
        buyerOrders[serviceId_][msg.sender].push(orderId);

        publishOrderEvent(
            orderId,
            ServiceEventData({
                type_: uint8(ServiceEventType.OrderCreated),
                address_: abi.encodePacked(msg.sender),
                data_: abi.encodePacked(
                    serviceId_,
                    order.escrowId,
                    requirementsHash_
                ),
                timestamp_: 0
            })
        );

        return orderId;
    }

    /**
     * @notice Seller starts working on an order
     */
    function startOrder(
        uint256 orderId_
    ) public whenNotPaused onlyOrderSeller(orderId_) {
        ServiceOrder storage order = orders[orderId_];
        require(order.state == uint8(OrderState.Pending), "order not pending");

        order.state = uint8(OrderState.InProgress);

        publishOrderEvent(
            orderId_,
            ServiceEventData({
                type_: uint8(ServiceEventType.OrderStarted),
                address_: abi.encodePacked(msg.sender),
                data_: bytes(""),
                timestamp_: 0
            })
        );
    }

    /**
     * @notice Seller delivers completed work
     * @param orderId_ Order ID
     * @param resultHash_ IPFS hash of delivered work
     */
    function deliverOrder(
        uint256 orderId_,
        bytes32 resultHash_
    ) public whenNotPaused onlyOrderSeller(orderId_) {
        ServiceOrder storage order = orders[orderId_];
        require(order.state == uint8(OrderState.InProgress), "order not in progress");

        order.state = uint8(OrderState.Delivered);
        order.resultHash = resultHash_;
        order.deliveredAt = uint32(block.timestamp);

        publishOrderEvent(
            orderId_,
            ServiceEventData({
                type_: uint8(ServiceEventType.OrderDelivered),
                address_: abi.encodePacked(msg.sender),
                data_: abi.encodePacked(resultHash_),
                timestamp_: 0
            })
        );
    }

    /**
     * @notice Buyer approves delivered work and releases payment
     * @param orderId_ Order ID
     * @param reviewRating_ Rating (1-5), 0 for no review
     * @param reviewText_ Review text (max 100 chars)
     */
    function approveOrder(
        uint256 orderId_,
        uint8 reviewRating_,
        string calldata reviewText_
    ) public whenNotPaused onlyOrderBuyer(orderId_) {
        ServiceOrder storage order = orders[orderId_];
        require(order.state == uint8(OrderState.Delivered), "order not delivered");

        // Release escrow
        IUnicrow unicrow = IUnicrow(unicrowAddress);
        unicrow.release(order.escrowId);

        order.state = uint8(OrderState.Completed);
        order.completedAt = uint32(block.timestamp);

        // Update service stats
        ServiceListing storage service = services[order.serviceId];
        service.completedOrders++;

        // Handle review
        if (reviewRating_ > 0) {
            require(bytes(reviewText_).length <= 100, "Review text too long");

            order.rating = reviewRating_;

            // Update seller's rating in marketplaceData
            marketplaceData.updateUserRating(order.seller, reviewRating_);

            // Add review
            serviceMarketplaceData.addServiceReview(
                order.serviceId,
                order.seller,
                msg.sender,
                orderId_,
                reviewRating_,
                reviewText_
            );

            // Update service average rating
            serviceMarketplaceData.updateServiceRating(order.serviceId, reviewRating_);
        }

        // Update seller stats
        serviceMarketplaceData.sellerDelivered(order.seller);

        publishOrderEvent(
            orderId_,
            ServiceEventData({
                type_: uint8(ServiceEventType.OrderCompleted),
                address_: bytes(""),
                data_: reviewRating_ > 0
                    ? bytes.concat(
                        abi.encodePacked(reviewRating_),
                        bytes(reviewText_)
                    )
                    : bytes(""),
                timestamp_: 0
            })
        );
    }

    /**
     * @notice Seller refunds the buyer
     */
    function refundOrder(
        uint256 orderId_
    ) public whenNotPaused onlyOrderSeller(orderId_) {
        ServiceOrder storage order = orders[orderId_];
        require(
            order.state == uint8(OrderState.Pending) ||
                order.state == uint8(OrderState.InProgress) ||
                order.state == uint8(OrderState.Delivered),
            "cannot refund"
        );

        order.disputed = false;

        IUnicrow unicrow = IUnicrow(unicrowAddress);
        unicrow.refund(order.escrowId);

        order.state = uint8(OrderState.Refunded);

        // Update seller stats (negative impact)
        serviceMarketplaceData.sellerRefunded(order.seller);

        publishOrderEvent(
            orderId_,
            ServiceEventData({
                type_: uint8(ServiceEventType.OrderRefunded),
                address_: abi.encodePacked(msg.sender),
                data_: bytes(""),
                timestamp_: 0
            })
        );
    }

    /**
     * @notice Post a message in order thread
     * @param orderId_ Order ID
     * @param contentHash_ IPFS hash of encrypted message
     * @param recipient_ Message recipient address
     */
    function postOrderMessage(
        uint256 orderId_,
        bytes32 contentHash_,
        address recipient_
    ) public whenNotPaused {
        ServiceOrder storage order = orders[orderId_];
        require(
            order.state != uint8(OrderState.Completed) &&
                order.state != uint8(OrderState.Cancelled) &&
                order.state != uint8(OrderState.Refunded),
            "order closed"
        );
        require(msg.sender != recipient_, "can't message yourself");

        bool isBuyer = order.buyer == msg.sender;
        bool isSeller = order.seller == msg.sender;

        require(isBuyer || isSeller, "not order participant");

        // Auto-correct recipient
        if (isSeller) {
            recipient_ = order.buyer;
        } else {
            recipient_ = order.seller;
        }

        publishOrderEvent(
            orderId_,
            ServiceEventData({
                type_: uint8(
                    isBuyer
                        ? ServiceEventType.OrderBuyerMessage
                        : ServiceEventType.OrderSellerMessage
                ),
                address_: abi.encodePacked(msg.sender),
                data_: abi.encodePacked(contentHash_, recipient_),
                timestamp_: 0
            })
        );
    }

    /**
     * @notice Raise a dispute
     * @param orderId_ Order ID
     * @param sessionKey_ Encrypted session key for arbitrator
     * @param content_ Encrypted dispute description
     */
    function disputeOrder(
        uint256 orderId_,
        bytes calldata sessionKey_,
        bytes calldata content_
    ) public whenNotPaused onlyBuyerOrSeller(orderId_) {
        ServiceOrder storage order = orders[orderId_];
        ServiceListing storage service = services[order.serviceId];

        require(
            order.state == uint8(OrderState.InProgress) ||
                order.state == uint8(OrderState.Delivered),
            "invalid order state"
        );
        require(service.roles.arbitrator != address(0), "no arbitrator");
        require(order.disputed == false, "already disputed");

        order.disputed = true;
        order.state = uint8(OrderState.Disputed);

        // Challenge escrow if buyer is disputing
        if (msg.sender == order.buyer) {
            IUnicrowDispute unicrowDispute = IUnicrowDispute(unicrowDisputeAddress);
            unicrowDispute.challenge(order.escrowId);
        }

        publishOrderEvent(
            orderId_,
            ServiceEventData({
                type_: uint8(ServiceEventType.OrderDisputed),
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
     * @notice Arbitrator settles a dispute
     * @param orderId_ Order ID
     * @param buyerShare_ Buyer's share in basis points (0-10000)
     * @param sellerShare_ Seller's share in basis points (0-10000)
     * @param reasonHash_ IPFS hash of arbitration reasoning
     */
    function arbitrateOrder(
        uint256 orderId_,
        uint16 buyerShare_,
        uint16 sellerShare_,
        bytes32 reasonHash_
    ) public whenNotPaused onlyOrderArbitrator(orderId_) {
        ServiceOrder storage order = orders[orderId_];
        ServiceListing storage service = services[order.serviceId];

        require(order.state == uint8(OrderState.Disputed), "not disputed");
        require(order.disputed, "not disputed");

        order.disputed = false;
        order.state = uint8(OrderState.Completed);
        order.completedAt = uint32(block.timestamp);

        // Update arbitrator stats
        marketplaceData.arbitratorSettled(service.roles.arbitrator);

        IUnicrowArbitrator unicrowArbitrator = IUnicrowArbitrator(
            unicrowArbitratorAddress
        );

        uint256[5] memory amounts = unicrowArbitrator.arbitrate(
            order.escrowId,
            [buyerShare_, sellerShare_]
        );

        publishOrderEvent(
            orderId_,
            ServiceEventData({
                type_: uint8(ServiceEventType.OrderArbitrated),
                address_: bytes(""),
                data_: abi.encodePacked(
                    buyerShare_,
                    amounts[0],
                    sellerShare_,
                    amounts[1],
                    reasonHash_,
                    order.seller,
                    amounts[4]
                ),
                timestamp_: 0
            })
        );
    }

    /**
     * @notice Arbitrator refuses to arbitrate
     */
    function refuseArbitration(
        uint256 orderId_
    ) public whenNotPaused onlyOrderArbitrator(orderId_) {
        ServiceOrder storage order = orders[orderId_];
        ServiceListing storage service = services[order.serviceId];

        require(order.state != uint8(OrderState.Completed), "order completed");
        require(order.state != uint8(OrderState.Cancelled), "order cancelled");
        require(order.state != uint8(OrderState.Refunded), "order refunded");

        marketplaceData.arbitratorRefused(service.roles.arbitrator);

        publishOrderEvent(
            orderId_,
            ServiceEventData({
                type_: uint8(ServiceEventType.ArbitrationRefused),
                address_: bytes(""),
                data_: bytes(""),
                timestamp_: 0
            })
        );

        // If order is in progress, refund it
        if (
            order.state == uint8(OrderState.Pending) ||
            order.state == uint8(OrderState.InProgress) ||
            order.state == uint8(OrderState.Delivered) ||
            order.state == uint8(OrderState.Disputed)
        ) {
            IUnicrow unicrow = IUnicrow(unicrowAddress);
            unicrow.refund(order.escrowId);
            order.state = uint8(OrderState.Refunded);
        }

        service.roles.arbitrator = address(0);
    }
}
