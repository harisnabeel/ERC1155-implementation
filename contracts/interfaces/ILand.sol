// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

interface ILand {
    struct haris {
        uint256 a;
        uint256 b;
    }

    function _mint(haris calldata h) external payable;
}
