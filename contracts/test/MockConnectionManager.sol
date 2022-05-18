// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity ^0.8.6;

contract MockConnectionManager {
  address public replica;

  function isReplica(address _replica) external view returns (bool) {
    require(_replica == replica, "invalid replica");
    return true;
  }
}
