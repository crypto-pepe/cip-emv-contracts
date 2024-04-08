// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract ExecutorStub {
    event SignatureBytes(bytes data, bytes32 dataHash, bytes32 presigDataHash);

    function execute(
        uint16 callerChainId_,
        uint16 executionChainId_,
        uint256 nonce_,
        string calldata txHash_,
        address contract_,
        bytes calldata callData_
    ) external {
        bytes memory data = abi.encodePacked(
            callerChainId_,
            executionChainId_,
            nonce_,
            bytes(txHash_).length,
            txHash_,
            contract_,
            callData_.length,
            callData_
        );

        bytes32 dataHash = keccak256(data);

        emit SignatureBytes(
            data,
            dataHash,
            keccak256(
                abi.encodePacked("\x19Ethereum Signed Message:\n32", dataHash)
            )
        );
    }
}
