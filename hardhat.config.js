require('@nomiclabs/hardhat-waffle');

const { task } = require('hardhat/config');

task('accounts', 'Prints the list of accounts', async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  accounts.forEach((account) => {
    console.log(account);
  });
});

module.exports = {
  solidity: '0.8.11',
};
