// import "hardhat-deploy";
// import "@nomiclabs/hardhat-ethers";
// import { task, types } from "hardhat/config";
// import { HardhatRuntimeEnvironment } from "hardhat/types";
// import { deployAndSetUpModule, KnownContracts } from "@gnosis.pm/zodiac";
// import { formatBytes32String } from "ethers/lib/utils";

// interface GnomadTaskArgs {
//   owner: string;
//   avatar: string;
//   target: string;
//   manager: string;
//   controller: string;
//   chainid: number;
//   proxied: boolean;
// }

// const deployGnomadModule = async (
//   taskArgs: GnomadTaskArgs,
//   hardhatRuntime: HardhatRuntimeEnvironment
// ) => {
//   const [caller] = await hardhatRuntime.ethers.getSigners();
//   console.log("Using the account:", caller.address);

//   if (taskArgs.proxied) {
//     const chainId = await hardhatRuntime.getChainId();
//     const { transaction } = deployAndSetUpModule(
//       KnownContracts["gnomad"],
//       {
//         types: [
//           "address",
//           "address",
//           "address",
//           "address",
//           "address",
//           "uint32",
//         ],
//         values: [
//           taskArgs.owner,
//           taskArgs.avatar,
//           taskArgs.target,
//           taskArgs.amb,
//           taskArgs.controller,
//           taskArgs.chainId,
//         ],
//       },
//       hardhatRuntime.ethers.provider,
//       Number(chainId),
//       Date.now().toString()
//     );

//     const deploymentTransaction = await caller.sendTransaction(transaction);
//     const receipt = await deploymentTransaction.wait();
//     console.log("Gnomad module deployed to:", receipt.logs[1].address);
//     return;
//   }

//   const Module = await hardhatRuntime.ethers.getContractFactory("GnomadModule");
//   const module = await Module.deploy(
//     taskArgs.owner,
//     taskArgs.avatar,
//     taskArgs.target,
//     taskArgs.manager,
//     taskArgs.controller,
//     taskArgs.chainId
//   );

//   console.log("Gnomad module deployed to:", module.address);
// };

// task("setup", "deploy a Gnomad Module")
//   .addParam("owner", "Address of the owner", undefined, types.string)
//   .addParam("avatar", "Address of the avatar", undefined, types.string)
//   .addParam("target", "Address of the target", undefined, types.string)
//   .addParam("manager", "Address of the manager", undefined, types.string)
//   .addParam(
//     "controller",
//     "Address of the controller on the other side of the bridge",
//     undefined,
//     types.string
//   )
//   .addParam(
//     "chainid",
//     "Chain ID on the other side of the bridge",
//     undefined,
//     types.int
//   )
//   .addParam(
//     "proxied",
//     "Deploys contract through factory",
//     false,
//     types.boolean,
//     true
//   )
//   .setAction(deployGnomadModule);

// task("verifyEtherscan", "Verifies the contract on etherscan")
//   .addParam("module", "Address of the AMB module", undefined, types.string)
//   .addParam("owner", "Address of the owner", undefined, types.string)
//   .addParam(
//     "avatar",
//     "Address of the avatar (e.g. Safe)",
//     undefined,
//     types.string
//   )
//   .addParam("target", "Address of the target", undefined, types.string)
//   .addParam("amb", "Address of the AMB", undefined, types.string)
//   .addParam(
//     "controller",
//     "Address of the controller on the other side of the AMB",
//     undefined,
//     types.string
//   )
//   .addParam(
//     "chainid",
//     "Chain ID on the other side of the AMB",
//     undefined,
//     types.string
//   )
//   .setAction(
//     async (taskArgs: BridgeTaskArgs & { module: string }, hardhatRuntime) => {
//       await hardhatRuntime.run("verify", {
//         address: taskArgs.module,
//         constructorArgsParams: [
//           taskArgs.owner,
//           taskArgs.avatar,
//           taskArgs.target,
//           taskArgs.manager,
//           taskArgs.controller,
//           taskArgs.chainid,
//         ],
//       });
//     }
//   );

// export {};

// function intToBytes32HexString(i: number): string {
//   // convert to hex string
//   // pad left with zeros up until 64 -> 32 bytes
//   return `0x${i.toString(16).padStart(64, "0")}`;
// }
