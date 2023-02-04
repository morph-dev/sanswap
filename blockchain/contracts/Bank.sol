// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./MintableToken.sol";

contract Bank {
    MintableToken[] public tokens;

    function tokenSize() external view returns (uint) {
        return tokens.length;
    }

    function createToken(string calldata name, string calldata symbol, uint mintAmount) external returns (address) {
        MintableToken token = new MintableToken(name, symbol);
        tokens.push(token);
        if (mintAmount > 0) {
            token.mint(msg.sender, mintAmount);
        }
        return address(token);
    }

    function mintAll(address to, uint amount) external {
        for (uint i = 0; i < tokens.length; i++) {
            tokens[i].mint(to, amount);
        }
    }
}
