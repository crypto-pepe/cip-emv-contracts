import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const main: DeployFunction = async function(hre: HardhatRuntimeEnvironment) {
    const { deployer } = await hre.getNamedAccounts();
    const { get, execute, read } = hre.deployments;

    const wavesMintAdapter = '0x274475ad34234C92C17808003672b7bc81AdC031';

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

main.id = 'polygon_mainnet_allow_waves_mint_adapter';
main.tags = ['polygon_mainnet', 'WavesCaller'];
main.dependencies = ['polygon_mainnet_waves_caller_deploy'];

export default main;
