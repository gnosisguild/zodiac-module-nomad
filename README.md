# zodiac-module-gnomad

[![Build Status](https://github.com/gnosis/zodiac-module-gnomad/actions/workflows/ci.yml/badge.svg)](https://github.com/gnosis/zodiac-module-gnomad/actions/workflows/ci.yml)
[![Coverage Status](https://coveralls.io/repos/github/gnosis/zodiac-module-gnomad/badge.svg?branch=master)](https://coveralls.io/github/gnosis/zodiac-module-gnomad?branch=master)


The Gnomad Module belongs to the [Zodiac](https://github.com/gnosis/zodiac) collection of tools, which can be accessed through the Zodiac App available on [Gnosis Safe](https://gnosis-safe.io/), as well as in this repository. 

If you have any questions about Zodiac, join the [Gnosis Guild Discord](https://discord.gg/wwmBWTgyEq). Follow [@GnosisGuild](https://twitter.com/gnosisguild) on Twitter for updates.

### About the Gnomad Module

This module allows an account on one network to control a avatar ([Gnosis Safe](https://gnosis-safe.io)) on any other network where there is a suitable [Nomad](https://nomad.xyz) bridge.

### Features

- Execute transactions initiated by an approved address on an approved chainId via a Nomad's optimistic data bridge.

### Flow

- On chain (a), deploy a Gnosis Safe and Gnomad Module, specifying the `xAppConnectionManager` contract addres, the controller address on chain (b), and the domain of chain (b) that will be allowed to trigger execution via the Gnomad Module.
- Enable Gnomad Module on the Safe.
- On chain (b), call `dispatch()` on the [home contract](https://github.com/nomad-xyz/monorepo/blob/main/packages/contracts-core/contracts/Home.sol).
- On chain (a), call `proveAndProcess()` on the [Replica contract](https://github.com/nomad-xyz/monorepo/blob/main/packages/contracts-core/contracts/Replica.sol).
  
### Solidity Compiler

The contracts have been developed with [Solidity 0.8.6](https://github.com/ethereum/solidity/releases/tag/v0.8.6). 

### License

Created under the [LGPL-3.0+ license](LICENSE).

### Audits

An audit has been performed by the [G0 group](https://github.com/g0-group).

All issues and notes of the audit have been addressed in commit [d8870245e3badffff9007481c98fdfc17e89b82c](https://github.com/gnosis/zodiac-module-gnomad/blob/d8870245e3badffff9007481c98fdfc17e89b82c/contracts/GnomadModule.sol).

The audit results are available as a pdf in [this repo](audits/ZodiacGnomadModuleMay2022.pdf).

### Security and Liability

All contracts are WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
