// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

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

  const pubgItemsContract = await hre.ethers.getContractFactory("PubgItems");
  const pubgItemsContractInstance = await pubgItemsContract.deploy(
    1000,
    "1000000000000000000"
  );

  await pubgItemsContractInstance.deployed();

  console.log("Pubg Items deployed to:", pubgItemsContractInstance.address);
  //   let balancee = await pubgItemsContractInstance
  //     .connect(deployer)
  //     .balanceOf(deployer.address, 1);
  //   balancee = balancee.toString();
  //   console.log(balancee);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
