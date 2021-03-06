import { deployAndGetContract as deploy } from '~/utils/solidity/deployAndGetContract';
import { deployMockSystem } from '~/utils/deploy/deployMockSystem';
import { Contracts } from '~/Contracts';
import { initTestEnvironment } from '~/tests/utils/initTestEnvironment';
import { emptyAddress } from '~/utils/constants/emptyAddress';
import { makeOrderSignatureBytes } from '~/utils/constants/orderSignatures';

describe('maxConcentration', () => {
  let shared: any = {};

  beforeAll(async () => {
    shared.env = await initTestEnvironment();
    shared = Object.assign(shared, await deployMockSystem(shared.env));
    shared.user = shared.env.wallet.address;
    shared.quote = shared.weth.options.address;
    shared.nonQuote = shared.mln.options.address;
  });

  it.each([
    [
      'Asset gav > concentration limit',
      {
        max: '100000000000000000',
        asset: 'nonQuote',
        asset_gav: '100010000000000000',
        total_gav: '1000000000000000000',
        expectPass: false,
      },
    ],
    [
      'Asset gav == concentration limit',
      {
        max: '100000000000000000',
        asset: 'nonQuote',
        asset_gav: '100000000000000000',
        total_gav: '1000000000000000000',
        expectPass: true,
      },
    ],
    [
      'Asset gav < concentration limit',
      {
        max: '100000000000000000',
        asset: 'nonQuote',
        asset_gav: '90000000000000000',
        total_gav: '1000000000000000000',
        expectPass: true,
      },
    ],
    [
      'Quote asset gav > concentration limit',
      {
        max: '100000000000000000',
        asset: 'quote',
        asset_gav: '1000000000000000000',
        total_gav: '1000000000000000000',
        expectPass: true,
      },
    ],
  ])('%s', async (name, trial) => {
    const policy = await deploy(shared.env, Contracts.MaxConcentration, [
      trial.max,
    ]);
    const trialAsset = shared[trial.asset];

    expect(await policy.methods.maxConcentration().call()).toBe(trial.max);

    await shared.policyManager.methods
      .register(makeOrderSignatureBytes, policy.options.address)
      .send({ from: shared.user });
    await shared.accounting.methods
      .setAssetGAV(trialAsset, trial.asset_gav)
      .send({ from: shared.user });
    await shared.accounting.methods
      .setGav(trial.total_gav)
      .send({ from: shared.user });

    const evaluate = shared.policyManager.methods.postValidate(
      makeOrderSignatureBytes,
      [emptyAddress, emptyAddress, emptyAddress, trialAsset, emptyAddress],
      [0, 0, 0],
      '0x0',
    );
    if (trial.expectPass) {
      await expect(evaluate.call()).resolves.not.toThrow();
    } else {
      await expect(evaluate.call()).rejects.toThrow('Rule evaluated to false');
    }
  });
});
