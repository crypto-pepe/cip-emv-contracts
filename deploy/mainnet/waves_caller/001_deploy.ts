import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const main: DeployFunction = async function(hre: HardhatRuntimeEnvironment) {
    const { deployer } = await hre.getNamedAccounts();
    const { deploy, get } = hre.deployments;

    const ethereumMainnetChainId = 2;
    const multisig = await get('Multisig_Proxy');

    await deploy('WavesCaller', {
        from: deployer,
        log: true,
        proxy: {
            owner: multisig.address,
            execute: {
                init: {
                    methodName: 'init',
                    args: [multisig.address, ethereumMainnetChainId],
                },
            },
        },
    });
};

main.id = 'ethereum_mainnet_waves_caller_deploy';
main.tags = ['ethereum_mainnet', 'WavesCaller'];
main.dependencies = ['ethereum_mainnet_multisig_deploy'];

export default main;
