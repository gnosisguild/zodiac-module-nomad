// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity 0.8.6;

import "@gnosis.pm/zodiac/contracts/core/Module.sol";

interface IXAppConnectionManager {
    function isReplica(address _replica) external view returns (bool);
}

contract GnomadModule is Module {
    event GnomadModuleSetup(
        address indexed initiator,
        address indexed owner,
        address indexed avatar,
        address target
    );

    /// Address of the Nomad xAppConnectionManager contract
    /// which registers valid Replica contracts and Watchers
    IXAppConnectionManager public manager;
    /// Address of the remote controller which is authorized
    /// to initiate execTransactions on the module from a remote domain.
    address public controller;
    /// Domain of the controller which is authorized to send messages to the module.
    /// Domains are unique identifiers within Nomad for a domain (chain, L1, L2, sidechain, rollup, etc).
    uint32 public controllerDomain;

    /// @param _owner Address of the  owner (TODO: elaborate)
    /// @param _avatar Address of the avatar (e.g. a Safe) (TODO: elaborate)
    /// @param _target Address of the contract that will call exec function (TODO: elaborate)
    /// @param _manager Address of the Nomad xAppConnectionManager contract
    /// which registers valid Replica contracts and Watchers
    /// @param _controller Address of the controller which is authorized to send messages to the module from a remote domain.
    /// @param _controllerDomain Domain of the controller which is authorized to send messages to the module.
    /// Domains are unique identifiers within Nomad for a domain (chain, L1, L2, sidechain, rollup, etc).
    constructor(
        address _owner,
        address _avatar,
        address _target,
        address _manager,
        address _controller,
        uint32 _controllerDomain
    ) {
        bytes memory initParams = abi.encode(
            _owner,
            _avatar,
            _target,
            _manager,
            _controller,
            _controllerDomain
        );
        setUp(initParams);
    }

    function setUp(bytes memory initParams) public override initializer {
        (
            address _owner,
            address _avatar,
            address _target,
            address _manager,
            address _controller,
            uint32 _controllerDomain
        ) = abi.decode(initParams, (address, address, address, address, address, uint32));
        // __Ownable_init prevents this function from being called again after contract construction
        __Ownable_init();

        require(_avatar != address(0), "Avatar can not be zero address");
        require(_target != address(0), "Target can not be zero address");
        require(_controller != address(0), "Controller can not be zero address");
        require(_controllerDomain != 0, "Controller Domain can not be zero");
        avatar = _avatar;
        target = _target;
        manager = IXAppConnectionManager(_manager);
        controller = _controller;
        controllerDomain = _controllerDomain;

        transferOwnership(_owner);

        emit GnomadModuleSetup(msg.sender, _owner, _avatar, _target);
    }

    /// @dev Check that the replica, origin, and controller are valid
    modifier onlyValid(address _caller, uint32 _origin, bytes32 _sender) {
        require(manager.isReplica(_caller), "caller must be a valid replica");
        // coerce Nomad bytes32 sender to address
        address _senderAddr = address(uint160(uint256(_sender)));
        require(isController(_senderAddr, _origin), "Unauthorized controller");
        _;
    }

    /// @dev Set the Replica contract address
    /// @param _manager Address of the Nomad xAppConnectionManager contract,
    /// which registers valid Replica contracts and Watchers
    /// @notice This can only be called by the owner
    function setManager(IXAppConnectionManager _manager) public onlyOwner {
        require(manager != _manager, "Replica address already set to this");
        manager = _manager;
    }

    /// @dev Set the controller
    /// @param _controller Address of controller on the other side of the bridge
    /// @param _controllerDomain Domain of controller on the other side of the bridge
    /// @notice This can only be called by the owner
    function setController(address _controller, uint32 _controllerDomain) public onlyOwner {
        require(!isController(_controller, _controllerDomain), "controller already set to this");
        controller = _controller;
        controllerDomain = _controllerDomain;
    }

    /// @notice Handle incoming execTransactions sent from the Controller via Nomad
    /// the controller is authorized to send execTransactions across-chains
    /// from the controller's native domain to be executed on this module
    /// exec Transactions are sent via Nomad arbitrary message-passing channels
    /// Executes a transaction initiated by the remote controller
    /// @param _origin The domain from which the message was sent (must be the domain of the controller)
    /// @param _sender The message sender (must be the controller)
    /// @param _message The message (abi-encoded params for executeTransaction)
    function handle(
        uint32 _origin,
        uint32, // _nonce (unused)
        bytes32 _sender,
        bytes memory _message
    ) external onlyValid(msg.sender, _origin, _sender) {
        (
            address _to,
            uint256 _value,
            bytes memory _data,
            Enum.Operation _operation
        ) = abi.decode(_message, (address, uint256, bytes, Enum.Operation));
        require(exec(_to, _value, _data, _operation), "Module transaction failed");
    }

    /// @param _controller Address of controller on the other side of the bridge
    /// @param _controllerDomain Domain of controller on the other side of the bridge
    /// @return TRUE if the provided (address,domain) tuple identifies the authorized remote controller
    function isController(address _controller, uint32 _controllerDomain) public view returns (bool) {
        return _controller == controller && _controllerDomain == controllerDomain;
    }
}
