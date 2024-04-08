import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const main: DeployFunction = async function(hre: HardhatRuntimeEnvironment) {
    const { deployer } = await hre.getNamedAccounts();
    const { execute, get, read } = hre.deployments;

    const protocolSigner = '0x7ca28bD407B89d9CA792a1163F945D1e3ad50BB2';
    if ((await read('Executor', 'protocolSigner')) != protocolSigner) {
        const executor = await get('Executor_Proxy');

        const iface = new hre.ethers.utils.Interface([
            'function updateSigner(address signer_)',
        ]);
        const calldata = iface.encodeFunctionData('updateSigner', [protocolSigner]);
        await execute(
            'Multisig',
            {
                from: deployer,
                log: true,
            },
            'submitTransaction',
            executor.address,
            0,
            calldata
        );
    }
};

main.id = 'ethereum_sepolia_multisig_update_protocol_signer';
main.tags = ['ethereum_sepolia', 'Multisig'];
main.dependencies = ['ethereum_sepolia_multisig_deploy'];

export default main;
