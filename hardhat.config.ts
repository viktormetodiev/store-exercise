import '@typechain/hardhat';
import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-waffle';

import * as dotenv from 'dotenv';

import { HardhatUserConfig, task } from 'hardhat/config';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

dotenv.config();

task('accounts', 'Prints the list of accounts', async (_, hre) => {
  const accounts = await hre.ethers.getSigners();

  accounts.forEach((account: SignerWithAddress) => {
    console.log(account);
  });
});

const config: HardhatUserConfig = {
  solidity: '0.8.11',
};

export default config;
