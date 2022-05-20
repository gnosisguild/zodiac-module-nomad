import { expect } from "chai";
import hre, { deployments, ethers } from "hardhat";
import "@nomiclabs/hardhat-ethers";
import { AbiCoder, formatBytes32String } from "ethers/lib/utils";

const FirstAddress = "0x0000000000000000000000000000000000000001";
const saltNonce = "0xfa";

describe("Module works with factory", () => {
  const chainId = formatBytes32String("55")

  const paramsTypes = ["address", "address", "address", "address", "address", "uint32"];

  const baseSetup = deployments.createFixture(async () => {
    await deployments.fixture();
    const Factory = await hre.ethers.getContractFactory("ModuleProxyFactory");
    const Gnomad = await hre.ethers.getContractFactory("GnomadModule");
    const factory = await Factory.deploy();

    const masterCopy = await Gnomad.deploy(
      FirstAddress,
      FirstAddress,
      FirstAddress,
      FirstAddress,
      FirstAddress,
      0
    );

    return { factory, masterCopy };
  });

  it("should throw because master copy is already initialized", async () => {
    const { masterCopy } = await baseSetup();
    const [avatar, controller, manager] = await ethers.getSigners();

    const encodedParams = new AbiCoder().encode(paramsTypes, [
      avatar.address,
      avatar.address,
      avatar.address,
      manager.address,
      controller.address,
      0
    ]);

    await expect(masterCopy.setUp(encodedParams)).to.be.revertedWith(
      "Initializable: contract is already initialized"
    );
  });

  it("should deploy new amb module proxy", async () => {
    const { factory, masterCopy } = await baseSetup();
    const [avatar, controller, manager] = await ethers.getSigners();
    const paramsValues = [
      avatar.address,
      avatar.address,
      avatar.address,
      manager.address,
      controller.address,
      0
    ];
    const encodedParams = [new AbiCoder().encode(paramsTypes, paramsValues)];
    const initParams = masterCopy.interface.encodeFunctionData(
      "setUp",
      encodedParams
    );
    const receipt = await factory
      .deployModule(masterCopy.address, initParams, saltNonce)
      .then((tx: any) => tx.wait());

    // retrieve new address from event
    const {
      args: [newProxyAddress],
    } = receipt.events.find(
      ({ event }: { event: string }) => event === "ModuleProxyCreation"
    );

    const newProxy = await hre.ethers.getContractAt(
      "GnomadModule",
      newProxyAddress
    );
    expect(await newProxy.controller()).to.be.eq(controller.address);
    expect(await newProxy.controllerDomain()).to.be.eq(0);
  });
});
