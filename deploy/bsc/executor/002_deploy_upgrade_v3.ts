import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const main: DeployFunction = async function() {
    // const main: DeployFunction = async function(hre: HardhatRuntimeEnvironment) {
    //     const { deployer } = await hre.getNamedAccounts();
    //     const { deploy, get, execute } = hre.deployments;
    //
    //     const executorImpl = await deploy('ExecutorV3', {
    //         from: deployer,
    //         log: true,
    //         contract: 'ExecutorV3',
    //     });
    //
    //     // todo check impl address
    //     const executorProxy = await get('Executor_Proxy');
    //     const iface = new hre.ethers.utils.Interface([
    //         'function upgradeTo(address newImplementation)',
    //     ]);
    //     const calldata = iface.encodeFunctionData('upgradeTo', [
    //         executorImpl.address,
    //     ]);
    //     await execute(
    //         'Multisig',
    //         {
    //             from: deployer,
    //             log: true,
    //         },
    //         'submitTransaction',
    //         executorProxy.address,
    //         0,
    //         calldata
    //     );
};

main.id = 'bsc_mainnet_executor_upgrade_deploy';
main.tags = ['bsc_mainnet', 'Executor'];
main.dependencies = ['bsc_mainnet_multisig_deploy'];

export default main;
