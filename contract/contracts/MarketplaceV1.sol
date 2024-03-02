// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@arbitrum/nitro-contracts/src/precompiles/ArbSys.sol";
import {getIPFSCID} from "./libraries/IPFS.sol";

uint256 constant ARBITRUM_NOVA_CHAINID = 0xa4ba;
uint256 constant ARBITRUM_GOERLI_CHAINID = 0x66eed;
uint256 constant ARBITRUM_SEPOLIA_CHAINID = 0x66eee;
// https://github.com/OffchainLabs/arbitrum-classic/blob/master/docs/sol_contract_docs/md_docs/arb-os/arbos/builtin/ArbSys.md
address constant ARBSYS_ADDRESS = address(100);

// tags
// messages

// a discussion thread looks like this:
// object (type jobpost (1 byte), address(20 bytes), index of cid of input text(8 bytes),

struct ObjectJobPost {
    uint8 t;
    uint8 active;
    uint40 owner_obj_idx;
    uint40 title_blob_idx;
    uint40 cid_blob_idx;
    uint40 erc20_obj_idx;
    uint40 amount_obj_idx;
    uint40 time_obj_idx;
}

uint8 constant OBJ_TYPE_JOBPOST = 0x01;

uint8 constant REF_MAGIC_ALL_JOBS = 0x01;
uint8 constant REF_MAGIC_ALL_TAGS = 0x02;

contract MarketplaceV1 is OwnableUpgradeable, PausableUpgradeable {
    address public treasury; // where treasury fees/rewards go

    address public pauser; // who can pause contract

    uint256 public version; // version (should be updated when performing updates)

    // job post
    // 1 byte type
    // 5 bytes blob title
    // 5 bytes blob cid
    // 5 bytes object owner
    // 5 bytes object erc20
    // 5 bytes object amount
    // 5 bytes object time

    // object is the base type
    // all stored objects are a packed struct into object
    uint256[] public objects;

    // generic subscription system, references objects
    // notifications stored here like: [address:u20] => object_id[]
    // job posts stored here like: [tag (object_id)] => object_id[]
    // some magic numbers for general subscriptions:
    // 0xFF means magic
    // 0xFF00 - all jobs posted to here
    // 0xFF01 - all tags posted to here
    mapping(uint256 => uint256[]) public refs;

    // objects can reference blobs via index to here
    bytes[] public blobs;

    uint256[48] __gap; // upgradeable gap

    /// @notice Modifier to restrict to only pauser
    modifier onlyPauser() {
        require(msg.sender == pauser, "not pauser");
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
    event VersionChanged(uint256 indexed version);

    event Notification(address indexed addr, uint256 indexed id);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /// @notice Initialize contract
    /// @dev For upgradeable contracts this function necessary
    /// @param treasury_ Address of treasury
    function initialize(address treasury_) public initializer {
        __Ownable_init(msg.sender);
        __Pausable_init();
        pauser = msg.sender;
        treasury = treasury_;
    }

    /// @notice Transfer ownership
    /// @param to_ Address to transfer ownership to
    function transferOwnership(
        address to_
    ) public override(OwnableUpgradeable) onlyOwner {
        super.transferOwnership(to_);
    }

    /// @notice Transfer pause ability
    /// @param to_ Address to transfer pauser to
    function transferPauser(address to_) external onlyOwner {
        emit PauserTransferred(pauser, to_);
        pauser = to_;
    }

    /// @notice Transfer treasury
    /// @param to_ Address to transfer treasury to
    function transferTreasury(address to_) external onlyOwner {
        emit TreasuryTransferred(treasury, to_);
        treasury = to_;
    }

    /// @notice Pauses contract
    function pause() external onlyPauser {
        _pause();
    }

    /// @notice Unpauses contract
    function unpause() external onlyPauser {
        _unpause();
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

    function objectsLength() public view returns (uint256) {
        return objects.length;
    }

    function refsLength(uint256 id_) public view returns (uint256) {
        return refs[id_].length;
    }

    function blobsLength() public view returns (uint256) {
        return blobs.length;
    }

    /*
    function publishJobPost(
        bytes calldata title_,
        bytes calldata content_,
        IERC20 token_,
        uint256 amount_,
        uint256 time_,
        uint256[] calldata tags_ // indexes of refs[0xFF.REF_MAGIC_ALL_TAGS][idx]
    ) public returns (uint256) {
        objects.push(uint256(uint160(msg.sender)));

        blobs.push(title_);
        objects.push(blobs.length);

        bytes memory cid = getIPFSCID(content_); 
        blobs.push(cid);

        objects.push(uint256(uint160(address(token_))));
        objects.push(amount_);
        objects.push(time_);

        uint256 objects_length = objects.length;
        uint256 blobs_length = blobs.length;

        ObjectJobPost memory obj = ObjectJobPost({
            t:              OBJ_TYPE_JOBPOST,
            active:         0x1,
            owner_obj_idx:  uint40(objects.length - 3),
            title_blob_idx: uint40(blobs_length - 1),
            cid_blob_idx:   uint40(blobs_length),
            erc20_obj_idx:  uint40(objects_length - 2),
            amount_obj_idx: uint40(objects_length - 1),
            time_obj_idx:   uint40(objects_length)
        });
        uint256 obj_num = uint256(bytes32(bytes(obj)));

        objects.push(obj_num);
        refs[REF_MAGIC_ALL_TAGS].push(objects_length + 1);
    }
    */
}
