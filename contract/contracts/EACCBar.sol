// SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { ud2x18 } from "@prb/math/src/UD2x18.sol";
import { ud60x18, ud, unwrap } from "@prb/math/src/UD60x18.sol";
import { exp } from "@prb/math/src/ud60x18/Math.sol";
import { ISablierLockup } from "@sablier/lockup/src/interfaces/ISablierLockup.sol";
import { Broker, Lockup, LockupDynamic } from "@sablier/lockup/src/types/DataTypes.sol";


// Based on SushiBar
// Instead of getting EAXX directly, you receive a stream of EAXX with a multiplier based on lockup time
contract EACCBar is ERC20("Staked EACC", "EAXX") {
    IERC20 public eacc;
    ISablierLockup public lockup;

    uint256 constant R = 9696969696; // base rate
    uint256 constant K = 33; // booster
    uint64 constant E = 6e18; // exponent for stream

    event Enter(address indexed user, uint256 amount, uint256 tSeconds, uint256 indexed streamId);
    event Leave(address indexed user, uint256 amount, uint256 share);

    constructor(IERC20 _eacc, ISablierLockup _lockup) {
        eacc = _eacc;
        lockup = _lockup;
        eacc.approve(address(lockup), type(uint256).max);
    }

    // @notice M(t) = e^(R*t + K*t^2)
    // @dev M(t) is the multiplier for the amount of EAXX you receive based on the time you lockup your EACC
    // @param _tSeconds The time in seconds
    // @return m The multiplier
    function M(uint256 _tSeconds) public pure returns (uint256 m) {
        uint256 rt = R * _tSeconds;

        // K*t²
        uint256 tSquared = _tSeconds * _tSeconds;
        uint256 ktSquared = K * tSquared;

        // R*t + K*t²
        uint256 exponent = rt + ktSquared;

        // e^exponent
        m = unwrap(exp(ud(exponent)));
    }

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
