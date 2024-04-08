import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import '@nomiclabs/hardhat-ethers';
import 'hardhat-gas-reporter';
import 'hardhat-deploy';

const config: HardhatUserConfig = {
    solidity: {
        version: '0.8.18',
        settings: {
            optimizer: {
                enabled: true,
                runs: 999999,
            },
        },
    },
    mocha: {
        diff: true,
        fullTrace: true,
        slow: 50000,
        timeout: 60000,
        reporter:
            process.env.JUNIT === 'true'
                ? 'mocha-junit-reporter'
                : 'mocha-multi-reporters',
        reporterOptions: {
            reporterEnabled: 'allure-mocha, list',
            allureMochaReporterOptions: {
                resultsDir: './allure-results',
            },
            mochaFile: 'testresult.xml',
            toConsole: true,
        },
    },
    gasReporter: {
        enabled: process.env.JUNIT !== 'true',
        src: './src',
        fast: true,
    },
    namedAccounts: {
        deployer: {
            default: 0,
            1: 'ledger://m/44\'/60\'/20\'/0/0:0x9bA15E762398456ce03eAA382253b56Ed5dA882a',
            97: '0x9bA15E762398456ce03eAA382253b56Ed5dA882a',
            56: '0x9bA15E762398456ce03eAA382253b56Ed5dA882a',
            11155111: 'ledger://m/44\'/60\'/20\'/0/0:0x9bA15E762398456ce03eAA382253b56Ed5dA882a',
            80001: 'ledger://m/44\'/60\'/20\'/0/0:0x9bA15E762398456ce03eAA382253b56Ed5dA882a',
            137: 'ledger://m/44\'/60\'/20\'/0/0:0x9bA15E762398456ce03eAA382253b56Ed5dA882a',
        },
    },
    networks: {
        hardhat: {
            accounts: {
                accountsBalance: '1000000000000000000000',
            },
        },
        mainnet: {
            url: process.env.MAINNET_RPC_URL || 'http://127.0.0.1:1248',
            saveDeployments: true,
            chainId: 1,
            gasPrice: 23_000_000_000
        },
        sepolia: {
            url: process.env.SEPOLIA_RPC_URL || '',
            saveDeployments: true,
            chainId: 11155111
        },
        bsc_testnet: {
            url: 'http://127.0.0.1:1248',
            saveDeployments: true,
            chainId: 97,
            timeout: 1_000_000
        },
        bsc: {
            url: 'http://127.0.0.1:1248',
            saveDeployments: true,
            chainId: 56,
            timeout: 1_000_000,
        },
        mumbai: {
            url: process.env.MUMBAI_RPC_URL || '',
            saveDeployments: true,
            chainId: 80001
        },
        polygon: {
            url: process.env.POLYGON_RPC_URL || '',
            saveDeployments: true,
            chainId: 137
        }
    },
    etherscan: {
        apiKey: process.env.ETHERSCAN_API_KEY || '',
    },
};

export default config;
