// SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { IERC20Metadata } from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import { ERC20Permit } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ud2x18 } from "@prb/math/src/UD2x18.sol";
import { ud60x18, ud, unwrap } from "@prb/math/src/UD60x18.sol";
import { exp } from "@prb/math/src/ud60x18/Math.sol";
import { ISablierLockup } from "@sablier/lockup/src/interfaces/ISablierLockup.sol";
import { Broker, Lockup, LockupDynamic } from "@sablier/lockup/src/types/DataTypes.sol";


// Based on SushiBar
// Instead of getting EAXX directly, you receive a stream of EAXX with a multiplier based on lockup time
contract EACCBar is ERC20, ERC20Permit, Ownable {
    IERC20 public eacc;
    ISablierLockup public lockup;

    uint256 public R = 9696969696; // base rate
    uint256 public K = 33; // booster
    uint64 public E = 6e18; // exponent for stream

    event LockupSet(ISablierLockup lockup);

    event RSet(uint256 r);
    event KSet(uint256 k);
    event ESet(uint64 e);

    event Enter(address indexed user, uint256 amount, uint256 tSeconds, uint256 indexed streamId);
    event Leave(address indexed user, uint256 amount, uint256 share);

    constructor(IERC20 _eacc, ISablierLockup _lockup) ERC20("Staked EACC", "EAXX") ERC20Permit("Staked EACC") Ownable(msg.sender) {
        eacc = _eacc;
        lockup = _lockup;
        eacc.approve(address(lockup), type(uint256).max);
        R = 9696969696;
        K = 33;
        E = 3e18;
    }

    // @dev The lockup contract is used to create streams
    // @param _lockup The address of the lockup contract
    function setLockup(ISablierLockup _lockup) external onlyOwner {
        lockup = _lockup;
        eacc.approve(address(lockup), type(uint256).max);
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
    function setE(uint64 _v) external onlyOwner {
        E = uint64(_v);
        emit ESet(E);
    }

    // @notice M(t) = e^(R*t + K*t^2)
    // @dev M(t) is the multiplier for the amount of EAXX you receive based on the time you lockup your EACC
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

    // @notice Sets the lockup contract

    // @notice Enter the bar. Pay some EACC. Earn some shares.
    // @dev Locks EACC and mints EAXX
    // @param _amount The amount of EACC to stake
    // @param _tSeconds The time in seconds to lockup the EACC
    // @return streamId The id of the stream created
    function enter(uint256 _amount, uint256 _tSeconds) external returns (uint256 streamId) {
        require(_amount > 0, "EAXXBar::enter: Cannot stake 0");
        require(_tSeconds >= 52 weeks && _tSeconds <= 208 weeks, "EAXXBar::enter: Invalid time");

        // Gets the amount of EACC locked in the contract
        uint256 totalEACC = eacc.balanceOf(address(this));
        // Gets the amount of EAXX in existence
        uint256 totalShares = totalSupply();
        // If no EAXX exists, mint it 1:1 to the amount put in
        if (totalShares == 0 || totalEACC == 0) {
            _mint(msg.sender, _amount);
        } else {
            // Calculate and mint the amount of EAXX the EACC is worth.
            // The ratio will change overtime,
            // as EAXX is burned/minted and EACC deposited + gained from fees / withdrawn.
            uint256 what = _amount * totalShares / totalEACC;

            // Calculate the multiplier based on lockup time
            what = what * M(_tSeconds) / 1 ether;

            _mint(address(this), what);

            Lockup.CreateWithDurations memory params;

            LockupDynamic.SegmentWithDuration[] memory segments = new LockupDynamic.SegmentWithDuration[](1);
            segments[0] = LockupDynamic.SegmentWithDuration({
                amount: uint128(what),
                duration: uint40(_tSeconds),
                exponent: ud2x18(E)
            });

            params.sender = msg.sender;
            params.recipient = msg.sender;
            params.totalAmount = uint128(what);
            params.token = IERC20(this);
            params.cancelable = false;
            params.transferable = true;
            params.broker = Broker(address(0), ud60x18(0));

            streamId = lockup.createWithDurationsLD(params, segments);
        }

        // Lock the EACC in the contract
        eacc.transferFrom(msg.sender, address(this), _amount);
        emit Enter(msg.sender, _amount, _tSeconds, streamId);
    }

    // @notice Leave the bar. Claim back your EACC.
    // @dev Unlocks the staked + gained EACC and burns EAXX
    // @param _share The amount of EAXX to burn
    function leave(uint256 _share) external {
        // Gets the amount of EAXX in existence
        uint256 totalShares = totalSupply();
        // Calculates the amount of EACC the EAXX is worth
        uint256 what = _share * eacc.balanceOf(address(this)) / totalShares;
        _burn(msg.sender, _share);
        eacc.transfer(msg.sender, what);
        emit Leave(msg.sender, what, _share);
    }
}
