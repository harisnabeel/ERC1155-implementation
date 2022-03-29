const { expect, assert } = require("chai");
const { ethers } = require("hardhat");

describe("PubgItems", function () {
  let deployer,
    alice,
    bob,
    jake,
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
    [deployer, alice, bob, jake] = accounts;
  });

  it("It should set the right owner", async () => {
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

  it("Should allow user to buy PBG tokens", async () => {
    let tokensBeforeBuy = await pubgItemsContractInstance.balanceOf(
      alice.address,
      1
    );
    await pubgItemsContractInstance
      .connect(alice)
      .getPBGTokens(3, { value: "3000000000000000000" });
    expect(
      await pubgItemsContractInstance.balanceOf(alice.address, 1)
    ).to.equal(tokensBeforeBuy + 3);
  });

  it("Should allow to mint in a collection", async () => {
    await pubgItemsContractInstance.connect(deployer).createCollection(0, 1);
    await pubgItemsContractInstance
      .connect(alice)
      .getPBGTokens(2, { value: "2000000000000000000" });
    await pubgItemsContractInstance.connect(alice).mintToCollection(2, 2);
    expect(
      await pubgItemsContractInstance.balanceOf(alice.address, 2)
    ).to.equal(2);
  });

  it("Should be able to set Collection's minting Fees", async () => {
    await pubgItemsContractInstance.connect(deployer).createCollection(0, 5);
    expect(
      await pubgItemsContractInstance.getCollectionMintingFees(1)
    ).to.equal(5);
  });

  it("Should allow the owner to set PBG token price", async () => {
    await pubgItemsContractInstance
      .connect(deployer)
      .set_PBG_price("3000000000000000000");
    expect(await pubgItemsContractInstance.get_PBG_price()).to.equal(
      "3000000000000000000"
    );
  });

  it("Should allow users to buy PBG token", async () => {
    await pubgItemsContractInstance
      .connect(alice)
      .getPBGTokens(4, { value: "4000000000000000000" });
    expect(
      await pubgItemsContractInstance.connect(alice).balanceOf(alice.address, 1)
    ).to.equal(4);
  });

  it("Should allow Owner to mint PBG tokens", async () => {
    let supplyBeforeMint = await pubgItemsContractInstance.get_PBG_supply();
    await pubgItemsContractInstance.connect(deployer).mintPBG(50);
    expect(await pubgItemsContractInstance.get_PBG_supply()).to.equal(
      parseInt(supplyBeforeMint) + 50
    );
  });

  it("Should allow single transfer", async () => {
    await pubgItemsContractInstance.connect(deployer).createCollection(0, 2);
    await pubgItemsContractInstance
      .connect(alice)
      .getPBGTokens(8, { value: "8000000000000000000" });
    await pubgItemsContractInstance.connect(alice).mintToCollection(2, 2);

    let collectionBalanceBeforeTransfer =
      await pubgItemsContractInstance.balanceOf(alice.address, 2);

    await pubgItemsContractInstance
      .connect(alice)
      .safeTransferFrom(alice.address, bob.address, 2, 2, "0x00");
    expect(
      await pubgItemsContractInstance.balanceOf(alice.address, 2)
    ).to.equal(collectionBalanceBeforeTransfer - 2);
  });

  it("Should allow to Batch-transfer tokens", async () => {
    await pubgItemsContractInstance.connect(deployer).createCollection(0, 2);
    await pubgItemsContractInstance
      .connect(alice)
      .getPBGTokens(8, { value: "8000000000000000000" });
    // console.log(await pubgItemsContractInstance.balanceOf(alice.address, 1));
    await pubgItemsContractInstance.connect(alice).mintToCollection(2, 2);

    expect(
      await pubgItemsContractInstance.balanceOf(alice.address, 1)
    ).to.equal(4);

    let pbgBalanceBeforeTransfer = await pubgItemsContractInstance.balanceOf(
      alice.address,
      1
    );
    let collectionBalanceBeforeTransfer =
      await pubgItemsContractInstance.balanceOf(alice.address, 2);

    await pubgItemsContractInstance
      .connect(alice)
      .safeBatchTransferFrom(
        alice.address,
        bob.address,
        [1, 2],
        [2, 2],
        "0x00"
      );

    expect(
      await pubgItemsContractInstance.balanceOf(alice.address, 1)
    ).to.equal(pbgBalanceBeforeTransfer - 2);

    expect(
      await pubgItemsContractInstance.balanceOf(alice.address, 2)
    ).to.equal(collectionBalanceBeforeTransfer - 2);

    expect(await pubgItemsContractInstance.balanceOf(bob.address, 1)).to.equal(
      2
    );

    expect(await pubgItemsContractInstance.balanceOf(bob.address, 2)).to.equal(
      2
    );
  });

  it("Should set approval for all", async () => {
    await pubgItemsContractInstance.connect(deployer).createCollection(0, 2);
    await pubgItemsContractInstance
      .connect(alice)
      .getPBGTokens(8, { value: "8000000000000000000" });
    await pubgItemsContractInstance
      .connect(alice)
      .setApprovalForAll(bob.address, true);
    expect(
      await pubgItemsContractInstance
        .connect(bob)
        .isApprovedForAll(alice.address, bob.address)
    ).to.equal(true);
  });

  it("Should allow to approve and transfer", async () => {
    await pubgItemsContractInstance.connect(deployer).createCollection(0, 2);
    await pubgItemsContractInstance
      .connect(alice)
      .getPBGTokens(8, { value: "8000000000000000000" });
    await pubgItemsContractInstance
      .connect(alice)
      .setApprovalForAll(bob.address, true);
    expect(
      await pubgItemsContractInstance
        .connect(bob)
        .isApprovedForAll(alice.address, bob.address)
    ).to.equal(true);
    await pubgItemsContractInstance
      .connect(bob)
      .safeTransferFrom(alice.address, jake.address, 1, 5, "0x00");

    expect(
      await pubgItemsContractInstance.balanceOf(alice.address, 1)
    ).to.equal(3);

    expect(await pubgItemsContractInstance.balanceOf(jake.address, 1)).to.equal(
      5
    );
  });

  it("Should return correct collection count", async () => {
    await pubgItemsContractInstance.connect(deployer).createCollection(10, 2);
    await pubgItemsContractInstance.connect(deployer).createCollection(30, 3);
    await pubgItemsContractInstance.connect(deployer).createCollection(20, 4);
    expect(await pubgItemsContractInstance.getCollectionsCount()).to.equal(3);
  });
});
