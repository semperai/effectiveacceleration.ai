// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "../UnicrowTypes.sol";

interface IUnicrowArbitrator {
    /**
     * Assigns an arbitrator to an escrow.
     * @dev Called by Unicrow.pay()
     * @param escrowId Id of the escrow
     * @param arbitrator Arbitrator's address
     * @param arbitratorFee Arbitrator fee in bips (can be 0)
      */
    function setArbitrator(uint256 escrowId, address arbitrator, uint16 arbitratorFee) external;

    /**
     * One of the parties (buyer or seller) can call this to propose an arbitrator
     * for an escrow that has no arbitrator defined
     * @param escrowId Id of the escrow
     * @param arbitrator Arbitrator's address
     * @param arbitratorFee Arbitrator fee in bips (can be 0)
      */
    function proposeArbitrator(uint256 escrowId, address arbitrator, uint16 arbitratorFee) external;

    /**
     * Approve an arbitrator proposed by another party (i.e. by seller if buyer proposed, by buyer if seller proposed).
     * @dev To ensure the user approves an arbitrator they wanted, it requires the same parameters as proposal
     * @param escrowId Id of an escrow
     * @param validationAddress Arbitrator's address - will be compared with the existing proposal
     * @param validation Arbitrator's Fee - will be compared with the existing proposal
    */
    function approveArbitrator(uint256 escrowId, address validationAddress, uint16 validation) external;

    /**
     * Arbitrate an payment - to be called only by an escrow's arbitrator
     * @param escrowId Id of an escrow
     * @param newSplit How the payment should be split between buyer [0] and seller [1]. [100, 0] will refund the payment to the buyer, [0, 100] will release it to the seller, anything in between will
     */
    function arbitrate(uint256 escrowId, uint16[2] memory newSplit) external returns (uint256[5] memory);

    /**
     * Get information about proposed or assigned arbitrator.
     * @dev buyerConsensus and sellerConsensus indicate if the arbitrator was only proposed by one of the parties or
     * @dev has been assigned by the mutual consensus
     * @return Arbitrator information.
     * @param escrowId ID of the escrow
     */
    function getArbitratorData(uint256 escrowId) external view returns(Arbitrator memory);
}
