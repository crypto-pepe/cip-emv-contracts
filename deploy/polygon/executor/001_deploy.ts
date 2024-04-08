import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const main: DeployFunction = async function(hre: HardhatRuntimeEnvironment) {
    const { deployer } = await hre.getNamedAccounts();
    const { deploy, get } = hre.deployments;

    const multisig = await get('Multisig_Proxy');
    const mainnetChainId = 4;
    const signer = '0xd99b10168bf03beb21e374fb6b0de388fbfbf9b2';

    await deploy('Executor', {
        from: deployer,
        log: true,
        contract: 'ExecutorV3',
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

main.id = 'polygon_mainnet_executor_deploy';
main.tags = ['polygon_mainnet', 'Executor'];
main.dependencies = ['polygon_mainnet_multisig_deploy'];

export default main;
