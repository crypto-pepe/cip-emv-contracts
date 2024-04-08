import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { ethers } from 'hardhat';
import { buf2hex, createSig, hex2buf } from '../steps/executor';
import { deployExecutorV3 } from '../steps/executorV3.fixtures';
import { EXTERNAL_SOURCE_CHAIN_ID, TRANSPORT_SOURCE_CHAIN_ID, ZERO_ADDRESS } from './data/constants';

describe('ExecutorV2 component', function() {
    describe('init tests', function() {
        it('should throw when admin has zero address', async () => {
            const { executor, other } = await loadFixture(deployExecutorV3);
            await expect(
                executor.init(ZERO_ADDRESS, EXTERNAL_SOURCE_CHAIN_ID, other.address)
            ).to.be.rejectedWith('zero address');
            expect(await executor.admin()).to.be.equal(ZERO_ADDRESS);
            expect(await executor.pauser()).to.be.equal(ZERO_ADDRESS);
            expect(await executor.protocolSigner()).to.be.equal(ZERO_ADDRESS);
            expect(await executor.chainId()).to.be.equal(0);
        });

        it('should throw when signer has zero address', async () => {
            const { executor, admin } = await loadFixture(deployExecutorV3);
            await expect(
                executor.init(admin.address, EXTERNAL_SOURCE_CHAIN_ID, ZERO_ADDRESS)
            ).to.be.rejectedWith('zero address');
            expect(await executor.admin()).to.be.equal(ZERO_ADDRESS);
            expect(await executor.pauser()).to.be.equal(ZERO_ADDRESS);
            expect(await executor.protocolSigner()).to.be.equal(ZERO_ADDRESS);
            expect(await executor.chainId()).to.be.equal(0);
        });

        it('simple positive', async () => {
            const { executor, admin, other } = await loadFixture(deployExecutorV3);
            await expect(
                executor.connect(admin).updateSigner(other.address)
            ).to.be.rejectedWith('not initialized');
        });

        it('should throw when called by no-admin', async () => {
            const { executor, admin, other } = await loadFixture(deployExecutorV3);
            await executor.init(
                admin.address,
                EXTERNAL_SOURCE_CHAIN_ID,
                other.address
            );
            await expect(
                executor.connect(other).updateSigner(admin.address)
            ).to.be.rejectedWith('only admin');
        });

        it('should throw when new signer has zero address', async () => {
            const { executor, admin, other } = await loadFixture(deployExecutorV3);
            await executor.init(
                admin.address,
                EXTERNAL_SOURCE_CHAIN_ID,
                other.address
            );
            await expect(
                executor.connect(admin).updateSigner(ZERO_ADDRESS)
            ).to.be.rejectedWith('zero address');
        });

        it('simple positive', async () => {
            const { executor, admin, other, third } = await loadFixture(deployExecutorV3);
            await executor.init(
                admin.address,
                EXTERNAL_SOURCE_CHAIN_ID,
                other.address
            );
            await expect(await executor.connect(admin).updateSigner(third.address))
                .to.be.emit(executor, 'SignerUpdated')
                .withArgs(admin.address, other.address, third.address);
            expect(await executor.protocolSigner()).to.be.equal(third.address);
        });

        it('can set the same signer address', async () => {
            const { executor, admin, other } = await loadFixture(deployExecutorV3);
            await executor.init(
                admin.address,
                EXTERNAL_SOURCE_CHAIN_ID,
                other.address
            );
            await expect(await executor.connect(admin).updateSigner(other.address))
                .to.be.emit(executor, 'SignerUpdated')
                .withArgs(admin.address, other.address, other.address);
            expect(await executor.protocolSigner()).to.be.equal(other.address);
        });
    });

    describe('execute tests', function() {
        it('should throw when paused', async () => {
            const { executor, admin, other } = await loadFixture(deployExecutorV3);
            await executor.init(
                admin.address,
                EXTERNAL_SOURCE_CHAIN_ID,
                other.address
            );
            await executor.connect(admin).pause();
            await expect(
                executor.execute(
                    TRANSPORT_SOURCE_CHAIN_ID,
                    EXTERNAL_SOURCE_CHAIN_ID,
                    0, // nonce
                    'txHash',
                    other.address, // contract
                    ethers.utils.randomBytes(256), // calldata
                    ethers.utils.randomBytes(64) // signature
                )
            ).to.be.rejectedWith('paused');
        });

        it('should throw when not initialized', async () => {
            const { executor, other } = await loadFixture(deployExecutorV3);
            await expect(
                executor.execute(
                    TRANSPORT_SOURCE_CHAIN_ID,
                    EXTERNAL_SOURCE_CHAIN_ID,
                    0, // nonce
                    'txHash',
                    other.address, // contract
                    ethers.utils.randomBytes(256), // calldata
                    ethers.utils.randomBytes(64) // signature
                )
            ).to.be.rejectedWith('not initialized');
        });

        it('should throw when chain ID equals execution chain ID', async () => {
            const { executor, admin, other } = await loadFixture(deployExecutorV3);
            await executor.init(
                admin.address,
                EXTERNAL_SOURCE_CHAIN_ID,
                other.address
            );
            await expect(
                executor.execute(
                    EXTERNAL_SOURCE_CHAIN_ID,
                    TRANSPORT_SOURCE_CHAIN_ID,
                    0, // nonce
                    'txHash',
                    other.address, // contract
                    ethers.utils.randomBytes(256), // calldata
                    ethers.utils.randomBytes(65) // signature
                )
            ).to.be.rejectedWith('uncompatible chain');
        });

        it('should throw when contract address is zero', async () => {
            const { executor, admin, other } = await loadFixture(deployExecutorV3);
            await executor.init(
                admin.address,
                EXTERNAL_SOURCE_CHAIN_ID,
                other.address
            );
            await expect(
                executor.execute(
                    TRANSPORT_SOURCE_CHAIN_ID,
                    EXTERNAL_SOURCE_CHAIN_ID,
                    0, // nonce
                    'txHash',
                    ZERO_ADDRESS, // contract
                    ethers.utils.randomBytes(256), // calldata
                    ethers.utils.randomBytes(64) // signature
                )
            ).to.be.rejectedWith('zero address');
        });

        it('should throw when wrong signer', async () => {
            const { executor, admin, other, third } = await loadFixture(deployExecutorV3);
            await executor.init(
                admin.address,
                EXTERNAL_SOURCE_CHAIN_ID,
                other.address
            );
            const nonce = 0;
            const currentTxHash = buf2hex(ethers.utils.randomBytes(32));
            console.info(`TxHash: ${currentTxHash.toString()}`);
            const randomCallData = ethers.utils.randomBytes(256);
            const wrongSig = await createSig(
                ['uint16', 'uint16', 'uint256', 'uint256', 'string', 'address', 'uint256', 'bytes'],
                [
                    TRANSPORT_SOURCE_CHAIN_ID,
                    EXTERNAL_SOURCE_CHAIN_ID,
                    nonce,
                    currentTxHash.length,
                    currentTxHash,
                    third.address,
                    randomCallData.length,
                    randomCallData
                ],
                admin
            );
            await expect(
                executor.execute(
                    TRANSPORT_SOURCE_CHAIN_ID,
                    EXTERNAL_SOURCE_CHAIN_ID,
                    nonce,
                    currentTxHash,
                    third.address, // contract
                    randomCallData, // calldata
                    wrongSig // signature
                )
            ).to.be.rejectedWith('only protocol signer');
        });

        it('should throw when wrong data for sign', async () => {
            const { executor, admin, other, third } = await loadFixture(deployExecutorV3);
            await executor.init(
                admin.address,
                EXTERNAL_SOURCE_CHAIN_ID,
                other.address
            );
            const nonce = 0;
            const currentTxHash = buf2hex(ethers.utils.randomBytes(32));
            console.info(`TxHash: ${currentTxHash.toString()}`);
            const randomCallData = ethers.utils.randomBytes(256);
            const wrongSig = await createSig(
                ['uint16', 'uint16', 'uint256', 'uint256', 'string', 'address', 'uint256', 'bytes'],
                [
                    TRANSPORT_SOURCE_CHAIN_ID,
                    EXTERNAL_SOURCE_CHAIN_ID,
                    123,
                    currentTxHash.length,
                    currentTxHash,
                    third.address,
                    randomCallData.length,
                    randomCallData
                ],
                other
            );
            await expect(
                executor.execute(
                    TRANSPORT_SOURCE_CHAIN_ID,
                    EXTERNAL_SOURCE_CHAIN_ID,
                    nonce,
                    currentTxHash,
                    third.address, // contract
                    randomCallData, // calldata
                    wrongSig // signature
                )
            ).to.be.rejectedWith('only protocol signer');
        });

        it('simple positive', async () => {
            const { executor, caller, admin, other } = await loadFixture(deployExecutorV3);
            await executor.init(
                admin.address,
                EXTERNAL_SOURCE_CHAIN_ID,
                other.address
            );
            const nonce = 0;
            const currentTxHash = buf2hex(ethers.utils.randomBytes(32));
            const ABI = ['function call(uint256 param1_, string param2_)'];
            const abiInterface = new ethers.utils.Interface(ABI);
            const callDataRaw = abiInterface.encodeFunctionData('call', [1, 'two']);
            const callDataStr = hex2buf(callDataRaw.substring(2));
            const sig = await createSig(
                ['uint16', 'uint16', 'uint256', 'uint256', 'string', 'address', 'uint256', 'bytes'],
                [
                    TRANSPORT_SOURCE_CHAIN_ID,
                    EXTERNAL_SOURCE_CHAIN_ID,
                    nonce,
                    currentTxHash.length,
                    currentTxHash,
                    caller.address,
                    callDataStr.length,
                    callDataStr
                ],
                other
            );
            await expect(
                await executor.execute(
                    TRANSPORT_SOURCE_CHAIN_ID,
                    EXTERNAL_SOURCE_CHAIN_ID,
                    nonce,
                    currentTxHash,
                    caller.address, // contract
                    callDataStr, // calldata
                    sig // signature
                )
            ).to.be
                .emit(caller, 'Call')
                .withArgs(1, 'two')
                .to.be.emit(executor, 'Executed').withArgs(
                    TRANSPORT_SOURCE_CHAIN_ID,
                    EXTERNAL_SOURCE_CHAIN_ID,
                    nonce,
                    caller.address
                );
        });

        it('should throw when duplicate event', async () => {
            const { executor, caller, admin, other } = await loadFixture(deployExecutorV3);
            await executor.init(
                admin.address,
                EXTERNAL_SOURCE_CHAIN_ID,
                other.address
            );
            const nonce = 0;
            const currentTxHash = buf2hex(ethers.utils.randomBytes(32));
            const ABI = ['function call(uint256 param1_, string param2_)'];
            const abiInterface = new ethers.utils.Interface(ABI);
            const callDataRaw = abiInterface.encodeFunctionData('call', [1, 'two']);
            const callDataStr = hex2buf(callDataRaw.substring(2));
            const sig = await createSig(
                ['uint16', 'uint16', 'uint256', 'uint256', 'string', 'address', 'uint256', 'bytes'],
                [
                    TRANSPORT_SOURCE_CHAIN_ID,
                    EXTERNAL_SOURCE_CHAIN_ID,
                    nonce,
                    currentTxHash.length,
                    currentTxHash,
                    caller.address,
                    callDataStr.length,
                    callDataStr
                ],
                other
            );
            await executor.execute(
                TRANSPORT_SOURCE_CHAIN_ID,
                EXTERNAL_SOURCE_CHAIN_ID,
                nonce,
                currentTxHash,
                caller.address, // contract
                callDataStr, // calldata
                sig // signature
            );
            await expect(
                executor.execute(
                    TRANSPORT_SOURCE_CHAIN_ID,
                    EXTERNAL_SOURCE_CHAIN_ID,
                    nonce,
                    currentTxHash,
                    caller.address, // contract
                    callDataStr, // calldata
                    sig // signature
                )
            ).to.be.rejectedWith('duplicate data');
        });

        it('reverted with error', async () => {
            const { executor, caller, admin, other } = await loadFixture(deployExecutorV3);
            await executor.init(
                admin.address,
                EXTERNAL_SOURCE_CHAIN_ID,
                other.address
            );
            const nonce = 0;
            const currentTxHash = buf2hex(ethers.utils.randomBytes(32));
            const ABI = ['function call(uint256 param1_, string param2_)'];
            const abiInterface = new ethers.utils.Interface(ABI);
            const callDataRaw = abiInterface.encodeFunctionData('call', [2, 'two']);
            const callDataStr = hex2buf(callDataRaw.substring(2));
            const sig = await createSig(
                ['uint16', 'uint16', 'uint256', 'uint256', 'string', 'address', 'uint256', 'bytes'],
                [
                    TRANSPORT_SOURCE_CHAIN_ID,
                    EXTERNAL_SOURCE_CHAIN_ID,
                    nonce,
                    currentTxHash.length,
                    currentTxHash,
                    caller.address,
                    callDataStr.length,
                    callDataStr
                ],
                other
            );
            await expect(
                executor.execute(
                    TRANSPORT_SOURCE_CHAIN_ID,
                    EXTERNAL_SOURCE_CHAIN_ID,
                    nonce,
                    currentTxHash,
                    caller.address, // contract
                    callDataStr, // calldata
                    sig // signature
                )
            ).to.be.rejectedWith('fucking error');
        });

        it('reverted without error (when calldata is wrong)', async () => {
            const { executor, caller, admin, other } = await loadFixture(deployExecutorV3);
            await executor.init(
                admin.address,
                EXTERNAL_SOURCE_CHAIN_ID,
                other.address
            );
            const nonce = 0;
            const currentTxHash = buf2hex(ethers.utils.randomBytes(32));
            const callData = ethers.utils.randomBytes(256);
            const sig = await createSig(
                ['uint16', 'uint16', 'uint256', 'uint256', 'string', 'address', 'uint256', 'bytes'],
                [
                    TRANSPORT_SOURCE_CHAIN_ID,
                    EXTERNAL_SOURCE_CHAIN_ID,
                    nonce,
                    currentTxHash.length,
                    currentTxHash,
                    caller.address,
                    callData.length,
                    callData
                ],
                other
            );
            await expect(
                executor.execute(
                    TRANSPORT_SOURCE_CHAIN_ID,
                    EXTERNAL_SOURCE_CHAIN_ID,
                    nonce,
                    currentTxHash,
                    caller.address, // contract
                    callData, // calldata
                    sig // signature
                )
            ).to.be.rejectedWith('no error');
        });

        it('can send calldata with 1024 bytes', async () => {
            const { executor, caller, admin, other } = await loadFixture(deployExecutorV3);
            await executor.init(
                admin.address,
                EXTERNAL_SOURCE_CHAIN_ID,
                other.address
            );
            const nonce = 0;
            const currentTxHash = buf2hex(ethers.utils.randomBytes(32));
            const callData = ethers.utils.randomBytes(1024);
            const sig = await createSig(
                ['uint16', 'uint16', 'uint256', 'uint256', 'string', 'address', 'uint256', 'bytes'],
                [
                    TRANSPORT_SOURCE_CHAIN_ID,
                    EXTERNAL_SOURCE_CHAIN_ID,
                    nonce,
                    currentTxHash.length,
                    currentTxHash,
                    caller.address,
                    callData.length,
                    callData
                ],
                other
            );
            await expect(
                executor.execute(
                    TRANSPORT_SOURCE_CHAIN_ID,
                    EXTERNAL_SOURCE_CHAIN_ID,
                    nonce,
                    currentTxHash,
                    caller.address, // contract
                    callData, // calldata
                    sig // signature
                )
            ).to.be.rejectedWith('no error');
        });

        it('race condition validation', async () => {
            const { executor, caller, admin, other } = await loadFixture(deployExecutorV3);
            await executor.init(
                admin.address,
                EXTERNAL_SOURCE_CHAIN_ID,
                other.address
            );
            const nonce = 0;
            const currentTxHash = buf2hex(ethers.utils.randomBytes(32));
            const ABI = [
                'function execute(uint16 callerChainId_, uint16 executionChainId_, uint256 nonce_, string calldata txHash_, address contract_, bytes calldata callData_, bytes calldata signature_)'
            ];
            const abiInterface = new ethers.utils.Interface(ABI);
            const callDataRaw = abiInterface.encodeFunctionData(
                'execute',
                [
                    TRANSPORT_SOURCE_CHAIN_ID,
                    EXTERNAL_SOURCE_CHAIN_ID,
                    nonce,
                    currentTxHash,
                    caller.address, // contract
                    ethers.utils.randomBytes(128), // calldata
                    ethers.utils.randomBytes(64) // signature
                ]
            );
            const callDataStr = hex2buf(callDataRaw.substring(2));
            const sig = await createSig(
                ['uint16', 'uint16', 'uint256', 'uint256', 'string', 'address', 'uint256', 'bytes'],
                [
                    TRANSPORT_SOURCE_CHAIN_ID,
                    EXTERNAL_SOURCE_CHAIN_ID,
                    nonce,
                    currentTxHash.length,
                    currentTxHash,
                    executor.address,
                    callDataStr.length,
                    callDataStr
                ],
                other
            );
            await expect(
                executor.execute(
                    TRANSPORT_SOURCE_CHAIN_ID,
                    EXTERNAL_SOURCE_CHAIN_ID,
                    nonce,
                    currentTxHash,
                    executor.address, // contract
                    callDataStr, // calldata
                    sig // signature
                )
            ).to.be.rejectedWith('mutex lock');
        });
    });
});
