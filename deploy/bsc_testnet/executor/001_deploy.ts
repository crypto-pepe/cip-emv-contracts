import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';

const main: DeployFunction = async function(hre: HardhatRuntimeEnvironment) {
    const { deployer } = await hre.getNamedAccounts();
    const { deploy, get } = hre.deployments;

    const multisig = await get('Multisig_Proxy');
    const chainId = 10003;
    const signer = '0x193c5b7935b9e53c1d59d02ed1c07609736c4c98';

    await deploy('Executor', {
        from: deployer,
        log: true,
        contract: 'ExecutorV2',
        proxy: {
            owner: multisig.address,
            execute: {
                init: {
                    methodName: 'init',
                    args: [multisig.address, chainId, signer],
                },
            },
        },
    });
};

main.id = 'bsc_testnet_executor_deploy';
main.tags = ['bsc_testnet', 'Executor'];
main.dependencies = ['bsc_testnet_multisig_deploy'];

export default main;
