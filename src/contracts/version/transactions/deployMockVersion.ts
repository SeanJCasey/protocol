import { Environment } from '~/utils/environment/Environment';
import { deploy as deployContract } from '~/utils/solidity/deploy';

export const deployMockVersion = async (environment: Environment) => {
  const address = await deployContract(
    environment,
    'version/MockVersion.sol',
    null,
  );

  return address;
};
