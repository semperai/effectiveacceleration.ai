// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IUnicrowClaimRewards {
    function distribute(
        address token,
        address buyer,
        address seller,
        uint256 fee
    ) external;
}
