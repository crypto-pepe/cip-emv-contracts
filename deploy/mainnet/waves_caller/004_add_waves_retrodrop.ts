import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const main: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployer } = await hre.getNamedAccounts();
    const { get, execute, read } = hre.deployments;

    const wavesETHRetrodrop = '0xcA26CF4143161EB7171f20eb6BB752C7Ada9872c';

    if ((await read('WavesCaller', 'allowance', wavesETHRetrodrop)) != true) {
        const wavesCaller = await get('WavesCaller_Proxy');
        const iface = new hre.ethers.utils.Interface([
            'function allow(address caller_)',
        ]);
        const calldata = iface.encodeFunctionData('allow', [wavesETHRetrodrop]);
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

main.id = 'ethereum_mainnet_allow_waves_retrodrop';
main.tags = ['ethereum_mainnet', 'WavesCaller'];
main.dependencies = ['ethereum_mainnet_waves_retrodrop'];

export default main;
