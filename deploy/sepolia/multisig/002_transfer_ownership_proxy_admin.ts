import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

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

main.id = 'ethereum_sepolia_multisig_transfer_ownership';
main.tags = ['ethereum_sepolia', 'Multisig'];
main.dependencies = ['ethereum_sepolia_multisig_deploy'];

export default main;
