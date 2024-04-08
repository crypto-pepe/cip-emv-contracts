import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const main: DeployFunction = async function(hre: HardhatRuntimeEnvironment) {
    const { deployer } = await hre.getNamedAccounts();
    const { deploy, get } = hre.deployments;

    const mumbaiChainId = 10004;
    const multisig = await get('Multisig_Proxy');

    await deploy('WavesCaller', {
        from: deployer,
        log: true,
        proxy: {
            owner: multisig.address,
            execute: {
                init: {
                    methodName: 'init',
                    args: [multisig.address, mumbaiChainId],
                },
            },
        },
    });
};

main.id = 'polygon_mumbai_waves_caller_deploy';
main.tags = ['polygon_mumbai', 'WavesCaller'];
main.dependencies = ['polygon_mumbai_multisig_deploy'];

export default main;
