import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const main: DeployFunction = async function(hre: HardhatRuntimeEnvironment) {
    const { deployer } = await hre.getNamedAccounts();
    const { get, execute, read } = hre.deployments;

    const wavesReleaseAdapter = '0x09D8444770ADCe8d61FB5C967B57287b70391118';

    if ((await read('WavesCaller', 'allowance', wavesReleaseAdapter)) != true) {
        const wavesCaller = await get('WavesCaller_Proxy');
        const iface = new hre.ethers.utils.Interface([
            'function allow(address caller_)',
        ]);
        const calldata = iface.encodeFunctionData('allow', [wavesReleaseAdapter]);
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

main.id = 'ethereum_mainnet_allow_waves_release_adapter';
main.tags = ['ethereum_mainnet', 'WavesCaller'];
main.dependencies = ['ethereum_mainnet_waves_caller_deploy'];

export default main;
