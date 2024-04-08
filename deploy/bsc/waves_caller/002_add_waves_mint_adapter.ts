import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';

const main: DeployFunction = async function(hre: HardhatRuntimeEnvironment) {
    const { deployer } = await hre.getNamedAccounts();
    const { get, execute, read } = hre.deployments;

    const wavesMintAdapter = '0x5Dcb742d09ade3Da6461024F91f53518bb309aD5';

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

main.id = 'bsc_mainnet_allow_waves_mint_adapter';
main.tags = ['bsc_mainnet', 'WavesCaller'];
main.dependencies = ['bsc_mainnet_waves_caller_deploy'];

export default main;
