// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "./@openzeppelin/contracts/utils/Context.sol";
import "./@openzeppelin/contracts/utils/Address.sol";
import "./@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./interfaces/IUnicrowClaim.sol";
import "./interfaces/IUnicrowDispute.sol";
import "./interfaces/IUnicrowArbitrator.sol";
import "./Unicrow.sol";
import "./UnicrowTypes.sol";

contract UnicrowDispute is IUnicrowDispute, Context, ReentrancyGuard {
    using Address for address payable;

    /// Main Unicrow's escrow contract
    Unicrow public immutable unicrow;

    /// Reference to the contract that manages claims from the escrow
    IUnicrowClaim public immutable unicrowClaim;

    /// Reference to the Arbitration contract
    IUnicrowArbitrator public immutable unicrowArbitrator;

    /// Stores information about which address sent the latest offer to settle a particular escrow identified by its ID
    mapping(uint256 => address) public latestSettlementOfferBy;

    /// Stores information about the splits in the latest offer to settle an escrow identified by its ID
    mapping(uint256 => uint16[2]) public latestSettlementOffer;

    /**
     * @dev Emitted when a challenge is sent for an escrow
     * @param escrowId ID of the challenged escrow
     * @param blockTime Timestamp when the challenge was minted
     * @param escrow information about the challenged escrow
    */
    event Challenge(uint256 indexed escrowId, uint256 blockTime, Escrow escrow);

    /**
     * @dev Settlement offer (i.e. offer to split the escrow by defined shares) was sent by one of the parties
     * @param escrowId ID of the scrow for which a settlement was offered
     * @param blockTime Timestamp for when the offer was minted
     * @param latestSettlementOffer Splits [buyer's split, seller's split] as defined in the offer (in bips)
     * @param latestSettlementOfferBy address which sent the offer
     */
    event SettlementOffer(uint256 indexed escrowId, uint256 blockTime, uint16[2] latestSettlementOffer, address latestSettlementOfferBy);

    /**
     * @dev Settlement offer was approved and the escrow was settled and claimed
     * @param escrowId ID of the escrow
     * @param escrow Details of the escrow
     * @param latestSettlementOffer Splits (in bips) in the settlement offer that was approved
     * @param blockTime Timestamp of when the settlement was minted
     * @param amounts amounts (in token) sent to addresses that were eligible to any shares and fees from the escrow
     */
    event ApproveOffer(uint256 indexed escrowId, Escrow escrow, uint16[2] latestSettlementOffer,uint256 blockTime, uint256[5] amounts);

    /**
     * Constructor sets immutable references to the related Unicrow contracts
     */
    constructor(
        address unicrow_,
        address unicrowClaim_,
        address unicrowArbitrator_
    ) {
        unicrow = Unicrow(payable(unicrow_));
        unicrowClaim = IUnicrowClaim(payable(unicrowClaim_));
        unicrowArbitrator = IUnicrowArbitrator(unicrowArbitrator_);
    }

    /// @inheritdoc IUnicrowDispute
    function challenge(uint256 escrowId) external override nonReentrant {
        address sender = _msgSender();

        Escrow memory escrow = unicrow.getEscrow(escrowId);

        // Only the escrow's seller and buyer can challenge
        require(sender == escrow.seller || sender == escrow.buyer, "1-009");

        // The payment must be either in "Paid" or "Challenged" state
        require(
            escrow.consensus[WHO_SELLER] <= 0 ||
                escrow.consensus[WHO_BUYER] <= 0,
            "1-005"
        );

        // Check that the challenge period is running
        require(block.timestamp <= escrow.challengePeriodEnd, "1-016");
        require(block.timestamp > escrow.challengePeriodStart, "1-019");

        // Prevent reduntant challenge from seller's side
        require(
            sender != escrow.buyer ||
            escrow.consensus[WHO_BUYER] <= 0,
            "1-014"
        );

        // Prevent reduntant challenge from buyer's side
        require(
            sender != escrow.seller ||
            escrow.consensus[WHO_SELLER] <= 0,
            "1-015"
        );

        // Challenge does a few things:
        //   - sets split to 100/0% for the challenging party
        //   - sets the challenging party's consensus to positive and increases it by one
        //   - sets the challenged party consensus to negative
        // This way, if one of the parties has negative consensus, we know the payment is challenged
        //   and the absolute number keeps track of how many challenges have there been
        if (sender == escrow.buyer) {
            escrow.split[WHO_BUYER] = 10000;
            escrow.split[WHO_SELLER] = 0;
            escrow.consensus[WHO_BUYER] = abs8(escrow.consensus[WHO_BUYER]) + 1;
            escrow.consensus[WHO_SELLER] = -(abs8(escrow.consensus[WHO_SELLER]));
        } else if (sender == escrow.seller) {
            escrow.split[WHO_SELLER] = 10000;
            escrow.split[WHO_BUYER] = 0;
            escrow.consensus[WHO_BUYER] = -(abs8(escrow.consensus[WHO_BUYER]));
            escrow.consensus[WHO_SELLER] = abs8(escrow.consensus[WHO_SELLER]) + 1;
        }

        // The new challenge period starts at the end of the current period
        //   and is extended by the time set in the original payment
        uint64 periodStart = escrow.challengePeriodEnd;
        uint64 periodEnd = escrow.challengePeriodEnd + escrow.challengeExtension;

        // Execute the challenge in the main escrow contract
        unicrow.challenge(
            escrowId,
            escrow.split,
            escrow.consensus,
            periodStart,
            periodEnd
        );

        // Update the challenge periods for the returned event
        escrow.challengePeriodStart = periodStart;
        escrow.challengePeriodEnd = periodEnd;

        emit Challenge(escrowId, block.timestamp, escrow);
    }

    /// @inheritdoc IUnicrowDispute
    function offerSettlement(uint256 escrowId, uint16[2] calldata newSplit)
        external
        override
        nonReentrant
    {
        address sender = _msgSender();
        Escrow memory escrow = unicrow.getEscrow(escrowId);

        // Only buyer or seller can offer a settlement
        require(sender == escrow.buyer || sender == escrow.seller, "1-009");

        // Check that the payment has not been released, refunded, or settled already
        require(
            escrow.consensus[WHO_SELLER] <= 0 ||
                escrow.consensus[WHO_BUYER] <= 0,
            "1-005"
        );

        // Proposed splits should equal 100%
        require(newSplit[WHO_BUYER] + newSplit[WHO_SELLER] == 10000, "1-007");

        // Record the latest offer details
        latestSettlementOfferBy[escrowId] = sender;
        latestSettlementOffer[escrowId] = newSplit;

        emit SettlementOffer(escrowId, block.timestamp, newSplit, msg.sender);
    }

    /// @inheritdoc IUnicrowDispute
    function approveSettlement(
        uint256 escrowId,
        uint16[2] calldata validation
    ) external override {
        address sender = _msgSender();

        Escrow memory escrow = unicrow.getEscrow(escrowId);

        address latestSettlementOfferByAddress = latestSettlementOfferBy[escrowId];

        // Only buyer or seller can approve a settlement
        require(sender == escrow.buyer || sender == escrow.seller, "1-009");

        // Check that there's a prior settlement offer
        require(latestSettlementOfferByAddress != address(0), "1-017");

        // Only buyer can approve Seller's offer and vice versa
        require(sender != latestSettlementOfferByAddress, "1-020");

        uint16[2] memory latestOffer = latestSettlementOffer[escrowId];

        // Check that the splits sent for approval are the ones that were offered
        require(
            validation[WHO_BUYER] == latestOffer[WHO_BUYER] &&
            validation[WHO_SELLER] == latestOffer[WHO_SELLER],
            "1-018"
        );

        uint16[4] memory split = escrow.split;

        split[WHO_BUYER] = latestOffer[WHO_BUYER];
        split[WHO_SELLER] = latestOffer[WHO_SELLER];

        // Update buyer and seller consensus to positive numbers
        escrow.consensus[WHO_BUYER] = abs8(escrow.consensus[WHO_BUYER]) + 1;
        escrow.consensus[WHO_SELLER] = abs8(escrow.consensus[WHO_SELLER]);

        // Record the settlement in the main escrow contract
        unicrow.settle(
            escrowId,
            split,
            escrow.consensus
        );

        // Sent shares to all the parties and read the final amounts
        uint256[5] memory amounts = unicrowClaim.claim(escrowId);

        emit ApproveOffer(escrowId, escrow, latestOffer, block.timestamp, amounts);
    }

    /**
     * Get details about the latest settlement offer
     * @param escrowId Id of the escrow to get settlement offer details for
     * @return Returns zero values in the returned object's fields if there's been no offer
     */
    function getSettlementDetails(uint256 escrowId) external view returns (Settlement memory) {
       Settlement memory settlement = Settlement(latestSettlementOfferBy[escrowId], latestSettlementOffer[escrowId]);
       return settlement;
    }
}
