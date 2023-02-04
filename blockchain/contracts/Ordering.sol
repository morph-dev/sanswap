// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

library Ordering {
    struct Order {
        uint8 posA;
        uint8 posB;
        uint8 posC;
    }

    function orderOf(
        address address1,
        address address2,
        address address3
    ) internal pure returns (Order memory order) {
        require(
            address1 != address2 && address1 != address3 && address2 != address3,
            "SAME ADDRESS"
        );
        if (address1 < address2) {
            // address1 < address2
            if (address1 < address3) {
                // address1 is the smallest
                order.posA = 1;
                (order.posB, order.posC) = address2 < address3 ? (2, 3) : (3, 2);
                return order;
            } else {
                // address1 < address2 AND address3 < address1
                return Order(3, 1, 2);
            }
        } else {
            // address2 < address1
            if (address2 < address3) {
                // address2 is the smallest
                order.posA = 2;
                (order.posB, order.posC) = address1 < address3 ? (1, 3) : (3, 1);
                return order;
            } else {
                // address2 < address1 AND address3 < address2
                return Order(3, 2, 1);
            }
        }
    }

    function reorder(
        Order memory order,
        address address1,
        address address2,
        address address3
    ) internal pure returns (address addressA, address addressB, address addressC) {
        address[3] memory tokens = [address1, address2, address3];
        addressA = tokens[order.posA - 1];
        addressB = tokens[order.posB - 1];
        addressC = tokens[order.posC - 1];
    }

    function reorderUint(
        Order memory order,
        uint value1,
        uint value2,
        uint value3
    ) internal pure returns (uint valueA, uint valueB, uint valueC) {
        uint[3] memory values = [value1, value2, value3];
        valueA = values[order.posA - 1];
        valueB = values[order.posB - 1];
        valueC = values[order.posC - 1];
    }

    function reverseUint(
        Order memory order,
        uint valueA,
        uint valueB,
        uint valueC
    ) internal pure returns (uint value1, uint value2, uint value3) {
        uint[3] memory values;
        values[order.posA - 1] = valueA;
        values[order.posB - 1] = valueB;
        values[order.posC - 1] = valueC;
        value1 = values[0];
        value2 = values[1];
        value3 = values[2];
    }
}
