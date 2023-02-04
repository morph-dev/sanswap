// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

library Math {
    function min3(uint a, uint b, uint c) internal pure returns (uint) {
        if (a < b) {
            return a < c ? a : c;
        } else {
            return b < c ? b : c;
        }
    }

    function mul512(uint a, uint b) internal pure returns (uint r0, uint r1) {
        assembly {
            let mm := mulmod(a, b, not(0))
            r0 := mul(a, b)
            r1 := sub(sub(mm, r0), lt(mm, r0))
        }
    }

    // Babylonian method:
    // https://en.wikipedia.org/wiki/Methods_of_computing_square_roots#Heron's_method
    // Implementation taken from Uniswap.
    function sqrt(uint n) internal pure returns (uint x) {
        if (n <= 3) {
            return n == 0 ? 0 : 1;
        }

        x = n;
        uint y = n / 2 + 1;
        while (y < x) {
            x = y;
            y = (n / y + y) / 2;
        }
    }
}
