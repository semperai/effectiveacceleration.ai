// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;
import "../UnicrowTypes.sol";

interface IUnicrowDispute {
    /**
     * Challenge a payment. If the challenge is successful (the criteria are met),
     * it sets whoever sent the challenge as a payee and sets a new challenge period
     * @param escrowId Id of the escrow that's being challenged
     */
    function challenge(uint256 escrowId) external;

    /**
     * Send an offer to settle the payment between the buyer and the seller
     * @param escrowId ID of the escrow for which the offer is sent
     * @param newSplit the new settlement proposal ([buyerSplit, sellerSplit] in bips, sum must equal 10000)
     */
    function offerSettlement(
        uint256 escrowId,
        uint16[2] memory newSplit
    ) external;

    /**
     * Approve an offer to settle the payment between the buyer and the seller
     * @param escrowId ID of the escrow for which the offer is sent
     * @param validation the settlement proposal that must be equal to an offer sent by the other party
     */
    function approveSettlement(
        uint256 escrowId,
        uint16[2] memory validation
    ) external;
}
