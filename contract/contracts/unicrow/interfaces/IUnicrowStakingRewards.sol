// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IUnicrowStakingRewards {
    /// @notice Collect payments fee to staking rewards
    /// @param token Token address
    /// @param amount Paid fee
    function collectFee(address token, uint256 amount) external;
}
