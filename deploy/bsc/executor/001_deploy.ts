import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';

const main: DeployFunction = async function(hre: HardhatRuntimeEnvironment) {
    const { deployer } = await hre.getNamedAccounts();
    const { deploy, get } = hre.deployments;

    const multisig = await get('Multisig_Proxy');
    const mainnetChainId = 3;
    const signer = '0xd0983e9f4b3556fdb4ac1bcc5104696d25282129';

    await deploy('Executor', {
        from: deployer,
        log: true,
        contract: 'ExecutorV2',
        proxy: {
            owner: multisig.address,
            execute: {
                init: {
                    methodName: 'init',
                    args: [multisig.address, mainnetChainId, signer],
                },
            },
        },
    });
};

main.id = 'bsc_mainnet_executor_deploy';
main.tags = ['bsc_mainnet', 'Executor'];
main.dependencies = ['bsc_mainnet_multisig_deploy'];

export default main;
