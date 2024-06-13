// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "./@openzeppelin/contracts/token/ERC20/IERC20.sol";

uint16 constant _100_PCT_IN_BIPS = 10000;

// these constants are used as keys for consensus and split arrays
uint8 constant WHO_BUYER = 0;
uint8 constant WHO_SELLER = 1;
uint8 constant WHO_MARKETPLACE = 2;
uint8 constant WHO_PROTOCOL = 3;
uint8 constant WHO_ARBITRATOR = 4;

/// @dev This is how information about each escrow is stored int he main contract, mapped to escrowId
struct Escrow {
    /// @dev Who sent the payment
    address buyer;
    /// @dev By how much will the challenge period get extended after a challenge (in seconds)
    uint64 challengeExtension;
    /// @dev Whom is the payment for
    address seller;
    /// @dev When does/has the current challenge period start(ed) (seconds in Unix epoch)
    uint64 challengePeriodStart;
    /// @dev Address of a marketplace that has facilitated the trade (0x000...00 if none)
    address marketplace;
    /// @dev Fee for the marketplace (can be 0 even if a marketplace was set but doesn't charge fee)
    uint256 marketplaceFee;
    /// @dev When does the current challenge period end (seconds in Unix epoch)
    uint64 challengePeriodEnd;
    /// @dev Token used in the payment (0x00..00 for ETH)
    address currency;
    /// @dev True if the payment was already withdrawn from the escrow
    uint16 claimed;
    /**
     * @dev Indicates status of the payment from buyer's and seller's side.
     * Negative value means that party was challenged.
     * Examples for various states:
     *  0, 1: Paid - If the payment is claimed after challenge period ends, consensus remains like this
     *  1, 1: Released by buyer
     *  1,-1: 1x Challenged by buyer - If the payment is claimed after CP ends, consensus remains like this
     * -1, 2: 1x Challenged by buyer and 1x by Seller
     *  2,-2: 2x Challenged by buyer, 1x by seller
     *  3, 2: Released, Refunded, or Settled. Deduct 1 from each consensus number to calculate number of challenges
     */
    int16[2] consensus;
    /**
     * @dev Buyer's and Seller's share, and fees, in bips
     * Example of a new payment with 5% marketplace fee, 5% arbitrator fee: [0, 10000, 500, 500]
     * If the payment is refunded: [10000, 0, 0, 0]
     * If the payment is settled (e.g. 20% discount for the buyer): [8000, 2000, 500, 500]
     *
     * Note, that the sum of all splits can equal to more than 100% here.
     * The actual fees and shares are re-calculated when the payment is finally claimed
     */
    uint16[4] split;
    /// @dev amount in the token
    uint256 amount;
}

/// @dev Escrow parameters to be sent along with the deposit
struct EscrowInput {
    /// @dev who should receive the payment
    address seller;
    /// @dev address of a marketplace that has facilitated the payment
    address marketplace;
    /// @dev Fee for the marketplace (can be 0 even if a marketplace was set but doesn't charge fee)
    uint16 marketplaceFee;
    /// @dev Token used in the payment (0x00..00 for ETH)
    address currency;
    /// @dev Initial challenge period (in seconds)
    uint32 challengePeriod;
    /// @dev By how much will the challenge period get extended after a challenge (in seconds)
    uint32 challengeExtension;
    /// @dev Amount in token
    uint256 amount;
}

/// @dev Information about arbitrator proposed or assigned to an escrow.
/// @dev If both buyerConsensus and sellerConsensus are 1, the arbitrator is assigned, otherwise it's only been proposed by the party that has 1
struct Arbitrator {
    /// @dev Address of the arbitrator. 0x00..00 for no arbitrator
    address arbitrator;
    /// @dev Arbitrator's fee in bips. Can be 0
    uint16 arbitratorFee;
    /// @dev Seller's agreement on the arbitrator
    bool sellerConsensus;
    /// @dev Buyer's agreement on the arbitrator
    bool buyerConsensus;
    /// @dev Has the escrow been decided by the arbitrator
    bool arbitrated;
}

/// @dev Stores information about settlement, mapped to escrowId in UnicrowDispute contract
struct Settlement {
    /// @dev address of who sent the latest settlement offer. Returns 0x00..00 if no offer has been made
    address latestSettlementOfferBy;
    /// @dev how the payment was offered to be settled [buyer, seller] in bips
    uint16[2] latestSettlementOffer;
}

/// @dev Information about the token used in the payment is returned in this structure
struct Token {
    address address_;
    uint8 decimals;
    string symbol;
}

/// @dev Superstructure that includes all the information relevant to an escrow
struct Data {
    Escrow escrow;
    Arbitrator arbitrator;
    Settlement settlement;
    Token token;
}

function abs8(int16 x) pure returns (int16) {
    return x >= 0 ? x : -x;
}
