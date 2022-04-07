// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity ^0.8.6;

import "@gnosis.pm/zodiac/contracts/core/Module.sol";

contract GnomadModule is Module {
    event GnomadModuleSetup(
        address indexed initiator,
        address indexed owner,
        address indexed avatar,
        address target
    );

    address public replica;
    address public controller;
    bytes32 public chainId;

    /// @param _owner Address of the  owner
    /// @param _avatar Address of the avatar (e.g. a Safe)
    /// @param _target Address of the contract that will call exec function
    /// @param _amb Address of the AMB contract
    /// @param _controller Address of the authorized controller contract on the other side of the bridge
    /// @param _chainId Address of the authorized chainId from which owner can initiate transactions
    constructor(
        address _owner,
        address _avatar,
        address _target,
        address _replica,
        address _controller,
        bytes32 _chainId
    ) {
        bytes memory initParams = abi.encode(
            _owner,
            _avatar,
            _target,
            _replica,
            _controller,
            _chainId
        );
        setUp(initParams);
    }

    function setUp(bytes memory initParams) public override {
        (
            address _owner,
            address _avatar,
            address _target,
            address _replica,
            address _controller,
            bytes32 _chainId
        ) = abi.decode(initParams, (address, address, address, address, address, bytes32));
        __Ownable_init();

        require(_avatar != address(0), "Avatar can not be zero address");
        require(_target != address(0), "Target can not be zero address");
        avatar = _avatar;
        target = _target;
        replica = _replica;
        controller = _controller;
        chainId = _chainId;

        transferOwnership(_owner);

        emit AmbModuleSetup(msg.sender, _owner, _avatar, _target);
    }

    /// @dev Check that the amb, chainId, and owner are valid
    modifier onlyValid() {
        require(msg.sender == address(amb), "Unauthorized amb");
        require(amb.messageSourceChainId() == chainId, "Unauthorized chainId");
        require(amb.messageSender() == controller, "Unauthorized controller");
        _;
    }

    /// @dev Set the Replica contract address
    /// @param _replica Address of the Replica contract
    /// @notice This can only be called by the avatar
    function setReplica(address _replica) public onlyOwner {
        require(address(replica) != _replica, "Replica address already set to this");
        replica = _replica;
    }

    /// @dev Set the approved chainId
    /// @param _chainId ID of the approved network
    /// @notice This can only be called by the avatar
    function setChainId(bytes32 _chainId) public onlyOwner {
        require(chainId != _chainId, "chainId already set to this");
        chainId = _chainId;
    }

    /// @dev Set the controller address
    /// @param _controller Set the address of controller on the other side of the bridge
    /// @notice This can only be called by the avatar
    function setController(address _controller) public onlyOwner {
        require(controller != _controller, "controller already set to this");
        controller = _controller;
    }

    /// @notice Handle Nomad messages
    /// For all non-Governor chains to handle messages
    /// sent from the Governor chain via Nomad.
    /// Governor chain should never receive messages,
    /// because non-Governor chains are not able to send them
    /// @param _origin The domain (of the Governor Router)
    /// @param _sender The message sender (must be the Governor Router)
    /// @param _message The message
    function handle(
        uint32 _origin,
        uint32, // _nonce (unused)
        bytes32 _sender,
        bytes memory _message
    ) external onlyReplica onlyValid(_origin, _sender) {
        bytes29 _msg = _message.ref(0);
        bytes29 _view = _msg.tryAsBatch();
        if (_view.notNull()) {
            _handleBatch(_view);
            return;
        }
        _view = _msg.tryAsTransferGovernor();
        if (_view.notNull()) {
            _handleTransferGovernor(_view);
            return;
        }
        require(false, "!valid message type");
    }

    /// @dev Executes a transaction initated by the AMB
    /// @param to Target of the transaction that should be executed
    /// @param value Wei value of the transaction that should be executed
    /// @param data Data of the transaction that should be executed
    /// @param operation Operation (Call or Delegatecall) of the transaction that should be executed
    function executeTransaction(
        address to,
        uint256 value,
        bytes memory data,
        Enum.Operation operation
    ) internal {
        require(exec(to, value, data, operation), "Module transaction failed");
    }
}
