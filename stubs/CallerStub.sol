// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract CallerStub {

    event Call(
        uint256 one,
        string two
    );

    function call(
        uint256 param1_,
        string calldata param2_
    ) external returns (bytes memory) {
        require(param1_ == 1, "fucking error");
        emit Call(param1_, param2_);
        return bytes("ololo");
    }
}