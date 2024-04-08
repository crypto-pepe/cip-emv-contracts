import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const main: DeployFunction = async function(hre: HardhatRuntimeEnvironment) {
    const { deployer } = await hre.getNamedAccounts();
    const { get, execute, read } = hre.deployments;

    const wavesReleaseAdapter = '0x5a1b1b5A91d999915142978be11810DeFdd51e1e';

    if ((await read('WavesCaller', 'allowance', wavesReleaseAdapter)) != true) {
        const wavesCaller = await get('WavesCaller_Proxy');
        const iface = new hre.ethers.utils.Interface([
            'function allow(address caller_)',
        ]);
        const calldata = iface.encodeFunctionData('allow', [wavesReleaseAdapter]);
        console.log(calldata);
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

main.id = 'ethereum_sepolia_allow_waves_release_adapter';
main.tags = ['ethereum_sepolia', 'WavesCaller'];
main.dependencies = ['ethereum_sepolia_waves_caller_deploy'];

export default main;
