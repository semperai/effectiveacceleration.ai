// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import {ERC20Votes} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import {Nonces} from "@openzeppelin/contracts/utils/Nonces.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract EACCToken is ERC20, ERC20Permit, ERC20Votes, Ownable {
    // where the transfer taxes go
    address public treasury;

    // our pair token
    IERC20 public arbiusToken;

    // uniswap router
    IUniswapV2Router02 public router;

    // tax (between 0 and 1eth : 0% - 100%)
    uint256 public tax;

    // remove these addresses from tax
    mapping(address => bool) public whitelist;

    // disable tax during swap
    bool private lock;

    // minimum amount for swap
    uint256 public minimumTokensBeforeSwap;

    event TaxSet(uint256 tax);
    event TokenWithdrawn(address indexed addr, address indexed token, uint256 amount);
    event WhitelistUpdated(address indexed addr, bool whitelisted);
    event MinimumTokensBeforeSwapUpdated(uint256 amount);

    modifier lockSwap {
        require(!lock, "Swap locked");
        lock = true;
        _;
        lock = false;
    }

    /// @notice Constructor
    /// @param _name the name of the token
    /// @param _symbol the symbol of the token
    /// @param _initialSupply the initial supply of the token
    /// @param _treasury the treasury address
    /// @param _arbiusToken the arbius token address
    /// @param _router the uniswap router address
    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _initialSupply,
        address _treasury,
        address _arbiusToken,
        address _router
    ) ERC20(_name, _symbol) ERC20Permit(_name) Ownable(msg.sender) {
        treasury = _treasury;
        arbiusToken = IERC20(_arbiusToken);
        router = IUniswapV2Router02(_router);

        // add the owner to the whitelist
        whitelist[msg.sender] = true;
        whitelist[address(this)] = true;
        whitelist[treasury] = true;

        // Set minimum tokens before swap (e.g., 0.1% of total supply)
        minimumTokensBeforeSwap = _initialSupply / 1000;

        tax = 0.99 ether; // 99% tax

        // mint the initial supply
        _mint(msg.sender, _initialSupply);

        // approve the router to spend the token
        _approve(address(this), address(router), type(uint256).max);
    }

    /// @notice Sets the minimum tokens acquired before swapping
    /// @dev This is to prevent swapping small amounts of tokens
    /// @param _amount the amount of tokens
    function setMinimumTokensBeforeSwap(uint256 _amount) external onlyOwner {
        minimumTokensBeforeSwap = _amount;
        emit MinimumTokensBeforeSwapUpdated(_amount);
    }

    /// @notice Sets the tax
    /// @dev 0 is no tax, 1ether is 100% tax
    /// @param _tax the new tax
    function setTax(uint256 _tax) public onlyOwner {
        require(_tax <= 1 ether, "Tax must be less than 1 ether");
        tax = _tax;
        emit TaxSet(_tax);
    }

    /// @notice Withdraws tokens from the contract to the treasury
    /// @param _token the token to withdraw
    function withdraw(address _token) public {
        IERC20 token = IERC20(_token);
        uint256 balance = token.balanceOf(address(this));
        token.transfer(treasury, balance);
        emit TokenWithdrawn(msg.sender, _token, balance);
    }

    /// @notice Updates the whitelist
    /// @param _addr the address to update
    /// @param _whitelisted the new value
    function updateWhitelist(address _addr, bool _whitelisted) public onlyOwner {
        require(_addr != address(0), "Invalid address");
        whitelist[_addr] = _whitelisted;
        emit WhitelistUpdated(_addr, _whitelisted);
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

    /// @notice Used to convert the tax to arbius
    /// @param _amount the amount to convert
    function swapTokensForAius(uint256 _amount) internal lockSwap {
        require(_amount > 0, "Amount must be greater than 0");
        require(
            _amount >= minimumTokensBeforeSwap,
            "Amount less than minimum required for swap"
        );

        // Generate the uniswap pair path of token -> AIUS
        address[] memory path = new address[](2);
        path[0] = address(this);
        path[1] = address(arbiusToken);

        try router.swapExactTokensForTokens(
            _amount,
            0, // Accept any amount of aius
            path,
            treasury,
            block.timestamp
        ) returns (uint256[] memory) {
            // Swap successful
        } catch {
            // If swap fails, keep the tokens in the contract for manual withdrawal
        }
    }

    /// @notice Overrides the _update function to add tax
    /// @param _from the sender
    /// @param _to the receiver
    /// @param _amount the amount to transfer
    function _update(
        address _from,
        address _to,
        uint256 _amount
    ) internal virtual override(ERC20, ERC20Votes) {
        if (
            lock ||
            tax == 0 ||
            whitelist[_from] ||
            whitelist[_to] ||
            _from == address(0) || // Skip tax on minting
            _to == address(0)      // Skip tax on burning
        ) {
            super._update(_from, _to, _amount);
            return;
        }

        uint256 taxAmount = (_amount * tax) / 1 ether;
        uint256 transferAmount = _amount - taxAmount;

        // First perform the normal transfer
        super._update(_from, _to, transferAmount);

        if (taxAmount > 0) {
            // Then collect the tax
            super._update(_from, address(this), taxAmount);

            // Only swap if we've accumulated enough tokens
            uint256 contractBalance = balanceOf(address(this));
            if (contractBalance >= minimumTokensBeforeSwap) {
                swapTokensForAius(contractBalance);
            }
        }
    }

    /// @notice Required for ERC20Permit
    /// @param owner_ the owner
    /// @return the nonces
    function nonces(
        address owner_
    ) public view override(ERC20Permit, Nonces) returns (uint256) {
        return super.nonces(owner_);
    }
}
