require("@nomiclabs/hardhat-waffle");
const { version } = require("chai");
const { task } = require("hardhat/config");
let secret = require("./secret.json");
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-web3");
const fs = require("fs");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

async function getContractInstance() {
  const pubgItemsContract = await ethers.getContractFactory("PubgItems");
  const pubgItemsContractInstance = await pubgItemsContract.attach(
    "0xa3F646f1Af1F3C4871e712379409FaAA81966132"
  );
  return pubgItemsContractInstance;
}
async function getLandContractInstance() {
  const landContract = await ethers.getContractFactory("Land");
  const landContractInstance = await landContract.attach(
    "0xa3F646f1Af1F3C4871e712379409FaAA81966132"
  );
  return landContractInstance;
}
async function getMainContractInstance() {
  const mainContract = await ethers.getContractFactory("Main");
  const mainContractInstance = await mainContract.attach(
    "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
  );
  return mainContractInstance;
}

task("minttocollection", "Mints a token in a collection")
  .addParam("address", "Caller of function")
  .addParam("idofcollection", "Collection to mint in")
  .addParam("quantity", "The amount of token")
  .setAction(async (taskArgs) => {
    const accounts = await hre.ethers.getSigners();
    // Create the contract instance
    const pubgItemsContractInstance = await getContractInstance();

    // Mint
    await pubgItemsContractInstance
      .connect(accounts[taskArgs.address])
      .mintToCollection(taskArgs.idofcollection, taskArgs.quantity);
    console.log("Minted succesfully to " + taskArgs.address);
  });

task("getPbg", "Buys PBG token")
  .addParam("address", "Caller of function")
  .addParam("quantity", "The amount of token to buy")
  .setAction(async (taskArgs) => {
    const accounts = await hre.ethers.getSigners();
    // Create the contract instance
    const pubgItemsContractInstance = await getContractInstance();

    let currentAccount = accounts[taskArgs.address];

    await pubgItemsContractInstance
      .connect(currentAccount)
      .getPBGTokens(taskArgs.quantity, {
        value: (taskArgs.quantity * 1000000000000000000).toString(),
      });

    let balance = await pubgItemsContractInstance.balanceOf(
      currentAccount.address,
      1
    );
    console.log("PBG balance is " + balance.toString());
  });

task("createcollection", "Owners can create collection")
  .addParam("address", "Caller of function")
  .addParam("quantity", "Quantity to mint")
  .addParam("mintingfees", "Sets this collections minting fees in PBG")
  .setAction(async (taskArgs) => {
    const accounts = await hre.ethers.getSigners();
    const pubgItemsContractInstance = await getContractInstance();
    let currentAccount = accounts[taskArgs.address];

    await pubgItemsContractInstance
      .connect(currentAccount)
      .createCollection(taskArgs.quantity, taskArgs.mintingfees);
    console.log("Collection created successfully");
    // let collectionCount = await pubgItemsContractInstance.getCollectionsCount();
    // console.log("Collection created with ID " + collectionCount);
  });

task("mintLand", "mints Land ERC721 contract").setAction(async (taskArgs) => {
  const accounts = await hre.ethers.getSigners();
  const mainContractInstance = await getMainContractInstance();

  await mainContractInstance
    .connect(accounts[0])
    .mint({ value: "1000000000000000000" });
});
//----------------------------------------------------------------Main Tasks--------------------------------------------------
task("mint", "Mints through Main contract")
  .addParam("quantity")
  .addParam("collectionid")
  .addParam("caller", "index of caller")
  .setAction(async (taskArgs) => {
    const accounts = await hre.ethers.getSigners();
    const currentAccount = accounts[taskArgs.caller];
    const mainContractInstance = await getMainContractInstance();
    await mainContractInstance
      .connect(currentAccount)
      .mint(taskArgs.quantity, taskArgs.collectionId, {
        value: "1".toString(),
      });
    // console.log("Minted Successfully");
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
      rinkeby: `${secret.etherscan_key}`,
    },
  },
};
