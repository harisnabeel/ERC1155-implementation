// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const { updateContractAddresses } = require("../utils/contractsDetailsManager");
const network = hre.hardhatArguments.network;

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const [deployer] = await hre.ethers.getSigners();
  const accountBalance = await deployer.getBalance();

  console.log("Deploying contracts with account: ", deployer.address);
  console.log("Account balance: ", accountBalance.toString());

  const LandContract = await hre.ethers.getContractFactory("Land");
  const LAND_CONTRACT_INSTANCE = await LandContract.deploy();
  // console.log(LandContract);
  await LAND_CONTRACT_INSTANCE.deployed();

  console.log("Land Conctract address ", LAND_CONTRACT_INSTANCE.address);

  const pubgItemsContract = await hre.ethers.getContractFactory("PubgItems");
  const PUBGITEMS_CONTRACT_INSTANCE = await pubgItemsContract.deploy(
    1000,
    "1000000000000000000"
  );

  await PUBGITEMS_CONTRACT_INSTANCE.deployed();

  console.log("Pubg Items deployed to:", PUBGITEMS_CONTRACT_INSTANCE.address);

  const mainContract = await hre.ethers.getContractFactory("Main");
  const MAIN_CONTRACT_INSTANCE = await mainContract.deploy(
    LAND_CONTRACT_INSTANCE.address,
    PUBGITEMS_CONTRACT_INSTANCE.address
  );

  await MAIN_CONTRACT_INSTANCE.deployed();

  console.log("Main contract deployed to:", MAIN_CONTRACT_INSTANCE.address);

  console.log("Configuring Main Contract address in LAND contract");
  await LAND_CONTRACT_INSTANCE.configureMain(MAIN_CONTRACT_INSTANCE.address);
  console.log("Configuring Main Contract address in PubgItems contract");
  await PUBGITEMS_CONTRACT_INSTANCE.configureMain(
    MAIN_CONTRACT_INSTANCE.address
  );
  console.log("Configuration Successfull");
  //   let balancee = await PUBGITEMS_CONTRACT_INSTANCE
  //     .connect(deployer)
  //     .balanceOf(deployer.address, 1);
  //   balancee = balancee.toString();
  //   console.log(balancee);

  updateContractAddresses(
    {
      LandContract: LAND_CONTRACT_INSTANCE.address,
      PubgItemsContract: PUBGITEMS_CONTRACT_INSTANCE.address,
      MainContract: MAIN_CONTRACT_INSTANCE.address,
    },
    network
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
