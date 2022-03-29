const main = async () => {
  const [deployer] = await hre.ethers.getSigners();
  const accountBalance = await deployer.getBalance();

  console.log("Deploying contracts with account: ", deployer.address);
  console.log("Account balance: ", accountBalance.toString());

  const LandContract = await hre.ethers.getContractFactory("Land");
  const LAND_CONTRACT_INSTANCE = await LandContract.deploy();
  // console.log(LandContract);
  await LAND_CONTRACT_INSTANCE.deployed();

  console.log("Land Conctract address ", LAND_CONTRACT_INSTANCE.address);
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

runMain();
