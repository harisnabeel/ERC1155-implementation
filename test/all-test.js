const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PubgItems", function () {
  let deployer,
    alice,
    accounts = [],
    pubgItemsContractInstance;
  beforeEach(async () => {
    const pubgItemsContract = await hre.ethers.getContractFactory("PubgItems");
    pubgItemsContractInstance = await pubgItemsContract.deploy(
      1000,
      "1000000000000000000"
    );
    await pubgItemsContractInstance.deployed();
    accounts = await hre.ethers.getSigners();
    [deployer, alice] = accounts;
  });

  it("It should set the right the right owner", async () => {
    expect(await pubgItemsContractInstance.connect(alice).owner()).to.equal(
      deployer.address
    );
  });

  it("It Should set the right supply and token price", async () => {
    expect(
      await pubgItemsContractInstance.connect(alice).get_PBG_supply()
    ).to.equal(1000);
    expect(
      await pubgItemsContractInstance.connect(alice).get_PBG_price()
    ).to.equal("1000000000000000000");
  });

  it("Constructor should mint to the deployer", async () => {
    expect(
      await pubgItemsContractInstance
        .connect(alice)
        .balanceOf(deployer.address, 1)
    ).to.equal(1000);
  });

  it("It should create collections and mint", async () => {
    await pubgItemsContractInstance.connect(deployer).createCollection(2, 3);
    expect(await pubgItemsContractInstance.getCollectionsCount()).to.equal(1);
    expect(
      await pubgItemsContractInstance.balanceOf(deployer.address, 2)
    ).to.equal(2);
  });

  it("Only owner should create the collection", async () => {
    await expect(
      pubgItemsContractInstance.connect(alice).createCollection(3, 4)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("Should be able to mint in a collection", async () => {
    await pubgItemsContractInstance.connect(deployer).createCollection(0, 1);
    await pubgItemsContractInstance
      .connect(alice)
      .getPBGTokens(2, { value: "2000000000000000000" });
    await pubgItemsContractInstance.connect(alice).mintToCollection(2, 2);
    expect(
      await pubgItemsContractInstance.balanceOf(alice.address, 2)
    ).to.equal(2);
  });
});
