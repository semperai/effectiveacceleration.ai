// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ud2x18} from "@prb/math/src/UD2x18.sol";
import {ud60x18, ud, unwrap} from "@prb/math/src/UD60x18.sol";
import {exp} from "@prb/math/src/ud60x18/Math.sol";
import {ISablierLockup} from "@sablier/lockup/src/interfaces/ISablierLockup.sol";
import {Broker, Lockup, LockupDynamic} from "@sablier/lockup/src/types/DataTypes.sol";

contract EACCToken is ERC20, ERC20Permit, Ownable {
    IERC20 public eaccBar;
    uint256 public eaccBarPercent; // how much of the converted EACC goes to eaccBar
    ISablierLockup public lockup;

    uint256 public R; // base rate
    uint256 public K; // booster
    uint64 public E; // exponent for stream

    event EACCBarSet(IERC20 eaccBar);
    event EACCBarPercentSet(uint256 eaccBarPercent);
    event LockupSet(ISablierLockup lockup);

    event RSet(uint256 r);
    event KSet(uint256 k);
    event ESet(uint64 e);

    /// @notice Constructor
    /// @param _name the name of the token
    /// @param _symbol the symbol of the token
    /// @param _initialSupply the initial supply of the token
    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _initialSupply,
        ISablierLockup _lockup
    ) ERC20(_name, _symbol) ERC20Permit(_name) Ownable(msg.sender) {
        _mint(msg.sender, _initialSupply);
        eaccBarPercent = 0.2 ether; // 20% of converted EACC
        lockup = _lockup;
        _approve(address(this), address(_lockup), type(uint256).max);
        R = 6969696969;
        K = 69;
        E = 1.5 ether;
    }

    /// @notice Sets the EACCBar contract
    /// @dev eaccBar receives tokens when the user creates a stream
    /// @param _eaccBar the address of the EACCBar contract
    function setEACCBar(IERC20 _eaccBar) external onlyOwner {
        eaccBar = _eaccBar;
        emit EACCBarSet(_eaccBar);
    }

    /// @notice Sets the EACCBar percent
    /// @param _eaccBarPercent the percent of the converted EACC that goes to eaccBar
    function setEACCBarPercent(uint256 _eaccBarPercent) external onlyOwner {
        require(_eaccBarPercent <= 1 ether, "EACCToken: Invalid percent");
        eaccBarPercent = _eaccBarPercent;
        emit EACCBarPercentSet(_eaccBarPercent);
    }

    // @notice Sets the lockup contract
    // @dev The lockup contract is used to create streams
    // @param _lockup The address of the lockup contract
    function setLockup(ISablierLockup _lockup) external onlyOwner {
        lockup = _lockup;
        _approve(address(this), address(_lockup), type(uint256).max);
        emit LockupSet(_lockup);
    }

    /// @notice Sets the exponent for the multiplier
    /// @param _v the exponent for the multiplier
    function setR(uint256 _v) external onlyOwner {
        R = _v;
        emit RSet(R);
    }

    /// @notice Sets the boost exponent for the multiplier
    /// @param _v the boost exponent for the multiplier
    function setK(uint256 _v) external onlyOwner {
        K = _v;
        emit KSet(K);
    }

    /// @notice Sets the exponent for the stream
    /// @param _v the exponent for the stream
    function setE(uint256 _v) external onlyOwner {
        E = uint64(_v);
        emit ESet(E);
    }

    // @notice M(t) = e^(R*t + K*t^2)
    // @dev M(t) is the multiplier for the amount of EACC you receive
    // @param _tSeconds The time in seconds
    // @return m The multiplier
    function M(uint256 _tSeconds) public view returns (uint256 m) {
        uint256 rt = R * _tSeconds;

        // K*t²
        uint256 tSquared = _tSeconds * _tSeconds;
        uint256 ktSquared = K * tSquared;

        // R*t + K*t²
        uint256 exponent = rt + ktSquared;

        // e^exponent
        m = unwrap(exp(ud(exponent)));
    }

    // @notice Burns tokens to create a stream
    // @dev This function is used to create a stream
    // @param _amount The amount of EACC to stake
    // @param _tSeconds The time in seconds for the stream
    // @return streamId The id of the stream created
    function depositForStream(
        uint256 _amount,
        uint256 _tSeconds
    ) external returns (uint256 streamId) {
        require(_amount > 0, "EACCToken::depositForStream: Cannot stake 0");
        require(
            _tSeconds >= 1 weeks && _tSeconds <= 208 weeks,
            "EACCToken::depositForStream: Invalid time"
        );
        require(
            address(eaccBar) != address(0),
            "EACCToken::depositForStream: eaccBar not set"
        );

        uint256 eaccBarAmount = (_amount * eaccBarPercent) / 1 ether;
        uint256 burnAmount = _amount - eaccBarAmount;

        _burn(msg.sender, burnAmount);
        _transfer(msg.sender, address(eaccBar), eaccBarAmount);

        uint256 mintAmount = (_amount * M(_tSeconds)) / 1 ether;
        _mint(address(this), mintAmount);

        Lockup.CreateWithDurations memory params;

        LockupDynamic.SegmentWithDuration[]
            memory segments = new LockupDynamic.SegmentWithDuration[](1);
        segments[0] = LockupDynamic.SegmentWithDuration({
            amount: uint128(mintAmount),
            duration: uint40(_tSeconds),
            exponent: ud2x18(E)
        });

        params.sender = address(this);
        params.recipient = msg.sender;
        params.totalAmount = uint128(mintAmount);
        params.token = IERC20(address(this));
        params.cancelable = false;
        params.transferable = true;
        params.broker = Broker(address(0), ud60x18(0));

        streamId = lockup.createWithDurationsLD(params, segments);
    }

    /// @notice Multitransfer function
    /// @dev This function is used to transfer tokens to multiple addresses
    /// @param recipients the recipients
    /// @param amounts the amounts
    function multitransfer(
        address[] calldata recipients,
        uint256[] calldata amounts
    ) external {
        require(recipients.length == amounts.length, "Invalid length");

        for (uint256 i = 0; i < recipients.length; ) {
            _transfer(msg.sender, recipients[i], amounts[i]);
            unchecked {
                i++;
            }
        }
    }
}
