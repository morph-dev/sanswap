// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./Ordering.sol";
import "./SanSwapPool.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

contract SanSwapFactory {
    string private POOL_NAME_PREFIX = "SanSwap Pool - ";
    string private POOL_SYMBOL_PREFIX = "SS-";

    address[] public allPools;
    mapping(address => mapping(address => mapping(address => address))) public pool;

    function getPoolCount() external view returns (uint) {
        return allPools.length;
    }

    function createPool(
        address token1,
        address token2,
        address token3
    ) external returns (address poolAddress) {
        Ordering.Order memory order = Ordering.orderOf(token1, token2, token3);
        (address tokenA, address tokenB, address tokenC) = Ordering.reorder(
            order,
            token1,
            token2,
            token3
        );
        require(tokenA != address(0), "SanSwapFactory: ZERO ADDRESS");
        require(pool[tokenA][tokenB][tokenC] == address(0), "SanSwapFactory: POOL EXISTS");

        string memory suffix = string.concat(
            IERC20Metadata(tokenA).symbol(),
            "-",
            IERC20Metadata(tokenB).symbol(),
            "-",
            IERC20Metadata(tokenC).symbol()
        );

        SanSwapPool _pool = new SanSwapPool(
            string.concat(POOL_NAME_PREFIX, suffix),
            string.concat(POOL_SYMBOL_PREFIX, suffix),
            tokenA,
            tokenB,
            tokenC
        );

        poolAddress = address(_pool);
        pool[tokenA][tokenB][tokenC] = poolAddress;
        pool[tokenA][tokenC][tokenB] = poolAddress;
        pool[tokenB][tokenA][tokenC] = poolAddress;
        pool[tokenB][tokenC][tokenA] = poolAddress;
        pool[tokenC][tokenA][tokenB] = poolAddress;
        pool[tokenC][tokenB][tokenA] = poolAddress;
        allPools.push(poolAddress);
    }
}
