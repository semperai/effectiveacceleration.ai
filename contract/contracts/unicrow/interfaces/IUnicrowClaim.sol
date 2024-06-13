// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

interface IUnicrowClaim {
    /// @notice Claim multiple escrows.
    /// @dev To save everyone's gas costs, it claims balances and fees of all parties that are eligible for a share from the escrow
    /// @param escrows List of escrows to be claimed.
    function claimMultiple(uint[] memory escrows) external;

    /// @notice Claim a single escrow
    /// @dev To save everyone's gas costs, it claims balances and fees of all parties that are eligible for a share from the escrow
    /// @param escrowId escrow to be claimed
    function claim(uint escrowId) external returns (uint256[5] memory);

    // @notice Update rewards contract pointer (governable)
    // @param crowRewards_ New rewards address
    function updateCrowRewards(address crowRewards_) external;

    // @notice Update staking rewards contract pointer (governable)
    // @param stakingRewards_ New staking rewards address
    function updateStakingRewards(address crowRewards_) external;

    // @notice Update protocol fee collection address (governable)
    // @param protocolFeeAddress_ New protocol fee collection address
    function updateProtocolFeeAddress(address protocolFeeAddress_) external;
}
