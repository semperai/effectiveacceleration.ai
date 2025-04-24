// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

contract TreasurySplit is Ownable {
    address public eaccTreasuryAddress;
    address public arbiusTreasuryAddress;
    uint256 public eaccTreasuryPercentage;

    event FundsDistributed(uint256 amount, address indexed eaccTreasuryAddress, address indexed arbiusTreasuryAddress);

    // @notice Constructor
    // @param _eaccTreasuryAddress The address of the EACC treasury.
    // @param _arbiusTreasuryAddress The address of the arbius treasury.
    // @param _eaccTreasuryPercentage The percentage of funds to be sent to the EACC treasury (0-100).
    constructor(
        address _eaccTreasuryAddress,
        address _arbiusTreasuryAddress,
        uint256 _eaccTreasuryPercentage
    ) {
        require(_eaccTreasuryAddress != address(0), "Invalid EACC treasury address");
        require(_arbiusTreasuryAddress != address(0), "Invalid arbius treasury address");
        require(_eaccTreasuryPercentage <= 1 ether, "Percentage must be between 0 and 1 ether");

        eaccTreasuryAddress = _eaccTreasuryAddress;
        arbiusTreasuryAddress = _arbiusTreasuryAddress;
        eaccTreasuryPercentage = _eaccTreasuryPercentage;
    }

    function split(IERC20 _token) external {
        uint256 balance = _token.balanceOf(address(this));
        require(balance > 0, "No funds to distribute");

        uint256 eaccTreasuryAmount = (balance * eaccTreasuryPercentage) / 1 ether;
        uint256 arbiusTreasuryAmount = balance - eaccTreasuryAmount;

        _token.transfer(eaccTreasuryAddress, eaccTreasuryAmount);
        _token.transfer(arbiusTreasuryAddress, arbiusTreasuryAmount);

        emit FundsDistributed(balance, eaccTreasuryAddress, arbiusTreasuryAddress);
    }
}
