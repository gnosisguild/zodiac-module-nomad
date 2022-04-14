import { expect } from "chai";
import hre, { deployments, waffle } from "hardhat";
import "@nomiclabs/hardhat-ethers";

const ZeroAddress = "0x0000000000000000000000000000000000000000";
const FortyTwo =
  "0x000000000000000000000000000000000000000000000000000000000000002a";

describe("GnomadModule", async () => {

  const baseSetup = deployments.createFixture(async () => {
    await deployments.fixture();
    const Avatar = await hre.ethers.getContractFactory("TestAvatar");
    const avatar = await Avatar.deploy();
    const Mock = await hre.ethers.getContractFactory("Mock");
    const mock = await Mock.deploy();
    const ConnectionManager = await hre.ethers.getContractFactory("MockConnectionManager");
    const connectionManager = await ConnectionManager.deploy();
    )

    const signers = await hre.ethers.getSigners();

    return { Avatar, avatar, module, mock, connectionManager, signers };
  });

  const setupTestWithTestAvatar = deployments.createFixture(async () => {
    const base = await baseSetup();
    const Module = await hre.ethers.getContractFactory("GnomadModule");
    const provider = await hre.ethers.getDefaultProvider();
    const network = await provider.getNetwork();
    // TODO: convert home sending contract address to bytes32
    const controller = "";
    // TODO: convert home chainID to uint32
    const origin = 0;
    const controller = "";
    const module = await Module.deploy(
      base.avatar.address,
      base.avatar.address,
      base.avatar.address,
      base.connectionManager.address,
      controller,
      origin
    );
    await base.avatar.setModule(module.address);
    return { ...base, Module, module, network, origin, controller };
  });

  const [user1] = waffle.provider.getWallets();

  describe("setUp()", async () => {
    it("throws if avatar is address zero", async () => {
      const { Module } = await setupTestWithTestAvatar();
      await expect(
        Module.deploy(
          ZeroAddress,
          ZeroAddress,
          ZeroAddress,
          ZeroAddress,
          ZeroAddress,
          FortyTwo
        )
      ).to.be.revertedWith("Avatar can not be zero address");
    });

    it("should emit event because of successful set up", async () => {
      const Module = await hre.ethers.getContractFactory("GnomadModule");
      const module = await Module.deploy(
        user1.address,
        user1.address,
        user1.address,
        user1.address,
        "0x0",
        0
      );
      await module.deployed();
      await expect(module.deployTransaction)
        .to.emit(module, "GnomadModuleSetup")
        .withArgs(user1.address, user1.address, user1.address, user1.address);
    });

    it("throws if target is address zero", async () => {
      const { Module } = await setupTestWithTestAvatar();
      await expect(
        Module.deploy(
          ZeroAddress,
          user1.address,
          ZeroAddress,
          ZeroAddress,
        "0x0",
        0
        )
      ).to.be.revertedWith("Target can not be zero address");
    });
  });

  describe("setGnomad()", async () => {
    it("throws if not authorized", async () => {
      const { module } = await setupTestWithTestAvatar();
      await expect(module.setManager(module.address)).to.be.revertedWith(
        "Ownable: caller is not the owner"
      );
    });

    it("throws if already set to input address", async () => {
      const { module, avatar, connectionManager } = await setupTestWithTestAvatar();

      expect(await module.manager()).to.be.equals(connectionManager.address);

      const calldata = module.interface.encodeFunctionData("setManager", [
        connectionManager.address,
      ]);
      await expect(avatar.exec(module.address, 0, calldata)).to.be.revertedWith(
        "Connection Manager address already set to this"
      );
    });

    it("updates ConnectionManager address", async () => {
      const { module, avatar, connectionManager } = await setupTestWithTestAvatar();

      expect(await module.manager()).to.be.equals(connectionManager.address);

      const calldata = module.interface.encodeFunctionData("setManager", [
        user1.address,
      ]);
      avatar.exec(module.address, 0, calldata);

      expect(await module.manager()).to.be.equals(user1.address);
    });
  });

  describe("setOrigin()", async () => {
    it("throws if not authorized", async () => {
      const { module } = await setupTestWithTestAvatar();
      await expect(module.setOrigin(FortyTwo)).to.be.revertedWith(
        "Ownable: caller is not the owner"
      );
    });

    it("throws if already set to input address", async () => {
      const { module, avatar, network } = await setupTestWithTestAvatar();
      const currentChainID = await module.chainId();
      // todo convert chainID
      const calldata = module.interface.encodeFunctionData("setOrigin", [
        currentChainID,
      ]);
      await expect(avatar.exec(module.address, 0, calldata)).to.be.revertedWith(
        "chainId already set to this"
      );
    });

    it("updates origin", async () => {
      const { module, avatar, network } = await setupTestWithTestAvatar();
      let currentChainID = await module.chainId();
      const newChainID = FortyTwo;
      expect(await currentChainID._hex).to.not.equals(newChainID);

      const calldata = module.interface.encodeFunctionData("setOrigin", [
        newChainID,
      ]);
      avatar.exec(module.address, 0, calldata);

      currentChainID = await module.chainId();

      expect(await currentChainID).to.be.equals(newChainID);
    });
  });

  describe("setController()", async () => {
    it("throws if not authorized", async () => {
      const { module, signers } = await setupTestWithTestAvatar();
      await expect(
        module.connect(signers[3]).setController(user1.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("throws if already set to input address", async () => {
      const { module, avatar } = await setupTestWithTestAvatar();
      const currentController = await module.controller();

      const calldata = module.interface.encodeFunctionData("setController", [
        currentController,
      ]);
      await expect(avatar.exec(module.address, 0, calldata)).to.be.revertedWith(
        "controller already set to this"
      );
    });

    it("updates controller", async () => {
      const { module, avatar, signers } = await setupTestWithTestAvatar();
      let currentController = await module.owner();
      let newController = signers[1].address;

      expect(await currentController).to.not.equals(signers[1].address);

      const calldata = module.interface.encodeFunctionData("setController", [
        newController,
      ]);
      avatar.exec(module.address, 0, calldata);

      currentController = await module.controller();
      expect(await module.controller()).to.be.equals(newController);
    });
  });

  describe("executeTrasnaction()", async () => {
    it("throws if manager replica is unauthorized", async () => {
      const { module } = await setupTestWithTestAvatar();
      const tx = {
        to: user1.address,
        value: 0,
        data: "0xbaddad",
        operation: 0,
      };
      //todo
      await expect(
        module.handle()
      ).to.be.revertedWith("Unauthorized replica");
    });

    it("throws if origin is unauthorized", async () => {
      const { mock, module, connectionManager } = await setupTestWithTestAvatar();
      const gnomadTx = await module.populateTransaction.executeTransaction(
        user1.address,
        0,
        "0xbaddad",
        0
      );
      // todo
      await expect(mock.exec(module.address, 0, gnomadTx.data)).to.be.revertedWith(
        "Unauthorized chainId"
      );
    });

    it("throws if messageSender is unauthorized", async () => {
      const { mock, module, signers, connectionManager } = await setupTestWithTestAvatar();
      const gnomadTx = await module.populateTransaction.executeTransaction(
        user1.address,
        0,
        "0xbaddad",
        0
      );

      await expect(mock.exec(module.address, 0, gnomadTx.data)).to.be.revertedWith(
        "Unauthorized controller"
      );
    });

    it("throws if module transaction fails", async () => {
      const { mock, module } = await setupTestWithTestAvatar();
      const gnomadTx = await module.populateTransaction.executeTransaction(
        user1.address,
        10000000,
        "0xbaddad",
        0
      );

      // should fail because value is too high
      await expect(mock.exec(module.address, 0, gnomadTx.data)).to.be.revertedWith(
        "Module transaction failed"
      );
    });

    it("executes a transaction", async () => {
      const { mock, module, signers } = await setupTestWithTestAvatar();

      const moduleTx = await module.populateTransaction.setController(
        signers[1].address
      );

      const gnomadTx = await module.populateTransaction.executeTransaction(
        module.address,
        0,
        moduleTx.data,
        0
      );

      await mock.exec(module.address, 0, gnomadTx.data);

      expect(await module.controller()).to.be.equals(signers[1].address);
    });
  });
});
