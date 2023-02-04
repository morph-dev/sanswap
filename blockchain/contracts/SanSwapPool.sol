// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./Math.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract SanSwapPool is ERC20 {
    address public tokenA;
    address public tokenB;
    address public tokenC;

    uint128 public reserveA;
    uint128 public reserveB;
    uint128 public reserveC;

    event Mint(
        address indexed sender,
        address indexed to,
        uint liquidity,
        uint amountA,
        uint amountB,
        uint amountC
    );
    event Burn(
        address indexed sender,
        address indexed to,
        uint liquidity,
        uint amountA,
        uint amountB,
        uint amountC
    );
    event Swap(
        address indexed sender,
        address indexed to,
        uint amountAIn,
        uint amountBIn,
        uint amountCIn,
        uint amountAOut,
        uint amountBOut,
        uint amountCOut
    );

    constructor(
        string memory name,
        string memory symbol,
        address _tokenA,
        address _tokenB,
        address _tokenC
    ) ERC20(name, symbol) {
        tokenA = _tokenA;
        tokenB = _tokenB;
        tokenC = _tokenC;
    }

    function reserves() external view returns (uint128, uint128, uint128) {
        return (reserveA, reserveB, reserveC);
    }

    function _transferOut(address token, address to, uint amount) private {
        if (amount > 0) {
            bool success = IERC20(token).transfer(to, amount);
            require(success, "SanSwapPool: TRANSFER FAILED");
        }
    }

    function _updateReserves(uint balanceA, uint balanceB, uint balanceC) private {
        require(
            balanceA <= type(uint128).max &&
                balanceB <= type(uint128).max &&
                balanceC <= type(uint128).max,
            "SanSwapPool: BALANCE OVERFLOW"
        );
        reserveA = uint128(balanceA);
        reserveB = uint128(balanceB);
        reserveC = uint128(balanceC);
    }

    function mint(address to) external returns (uint liquidity) {
        uint balanceA = IERC20(tokenA).balanceOf(address(this));
        uint balanceB = IERC20(tokenB).balanceOf(address(this));
        uint balanceC = IERC20(tokenC).balanceOf(address(this));
        uint amountA = balanceA - reserveA;
        uint amountB = balanceB - reserveB;
        uint amountC = balanceC - reserveC;

        uint _totalSupply = totalSupply();
        if (_totalSupply == 0) {
            liquidity = (amountA + amountB + amountC) / 3;
        } else {
            liquidity = Math.min3(
                (amountA * _totalSupply) / reserveA,
                (amountB * _totalSupply) / reserveB,
                (amountC * _totalSupply) / reserveC
            );
        }

        require(liquidity > 0, "SanSwapPool: ZERO MINTING");
        _mint(to, liquidity);

        _updateReserves(balanceA, balanceB, balanceC);
        emit Mint(msg.sender, to, liquidity, amountA, amountB, amountC);
    }

    function burn(address to) external returns (uint amountA, uint amountB, uint amountC) {
        uint balanceA = IERC20(tokenA).balanceOf(address(this));
        uint balanceB = IERC20(tokenB).balanceOf(address(this));
        uint balanceC = IERC20(tokenC).balanceOf(address(this));

        uint liquidity = balanceOf(address(this));
        uint _totalSupply = totalSupply();

        amountA = (balanceA * liquidity) / _totalSupply;
        amountB = (balanceB * liquidity) / _totalSupply;
        amountC = (balanceC * liquidity) / _totalSupply;

        require(amountA > 0 && amountB > 0 && amountC > 0, "SanSwapPool: ZERO BURNING");

        _burn(address(this), liquidity);

        _transferOut(tokenA, to, amountA);
        _transferOut(tokenB, to, amountB);
        _transferOut(tokenC, to, amountC);

        balanceA = IERC20(tokenA).balanceOf(address(this));
        balanceB = IERC20(tokenB).balanceOf(address(this));
        balanceC = IERC20(tokenC).balanceOf(address(this));

        _updateReserves(balanceA, balanceB, balanceC);
        emit Burn(msg.sender, to, liquidity, amountA, amountB, amountC);
    }

    function _verifyBalancesAfterSwap(uint balanceA, uint balanceB, uint balanceC) private view {
        (uint oldR0, uint oldR1) = Math.mul512(uint(reserveA) * reserveB, reserveC);
        (uint newR0, uint newR1) = Math.mul512(balanceA * balanceB, balanceC);
        bool valid = oldR1 < newR1 || (oldR1 == newR1 && oldR0 <= newR0);
        require(valid, "SanSwapPool: INVALID A*B*C");
    }

    function swap(address to, uint amountAOut, uint amountBOut, uint amountCOut) external {
        require(
            amountAOut > 0 || amountBOut > 0 || amountCOut > 0,
            "SanSwapPool: INVALID OUT AMOUNT"
        );

        // Optimistically transfer out
        _transferOut(tokenA, to, amountAOut);
        _transferOut(tokenB, to, amountBOut);
        _transferOut(tokenC, to, amountCOut);

        uint balanceA = IERC20(tokenA).balanceOf(address(this));
        uint balanceB = IERC20(tokenB).balanceOf(address(this));
        uint balanceC = IERC20(tokenC).balanceOf(address(this));

        uint amountAIn = balanceA + amountAOut > reserveA ? balanceA + amountAOut - reserveA : 0;
        uint amountBIn = balanceB + amountBOut > reserveB ? balanceB + amountBOut - reserveB : 0;
        uint amountCIn = balanceC + amountCOut > reserveC ? balanceC + amountCOut - reserveC : 0;

        require(amountAIn > 0 || amountBIn > 0 || amountCIn > 0, "SanSwapPool INVALID IN AMOUNT");

        {
            // prevent "Stack too deep"
            uint adjustedBalanceA = 1 + (balanceA * 1000 - (amountAIn * 3)) / 1000;
            uint adjustedBalanceB = 1 + (balanceB * 1000 - (amountBIn * 3)) / 1000;
            uint adjustedBalanceC = 1 + (balanceC * 1000 - (amountCIn * 3)) / 1000;

            _verifyBalancesAfterSwap(adjustedBalanceA, adjustedBalanceB, adjustedBalanceC);
        }

        _updateReserves(balanceA, balanceB, balanceC);
        emit Swap(
            msg.sender,
            to,
            amountAIn,
            amountBIn,
            amountCIn,
            amountAOut,
            amountBOut,
            amountCOut
        );
    }
}
