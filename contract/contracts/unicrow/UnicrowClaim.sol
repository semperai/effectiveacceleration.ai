// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "./@openzeppelin/contracts/utils/Context.sol";
import "./@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./interfaces/IUnicrowClaim.sol";
import "./interfaces/IUnicrowStakingRewards.sol";
import "./interfaces/IUnicrowClaimRewards.sol";
import "./UnicrowArbitrator.sol";
import "./Unicrow.sol";
import "./UnicrowTypes.sol";

/**
 * @title Contract for managing claims from Unicrow's escrow
 */
contract UnicrowClaim is IUnicrowClaim, Context, ReentrancyGuard {
    /// Reference to the main escrow contract (immutable)
    Unicrow public immutable unicrow;

    /// Reference to the Arbitrator contract (immutable)
    UnicrowArbitrator public immutable unicrowArbitrator;

    IUnicrowClaimRewards public crowRewards;

    IUnicrowStakingRewards public stakingRewards;

    /// Destination address of the protocol fee (governed)
    address public protocolFeeAddress;

    struct ClaimEvent {
        uint escrowId;
        uint[5] amount;
    }

    /// Emitted when multiple escrows are claimed
    /// @param escrows data of all escrows that were claimed
    event ClaimMultiple(ClaimEvent[] escrows);

    /// Emitted when a single escrow payment is claimed
    /// @param escrow data of the claimed escrow
    event Claim(ClaimEvent escrow);

    /**
     * @param unicrow_ main escrow contract
     * @param unicrowArbitrator_ arbitration contract
     * @param protocolFeeAddress_ address to collect protocol fee
     */
    constructor(
        address unicrow_,
        address unicrowArbitrator_,
        address protocolFeeAddress_
    ) {
        unicrow = Unicrow(payable(unicrow_));
        unicrowArbitrator = UnicrowArbitrator(unicrowArbitrator_);
        protocolFeeAddress = protocolFeeAddress_;
    }

    modifier onlyGovernance() {
        require(_msgSender() == unicrow.governanceAddress());
        _;
    }

    /// @inheritdoc IUnicrowClaim
    function updateCrowRewards(
        address crowRewards_
    ) external override onlyGovernance {
        crowRewards = IUnicrowClaimRewards(crowRewards_);
    }

    /// @inheritdoc IUnicrowClaim
    function updateStakingRewards(
        address stakingRewards_
    ) external override onlyGovernance {
        stakingRewards = IUnicrowStakingRewards(stakingRewards_);
    }

    /// @inheritdoc IUnicrowClaim
    function updateProtocolFeeAddress(
        address protocolFeeAddress_
    ) external override onlyGovernance {
        protocolFeeAddress = protocolFeeAddress_;
    }

    /// @inheritdoc IUnicrowClaim
    function claimMultiple(
        uint[] calldata escrows
    ) external override nonReentrant {
        ClaimEvent[] memory events = new ClaimEvent[](escrows.length);

        for (uint256 i = 0; i < escrows.length; ++i) {
            Escrow memory escrow = unicrow.getEscrow(escrows[i]);

            Arbitrator memory arbitratorData = unicrowArbitrator
                .getArbitratorData(escrows[i]);

            require(escrow.claimed == 0, "0-005");

            require(
                (escrow.consensus[WHO_SELLER] >= 1 &&
                    escrow.consensus[WHO_BUYER] >= 1) ||
                    block.timestamp > escrow.challengePeriodEnd,
                "0-006"
            );

            uint16[5] memory calculatedSplits = calculateSplits(
                arbitratorData,
                escrow
            );

            uint256[5] memory payments = calculatePayments(
                escrow.amount,
                calculatedSplits
            );

            address[5] memory addresses = [
                escrow.buyer,
                escrow.seller,
                escrow.marketplace,
                address(protocolFeeAddress),
                arbitratorData.arbitrator
            ];

            claimPayments(escrows[i], payments, addresses, escrow.currency);

            if (
                address(crowRewards) != address(0) && payments[WHO_PROTOCOL] > 0
            ) {
                crowRewards.distribute(
                    escrow.currency,
                    escrow.buyer,
                    escrow.seller,
                    payments[WHO_PROTOCOL]
                );
            }

            if (
                address(stakingRewards) != address(0) &&
                payments[WHO_PROTOCOL] > 0
            ) {
                stakingRewards.collectFee(
                    escrow.currency,
                    payments[WHO_PROTOCOL]
                );
            }

            events[i] = ClaimEvent(escrows[i], payments);
        }

        emit ClaimMultiple(events);
    }

    /// @inheritdoc IUnicrowClaim
    function claim(
        uint escrowId
    ) external override nonReentrant returns (uint256[5] memory) {
        Escrow memory escrow = unicrow.getEscrow(escrowId);

        Arbitrator memory arbitratorData = unicrowArbitrator.getArbitratorData(
            escrowId
        );

        // Check that the payment hasn't been claimed yet
        require(escrow.claimed == 0, "0-005");

        // Make sure both parties consented to releasing the payment from the escrow
        require(
            (escrow.consensus[WHO_SELLER] >= 1 &&
                escrow.consensus[WHO_BUYER] >= 1) ||
                block.timestamp > escrow.challengePeriodEnd,
            "0-006"
        );

        // Calculate final splits (in bips) from gross splits
        uint16[5] memory calculatedSplits = calculateSplits(
            arbitratorData,
            escrow
        );

        // Calculate amounts to be sent in the token
        uint256[5] memory payments = calculatePayments(
            escrow.amount,
            calculatedSplits
        );

        // Prepare list of addresses for the withdrawals
        address[5] memory addresses = [
            escrow.buyer,
            escrow.seller,
            escrow.marketplace,
            address(protocolFeeAddress),
            arbitratorData.arbitrator
        ];

        // Send the shares to the addresses
        claimPayments(escrowId, payments, addresses, escrow.currency);

        if (address(crowRewards) != address(0) && payments[WHO_PROTOCOL] > 0) {
            crowRewards.distribute(
                escrow.currency,
                escrow.buyer,
                escrow.seller,
                payments[WHO_PROTOCOL]
            );
        }

        if (
            address(stakingRewards) != address(0) && payments[WHO_PROTOCOL] > 0
        ) {
            stakingRewards.collectFee(escrow.currency, payments[WHO_PROTOCOL]);
        }

        // Emit the event incl. final amounts
        emit Claim(ClaimEvent(escrowId, payments));

        // Return the final amounts
        return [
            payments[WHO_BUYER],
            payments[WHO_SELLER],
            payments[WHO_MARKETPLACE],
            payments[WHO_PROTOCOL],
            payments[WHO_ARBITRATOR]
        ];
    }

    /**
     * @dev Calculates how the balance in the escrow should be split between all the relevant parties
     * @param arbitrator Arbitrator information is not part of core escrow data, so data is provided separately here
     * @param escrow Escrow information
     */
    function calculateSplits(
        Arbitrator memory arbitrator,
        Escrow memory escrow
    ) internal view returns (uint16[5] memory) {
        uint16[5] memory split;

        // if the arbitrator was set, read their fee, otherwise set to 0
        bool arbitratorConsensus = arbitrator.buyerConsensus &&
            arbitrator.sellerConsensus;
        uint16 arbitratorFee = arbitratorConsensus
            ? arbitrator.arbitratorFee
            : 0;

        // The calculation will differ slightly based on whether the payment was decided by an arbitrator or not
        if (arbitrator.arbitrated) {
            split = unicrowArbitrator.arbitrationCalculation(
                [
                    escrow.split[WHO_BUYER],
                    escrow.split[WHO_SELLER],
                    escrow.split[WHO_MARKETPLACE],
                    escrow.split[WHO_PROTOCOL],
                    arbitratorFee
                ]
            );
        } else {
            split = unicrow.splitCalculation(
                [
                    escrow.split[WHO_BUYER],
                    escrow.split[WHO_SELLER],
                    escrow.split[WHO_MARKETPLACE],
                    escrow.split[WHO_PROTOCOL],
                    arbitratorFee
                ]
            );
        }

        return split;
    }

    /**
     * @dev Calculates actual amounts that should be sent to the parties
     * @param amount payment amount in escrow (in token)
     * @param split final splits
     */
    function calculatePayments(
        uint amount,
        uint16[5] memory split
    ) internal pure returns (uint256[5] memory) {
        uint256[5] memory payments;

        // Multiply all the splits by the total amount
        payments[WHO_BUYER] =
            (uint256(split[WHO_BUYER]) * amount) /
            _100_PCT_IN_BIPS;
        payments[WHO_SELLER] =
            (uint256(split[WHO_SELLER]) * amount) /
            _100_PCT_IN_BIPS;
        payments[WHO_MARKETPLACE] =
            (uint256(split[WHO_MARKETPLACE]) * amount) /
            _100_PCT_IN_BIPS;

        // If the arbitrator decided the payment, they get their full fee
        // in such case, buyer's or seller split was reduced in the calling function)
        payments[WHO_ARBITRATOR] =
            (uint256(split[WHO_ARBITRATOR]) * amount) /
            _100_PCT_IN_BIPS;

        // The rest of the amount goes to the protocol
        payments[WHO_PROTOCOL] =
            amount -
            payments[WHO_BUYER] -
            payments[WHO_SELLER] -
            payments[WHO_MARKETPLACE] -
            payments[WHO_ARBITRATOR];

        return payments;
    }

    /**
     * @dev Sends payments to the addresses of all the eligible parties
     * @param escrowId Id of the escrow
     * @param amounts amounts in token to claimMultiple
     * @param addresses destination addresses for each claimed share
     * @param currency address of the payment token
     */
    function claimPayments(
        uint escrowId,
        uint[5] memory amounts,
        address[5] memory addresses,
        address currency
    ) internal {
        unicrow.setClaimed(escrowId);

        for (uint256 i = 0; i < 5; ++i) {
            if (amounts[i] > 0) {
                unicrow.sendEscrowShare(addresses[i], amounts[i], currency);
            }
        }
    }
}
