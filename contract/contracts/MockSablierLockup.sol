// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { Broker, Lockup, LockupDynamic } from "@sablier/lockup/src/types/DataTypes.sol";
import { ud2x18 } from "@prb/math/src/UD2x18.sol";
import { ud60x18 } from "@prb/math/src/UD60x18.sol";

contract MockSablierLockup {
    uint256 private nextStreamId;
    uint256 private createWithDurationsLLCallCount;

    struct CreateWithDurationsLLCall {
        address sender;
        address recipient;
        uint256 totalAmount;
        address token;
        bool cancelable;
        bool transferable;
        string shape;
        uint256 cliffDuration;
        uint256 totalDuration;
    }

    CreateWithDurationsLLCall[] private createWithDurationsLLCalls;
    uint256 private lastStreamId;

    function setNextStreamId(uint256 _nextStreamId) external {
        nextStreamId = _nextStreamId;
    }

    function getLastStreamId() external view returns (uint256) {
        return lastStreamId;
    }

    function getAddress() external view returns (address) {
        return address(this);
    }

    function getCreateWithDurationsLLCallCount() external view returns (uint256) {
        return createWithDurationsLLCallCount;
    }

    function getCreateWithDurationsLLCall(uint256 index) external view returns (
        address sender,
        address recipient,
        uint256 totalAmount,
        address token,
        bool cancelable,
        bool transferable,
        string memory shape,
        uint256 cliffDuration,
        uint256 totalDuration
    ) {
        CreateWithDurationsLLCall storage call = createWithDurationsLLCalls[index];
        return (
            call.sender,
            call.recipient,
            call.totalAmount,
            call.token,
            call.cancelable,
            call.transferable,
            call.shape,
            call.cliffDuration,
            call.totalDuration
        );
    }

    function createWithDurationsLD(
        Lockup.CreateWithDurations memory params,
        LockupDynamic.SegmentWithDuration[] memory segments
    ) external returns (uint256) {
        // IMPORTANT CHANGE: We don't use transferFrom here because we're simulating the contract behavior
        // In a mock, we'll just record the call and simulate success

        createWithDurationsLLCalls.push(CreateWithDurationsLLCall({
            sender: params.sender,
            recipient: params.recipient,
            totalAmount: params.totalAmount,
            token: address(params.token),
            cancelable: params.cancelable,
            transferable: params.transferable,
            shape: "linear",  // Hardcoded for simplicity
            cliffDuration: 0, // Hardcoded for simplicity
            totalDuration: segments[0].duration // Using the duration from the first segment
        }));

        createWithDurationsLLCallCount++;
        lastStreamId = nextStreamId;
        return nextStreamId;
    }
}
