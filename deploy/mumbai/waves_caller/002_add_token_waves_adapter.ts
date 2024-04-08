import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const main: DeployFunction = async function(hre: HardhatRuntimeEnvironment) {
    const { deployer } = await hre.getNamedAccounts();
    const { get, execute, read } = hre.deployments;

    const wavesMintAdapter = '0x22b64323BEE73A2f0f850c68A91e3FA820fB4FB8';

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

main.id = 'polygon_mumbai_allow_waves_mint_adapter';
main.tags = ['polygon_mumbai', 'WavesCaller'];
main.dependencies = ['polygon_mumbai_waves_caller_deploy'];

export default main;
