import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';

const main: DeployFunction = async function(hre: HardhatRuntimeEnvironment) {
    const { deployer } = await hre.getNamedAccounts();
    const { deploy, get } = hre.deployments;

    const bscChainId = 3;
    const multisig = await get('Multisig_Proxy');

    await deploy('WavesCaller', {
        from: deployer,
        log: true,
        proxy: {
            owner: multisig.address,
            execute: {
                init: {
                    methodName: 'init',
                    args: [multisig.address, bscChainId],
                },
            },
        },
    });
};

main.id = 'bsc_mainnet_waves_caller_deploy';
main.tags = ['bsc_mainnet', 'WavesCaller'];
main.dependencies = ['bsc_mainnet_multisig_deploy'];

export default main;
