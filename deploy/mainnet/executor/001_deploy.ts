import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const main: DeployFunction = async function(hre: HardhatRuntimeEnvironment) {
    const { deployer } = await hre.getNamedAccounts();
    const { deploy, get } = hre.deployments;

    const multisig = await get('Multisig_Proxy');
    const mainnetChainId = 2;
    const signer = '0xd5ba9d817b496c0f861d464d96a1ec3b8aadb858';

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

main.id = 'ethereum_mainnet_executor_deploy';
main.tags = ['ethereum_mainnet', 'Executor'];
main.dependencies = ['ethereum_mainnet_multisig_deploy'];

export default main;
