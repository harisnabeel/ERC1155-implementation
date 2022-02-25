const main = async () => {
  // getting deployer address
  const [deployer, alice] = await hre.ethers.getSigners();
  // getting contract
  let pubgItemsContract = await ethers.getContractFactory("PubgItems");
  const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  // pass deployed address to create its instance
  const pubgItemsContractInstance = await pubgItemsContract.attach(
    CONTRACT_ADDRESS
  );

  const tnx = await pubgItemsContractInstance
    .connect(alice)
    .getPBGTokens(2, { value: "2000000000000000000" });
  tnx.wait();

  // getting account balance
  console.log(
    await pubgItemsContractInstance.connect(alice).balanceOf(alice.address, 1)
  );
};

const runMain = async () => {
  try {
    await main();
    process.exit(0); // exit Node process without error
  } catch (error) {
    console.log(error);
    process.exit(1); // exit Node process while indicating 'Uncaught Fatal Exception' error
  }
  // Read more about Node exit ('process.exit(num)') status codes here: https://stackoverflow.com/a/47163396/7974948
};

runMain();
