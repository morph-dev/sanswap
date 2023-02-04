// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./Math.sol";
import "./Ordering.sol";
import "./SanSwapFactory.sol";
import "./SanSwapLibrary.sol";
import "./SanSwapPool.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract SanSwapRouter {
    SanSwapFactory public factory;

    constructor(address _factory) {
        factory = SanSwapFactory(_factory);
    }

    // UTILITY

    function _getPoolAndOrder(
        address token1,
        address token2,
        address token3
    ) private view returns (SanSwapPool pool, Ordering.Order memory order) {
        address poolAddress = factory.pool(token1, token2, token3);
        require(poolAddress != address(0), "SanSwapRouter: POOL NOT FOUND");

        pool = SanSwapPool(poolAddress);
        order = Ordering.orderOf(token1, token2, token3);
    }

    function _getReserves(
        SanSwapPool pool,
        Ordering.Order memory order
    ) private view returns (uint, uint, uint) {
        (uint reserveA, uint reserveB, uint reserveC) = pool.reserves();
        return Ordering.reverseUint(order, reserveA, reserveB, reserveC);
    }

    // ADD LIQUIDITY

    function _getOptimalAddLiquidity(
        SanSwapPool pool,
        address token1,
        address token2,
        address token3,
        uint amountDesired1,
        uint amountDesired2,
        uint amountDesired3
    ) private view returns (uint, uint, uint) {
        (uint reserve1, uint reserve2, uint reserve3) = _getReserves(
            pool,
            Ordering.orderOf(token1, token2, token3)
        );
        return
            SanSwapLibrary.optimalAddLiquidity(
                pool.totalSupply(),
                reserve1,
                reserve2,
                reserve3,
                amountDesired1,
                amountDesired2,
                amountDesired3
            );
    }

    function addLiquidity(
        address to,
        address token1,
        address token2,
        address token3,
        uint amountDesired1,
        uint amountDesired2,
        uint amountDesired3
    ) external {
        address poolAddress = factory.pool(token1, token2, token3);
        if (poolAddress == address(0)) {
            poolAddress = factory.createPool(token1, token2, token3);
        }
        SanSwapPool pool = SanSwapPool(poolAddress);
        (uint optimal1, uint optimal2, uint optimal3) = _getOptimalAddLiquidity(
            pool,
            token1,
            token2,
            token3,
            amountDesired1,
            amountDesired2,
            amountDesired3
        );

        IERC20(token1).transferFrom(msg.sender, poolAddress, optimal1);
        IERC20(token2).transferFrom(msg.sender, poolAddress, optimal2);
        IERC20(token3).transferFrom(msg.sender, poolAddress, optimal3);

        pool.mint(to);
    }

    // REMOVE LIQUIDITY

    function removeLiquidity(address to, address poolAddress, uint poolTokenAmount) external {
        SanSwapPool pool = SanSwapPool(poolAddress);
        pool.transferFrom(msg.sender, poolAddress, poolTokenAmount);
        pool.burn(to);
    }

    // SWAPS

    function _swap(
        SanSwapPool pool,
        address to,
        Ordering.Order memory order,
        uint amountOut1,
        uint amountOut2,
        uint amountOut3
    ) private {
        (uint amountOutA, uint amountOutB, uint amountOutC) = Ordering.reorderUint(
            order,
            amountOut1,
            amountOut2,
            amountOut3
        );

        pool.swap(to, amountOutA, amountOutB, amountOutC);
    }

    function swap(
        address to,
        address token1,
        address token2,
        address token3,
        uint amountIn1,
        uint amountIn2,
        uint amountIn3,
        uint amountOut1,
        uint amountOut2,
        uint amountOut3
    ) external {
        require(
            amountIn1 > 0 || amountIn2 > 0 || amountIn3 > 0,
            "SanSwapRouter: INVALID IN AMOUNT"
        );

        (SanSwapPool pool, Ordering.Order memory order) = _getPoolAndOrder(token1, token2, token3);
        address poolAddress = address(pool);

        if (amountIn1 > 0) {
            IERC20(token1).transferFrom(msg.sender, poolAddress, amountIn1);
        }
        if (amountIn2 > 0) {
            IERC20(token2).transferFrom(msg.sender, poolAddress, amountIn2);
        }
        if (amountIn3 > 0) {
            IERC20(token3).transferFrom(msg.sender, poolAddress, amountIn3);
        }
        _swap(pool, to, order, amountOut1, amountOut2, amountOut3);
    }

    // SWAP ONE FOR ONE

    function _oneForOneAmountOut(
        SanSwapPool pool,
        Ordering.Order memory order,
        uint amountIn
    ) private view returns (uint) {
        require(amountIn > 0, "SanSwapRouter: INVALID IN AMOUNT");
        (uint reserveIn, uint reserveOut, ) = _getReserves(pool, order);
        return SanSwapLibrary.oneForOneAmountOut(amountIn, reserveIn, reserveOut);
    }

    function getOneForOneAmountOut(
        address tokenIn,
        address tokenOut,
        address tokenLast,
        uint amountIn
    ) public view returns (uint) {
        (SanSwapPool pool, Ordering.Order memory order) = _getPoolAndOrder(
            tokenIn,
            tokenOut,
            tokenLast
        );
        return _oneForOneAmountOut(pool, order, amountIn);
    }

    function swapOneForOne(
        address to,
        address tokenIn,
        address tokenOut,
        address tokenLast,
        uint amountIn
    ) external {
        (SanSwapPool pool, Ordering.Order memory order) = _getPoolAndOrder(
            tokenIn,
            tokenOut,
            tokenLast
        );
        uint amountOut = _oneForOneAmountOut(pool, order, amountIn);

        IERC20(tokenIn).transferFrom(msg.sender, address(pool), amountIn);
        _swap(pool, to, order, 0, amountOut, 0);
    }

    // SWAP TWO FOR ONE

    function _twoForOneAmountOut(
        SanSwapPool pool,
        Ordering.Order memory order,
        uint amountIn1,
        uint amountIn2
    ) private view returns (uint) {
        require(amountIn1 > 0 && amountIn2 > 0, "SanSwapRouter: INVALID IN AMOUNT");
        (uint reserveIn1, uint reserveIn2, uint reserveOut) = _getReserves(pool, order);
        return
            SanSwapLibrary.twoForOneAmountOut(
                amountIn1,
                amountIn2,
                reserveIn1,
                reserveIn2,
                reserveOut
            );
    }

    function getTwoForOneAmountOut(
        address tokenIn1,
        address tokenIn2,
        address tokenOut,
        uint amountIn1,
        uint amountIn2
    ) public view returns (uint) {
        (SanSwapPool pool, Ordering.Order memory order) = _getPoolAndOrder(
            tokenIn1,
            tokenIn2,
            tokenOut
        );
        return _twoForOneAmountOut(pool, order, amountIn1, amountIn2);
    }

    function swapTwoForOne(
        address to,
        address tokenIn1,
        address tokenIn2,
        address tokenOut,
        uint amountIn1,
        uint amountIn2
    ) external {
        (SanSwapPool pool, Ordering.Order memory order) = _getPoolAndOrder(
            tokenIn1,
            tokenIn2,
            tokenOut
        );
        uint amountOut = _twoForOneAmountOut(pool, order, amountIn1, amountIn2);

        IERC20(tokenIn1).transferFrom(msg.sender, address(pool), amountIn1);
        IERC20(tokenIn2).transferFrom(msg.sender, address(pool), amountIn2);
        _swap(pool, to, order, 0, 0, amountOut);
    }

    // SWAP ONE FOR TWO

    function _oneForTwoAmountOut(
        SanSwapPool pool,
        Ordering.Order memory order,
        uint amountIn
    ) private view returns (uint, uint) {
        require(amountIn > 0, "SanSwapRouter: INVALID IN AMOUNT");
        (uint reserveIn, uint reserveOut1, uint reserveOut2) = _getReserves(pool, order);
        return SanSwapLibrary.oneForTwoAmountOut(amountIn, reserveIn, reserveOut1, reserveOut2);
    }

    function getOneForTwoAmountOut(
        address tokenIn,
        address tokenOut1,
        address tokenOut2,
        uint amountIn
    ) public view returns (uint, uint) {
        (SanSwapPool pool, Ordering.Order memory order) = _getPoolAndOrder(
            tokenIn,
            tokenOut1,
            tokenOut2
        );
        return _oneForTwoAmountOut(pool, order, amountIn);
    }

    function swapOneForTwo(
        address to,
        address tokenIn,
        address tokenOut1,
        address tokenOut2,
        uint amountIn
    ) external {
        (SanSwapPool pool, Ordering.Order memory order) = _getPoolAndOrder(
            tokenIn,
            tokenOut1,
            tokenOut2
        );
        (uint amountOut1, uint amountOut2) = _oneForTwoAmountOut(pool, order, amountIn);

        IERC20(tokenIn).transferFrom(msg.sender, address(pool), amountIn);
        _swap(pool, to, order, 0, amountOut1, amountOut2);
    }
}
