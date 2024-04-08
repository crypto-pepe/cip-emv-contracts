import { ethers } from 'hardhat';

import callerMock from '../stubs/CallerStub.json';

export const deployExecutorV2 = async () => {
    const [admin, other, third] = await ethers.getSigners();
    const Executor = await ethers.getContractFactory('ExecutorV2');
    const executor = await Executor.deploy();
    await executor.deployed();

    const Stub = await ethers.getContractFactory(callerMock.abi, callerMock.bytecode);
    const caller = await Stub.deploy();
    await caller.deployed();

    return {
        executor,
        caller,
        admin,
        other,
        third,
    };
};
