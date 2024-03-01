// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@arbitrum/nitro-contracts/src/precompiles/ArbSys.sol";
import {getIPFSCID} from "./libraries/IPFS.sol";

uint256 constant ARBITRUM_NOVA_CHAINID = 0xa4ba;
uint256 constant ARBITRUM_GOERLI_CHAINID = 0x66eed;
uint256 constant ARBITRUM_SEPOLIA_CHAINID = 0x66eee;
// https://github.com/OffchainLabs/arbitrum-classic/blob/master/docs/sol_contract_docs/md_docs/arb-os/arbos/builtin/ArbSys.md
address constant ARBSYS_ADDRESS = address(100);

contract MarketplaceV1 is OwnableUpgradeable {
    address public treasury; // where treasury fees/rewards go

    address public pauser; // who can pause contract

    bool public paused; // if contract is paused

    uint256 public version; // version (should be updated when performing updates)

    uint256[48] __gap; // upgradeable gap

    /// @notice Modifier to restrict to only pauser
    modifier onlyPauser() {
        require(msg.sender == pauser, "not pauser");
        _;
    }

    /// @notice Modifier to restrict to only not paused
    modifier notPaused() {
        require(!paused, "paused");
        _;
    }

    event PauserTransferred(
        address indexed previousPauser,
        address indexed newPauser
    );
    event TreasuryTransferred(
        address indexed previousTreasury,
        address indexed newTreasury
    );
    event PausedChanged(bool indexed paused);
    event VersionChanged(uint256 indexed version);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /// @notice Initialize contract
    /// @dev For upgradeable contracts this function necessary
    /// @param treasury_ Address of treasury
    function initialize(address treasury_) public initializer {
        __Ownable_init();
        treasury = treasury_;
        pauser = msg.sender;
    }

    /// @notice Transfer ownership
    /// @param to_ Address to transfer ownership to
    function transferOwnership(
        address to_
    ) public override(OwnableUpgradeable) onlyOwner {
        super.transferOwnership(to_);
    }

    /// @notice Transfer treasury
    /// @param to_ Address to transfer treasury to
    function transferTreasury(address to_) external onlyOwner {
        emit TreasuryTransferred(treasury, to_);
        treasury = to_;
    }

    /// @notice Transfer ownership
    /// @param to_ Address to transfer pauser to
    function transferPauser(address to_) external onlyOwner {
        emit PauserTransferred(pauser, to_);
        pauser = to_;
    }

    /// @notice Pause/unpause contract
    /// @param paused_ Whether to pause or unpause
    function setPaused(bool paused_) external onlyPauser {
        paused = paused_;
        emit PausedChanged(paused_);
    }

    /// @notice Set version
    /// @param version_ Version of contract
    /// @dev This is used for upgrades to inform miners of changes
    function setVersion(uint256 version_) external onlyOwner {
        version = version_;
        emit VersionChanged(version_);
    }

    /// @notice Get IPFS cid
    /// @dev use this for testing
    /// @param content_ Content to get IPFS cid of
    /// @return
    function generateIPFSCID(
        bytes calldata content_
    ) external pure returns (bytes memory) {
        return getIPFSCID(content_);
    }

    /// @notice Get block number (on both arbitrum and l1)
    /// @return Block number
    function getBlockNumberNow() internal view returns (uint256) {
        uint256 id;
        assembly {
            id := chainid()
        }

        if (
            id == ARBITRUM_NOVA_CHAINID ||
            id == ARBITRUM_GOERLI_CHAINID ||
            id == ARBITRUM_SEPOLIA_CHAINID
        ) {
            return ArbSys(ARBSYS_ADDRESS).arbBlockNumber();
        }

        return block.number;
    }
}
