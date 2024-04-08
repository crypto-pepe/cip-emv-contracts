import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { createSig } from "../steps/executor";
import { deployExecutor } from "../steps/executor.fixtures";
import {
  EXTERNAL_SOURCE_CHAIN_ID,
  TRANSPORT_SOURCE_CHAIN_ID,
  ZERO_ADDRESS,
} from "./data/constants";
// import { FakeContract, smock } from "@defi-wonderland/smock";
import { WavesCaller } from "../typechain-types";

const deployExecutorStub = async () => {
  const [admin, other, third] = await ethers.getSigners();
  const Executor = await ethers.getContractFactory("ExecutorStub");
  const executor = await Executor.deploy();
  await executor.deployed();

  return {
    executor,
    admin,
    other,
    third,
  };
};

describe("ExecutorStub component", function() {
  describe("tests", function() {
    it("testnet", async () => {
      const { executor, other } = await loadFixture(deployExecutorStub);
      //       hash                   | 5US4eowQ5B6apaHnSfxYyVsFQSLXuW1zm8iRj36YvBpX
      // caller_chain_id        | 10001
      // execution_chain_id     | 10002
      // nonce                  | 30
      // execution_contract     | 0x4356Fc8912ee241464983c46E61A7069f8983f38
      // calldata               | 0xa7392f8e0000000000000154e48ffce27b40e1ae548707e2f4689d1b19568fc118533b550000000000000000000000009a3e6c572acb15873a22b88f496b81b9777535b2000000000000000000000000000000000000000000000000000000000000118f0000000000000000000000000000000000000000000000000000000000000465
      // tx_id                  | Ef8Uf2iJg3tKEtzC6uTdunTrs4G3iFb1fx68aV5iwabk
      await expect(
        await executor
          .connect(other)
          .execute(
            10001,
            10002,
            30,
            "Ef8Uf2iJg3tKEtzC6uTdunTrs4G3iFb1fx68aV5iwabk",
            "0x4356Fc8912ee241464983c46E61A7069f8983f38",
            "0xa7392f8e0000000000000154e48ffce27b40e1ae548707e2f4689d1b19568fc118533b550000000000000000000000009a3e6c572acb15873a22b88f496b81b9777535b2000000000000000000000000000000000000000000000000000000000000118f0000000000000000000000000000000000000000000000000000000000000465"
          )
      )
        .to.be.emit(executor, "SignatureBytes")
        .withArgs(
          "0x27112712000000000000000000000000000000000000000000000000000000000000001e000000000000000000000000000000000000000000000000000000000000002c456638556632694a6733744b45747a4336755464756e5472733447336946623166783638615635697761626b4356fc8912ee241464983c46e61a7069f8983f380000000000000000000000000000000000000000000000000000000000000084a7392f8e0000000000000154e48ffce27b40e1ae548707e2f4689d1b19568fc118533b550000000000000000000000009a3e6c572acb15873a22b88f496b81b9777535b2000000000000000000000000000000000000000000000000000000000000118f0000000000000000000000000000000000000000000000000000000000000465",
          "0xc8dd9b59321bca200a9ad713de1ee72a7320413d1df2c2eeced981bdea5bb6bb",
          "0x04dffebf88d51a4b73abd4fd7ed55a5171440d603cda3cf709fa8d5fd930cfa4"
        );
    });
  });
});
