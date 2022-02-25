require("@nomiclabs/hardhat-waffle");
const { version } = require("chai");
let secret = require("./secret.json");
require("@nomiclabs/hardhat-etherscan");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.7",
  networks: {
    rinkeby: {
      url: `${secret.rinkeby_key}`,
      accounts: [secret.key],
    },
    ropsten: {
      url: `${secret.ropsten_key}`,
      accounts: [secret.key],
    },
    goerli: {
      url: `${secret.goerli_key}`,
      accounts: [secret.key],
    },
    bsc_testnet: {
      url: `${secret.bsc_key}`,
      accounts: [secret.key],
    },
  },
  etherscan: {
    apiKey: {
      ropsten: `${secret.etherscan_key}`,
    },
  },
};
