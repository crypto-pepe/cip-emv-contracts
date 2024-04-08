import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const main: DeployFunction = async function(hre: HardhatRuntimeEnvironment) {
    const { deployer } = await hre.getNamedAccounts();
    const { deploy, get } = hre.deployments;

    const multisig = await get('Multisig_Proxy');
    const mumbaiChainId = 10004;
    const signer = '767eb8a906f5854e7c0b5ebcb0cf6079081d7842';

    await deploy('Executor', {
        from: deployer,
        log: true,
        contract: 'Executor',
        proxy: {
            owner: multisig.address,
            execute: {
                init: {
                    methodName: 'init',
                    args: [multisig.address, mumbaiChainId, signer],
                },
            },
        },
    });
};

main.id = 'polygon_mumbai_executor_deploy';
main.tags = ['polygon_mumbai', 'Executor'];
main.dependencies = ['polygon_mumbai_multisig_deploy'];

export default main;
