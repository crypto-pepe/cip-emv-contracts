import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const main: DeployFunction = async function(hre: HardhatRuntimeEnvironment) {
    const { deployer } = await hre.getNamedAccounts();
    const { get, execute, read } = hre.deployments;

    const wavesMintAdapter = '0x1985ca0fD8d8EA5a114A7E5F22634e6bD8e458d7';

    if ((await read('WavesCaller', 'allowance', wavesMintAdapter)) != true) {
        const wavesCaller = await get('WavesCaller_Proxy');
        const iface = new hre.ethers.utils.Interface([
            'function allow(address caller_)',
        ]);
        const calldata = iface.encodeFunctionData('allow', [wavesMintAdapter]);
        await execute(
            'Multisig',
            {
                from: deployer,
                log: true,
            },
            'submitTransaction',
            wavesCaller.address,
            0,
            calldata
        );
    }
};

main.id = 'ethereum_mainnet_allow_waves_mint_adapter';
main.tags = ['ethereum_mainnet', 'WavesCaller'];
main.dependencies = ['ethereum_mainnet_waves_caller_deploy'];

export default main;
