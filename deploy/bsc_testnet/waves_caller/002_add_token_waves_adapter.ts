import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';

const main: DeployFunction = async function(hre: HardhatRuntimeEnvironment) {
    const { deployer } = await hre.getNamedAccounts();
    const { get, execute, read } = hre.deployments;

    const wavesMintAdapter = '0x0de7b091A21BD439bdB2DfbB63146D9cEa21Ea83';

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

main.id = 'bsc_testnet_allow_waves_mint_adapter';
main.tags = ['bsc_testnet', 'WavesCaller'];
main.dependencies = ['bsc_testnet_waves_caller_deploy'];

export default main;
