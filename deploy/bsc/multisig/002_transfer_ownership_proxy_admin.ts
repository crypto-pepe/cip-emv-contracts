import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';

const main: DeployFunction = async function(hre: HardhatRuntimeEnvironment) {
    const { deployer } = await hre.getNamedAccounts();
    const { execute, get, read } = hre.deployments;

    const multisig = await get('Multisig_Proxy');
    if ((await read('Multisig_Proxy', 'owner')) != multisig.address) {
        await execute(
            'Multisig_Proxy',
            {
                from: deployer,
                log: true,
            },
            'transferOwnership',
            multisig.address
        );
    }
};

main.id = 'bsc_mainnet_multisig_transfer_ownership';
main.tags = ['bsc_mainnet', 'Multisig'];
main.dependencies = ['bsc_mainnet_multisig_deploy'];

export default main;
