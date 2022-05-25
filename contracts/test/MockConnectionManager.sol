// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity 0.8.6;

contract MockConnectionManager {
  address public replica = address(0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266);

  function isReplica(address _replica) external view returns (bool) {
    if (_replica == replica) {
      return true;
    } else {
      return false;
    }
  }
}
