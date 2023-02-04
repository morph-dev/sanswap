import { artifacts } from 'hardhat';

import * as fs from 'fs';
import path from 'path';

const CONTRACTS = new Set([
  'IERC20',
  'IERC20Metadata',
  'Bank',
  'MintableToken',
  'SanSwapPool',
  'SanSwapFactory',
  'SanSwapRouter',
]);

export async function updateAbi() {
  const contractsDir = path.join(__dirname, '..', '..', 'frontend', 'src', 'contracts');

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  } else {
    const files = fs.readdirSync(contractsDir);
    for (const file of files) {
      if (file.endsWith('.abi.json')) {
        fs.rmSync(path.join(contractsDir, file));
      }
    }
  }

  const fullContractNames = await artifacts.getAllFullyQualifiedNames();

  for (const fullName of fullContractNames) {
    const artifact = artifacts.readArtifactSync(fullName);
    if (!CONTRACTS.has(artifact.contractName)) {
      continue;
    }
    console.log('Writing:', artifact.contractName);
    fs.writeFileSync(
      path.join(contractsDir, `${artifact.contractName}.abi.json`),
      JSON.stringify(artifact.abi, null, 2)
    );
  }
}

async function main() {
  updateAbi();
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
