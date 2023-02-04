// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./Ordering.sol";
import "./SanSwapPool.sol";

library SanSwapLibrary {
    function _getOrderedReserves(
        SanSwapPool pool,
        address token1,
        address token2,
        address token3
    ) private view returns (uint, uint, uint) {
        (uint reserveA, uint reserveB, uint reserveC) = pool.reserves();
        return
            Ordering.reverseUint(
                Ordering.orderOf(token1, token2, token3),
                reserveA,
                reserveB,
                reserveC
            );
    }

    function optimalAddLiquidity(
        uint supply,
        uint reserve1,
        uint reserve2,
        uint reserve3,
        uint desired1,
        uint desired2,
        uint desired3
    ) internal pure returns (uint, uint, uint) {
        if (supply == 0 || reserve1 == 0 || reserve2 == 0 || reserve3 == 0) {
            return (desired1, desired2, desired3);
        }

        uint liquidity = Math.min3(
            (supply * desired1) / reserve1,
            (supply * desired2) / reserve2,
            (supply * desired3) / reserve3
        );
        return (
            (liquidity * reserve1) / supply,
            (liquidity * reserve2) / supply,
            (liquidity * reserve3) / supply
        );
    }

    function oneForOneAmountOut(
        uint amountIn,
        uint reserveIn,
        uint reserveOut
    ) internal pure returns (uint) {
        uint amountInWithoutFee = amountIn * 997;
        uint numerator = reserveOut * amountInWithoutFee;
        uint denominator = reserveIn * 1000 + amountInWithoutFee;
        return numerator / denominator;
    }

    function twoForOneAmountOut(
        uint amountIn1,
        uint amountIn2,
        uint reserveIn1,
        uint reserveIn2,
        uint reserveOut
    ) internal pure returns (uint amountOut) {
        uint amountOut1 = oneForOneAmountOut(amountIn1, reserveIn1, reserveOut);
        uint amountOut2 = oneForOneAmountOut(amountIn2, reserveIn2, reserveOut - amountOut1);
        return amountOut1 + amountOut2;
    }

    function oneForTwoAmountOut(
        uint amountIn,
        uint reserveIn,
        uint reserveOut1,
        uint reserveOut2
    ) internal pure returns (uint amountOut1, uint amountOut2) {
        uint sqrtOldReserveIn = Math.sqrt(1000 * reserveIn) + 1;
        uint sqrtNewAdjustedReserveIn = Math.sqrt(1000 * reserveIn + amountIn * 997);
        uint sqrtDiff = sqrtNewAdjustedReserveIn - sqrtOldReserveIn;
        amountOut1 = (reserveOut1 * sqrtDiff) / sqrtNewAdjustedReserveIn;
        amountOut2 = (reserveOut2 * sqrtDiff) / sqrtNewAdjustedReserveIn;
    }
}
