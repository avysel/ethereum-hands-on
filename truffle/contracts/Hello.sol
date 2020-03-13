pragma solidity ^0.5.0;

contract Hello {

    bytes32 private name;

    event NameChanged(bytes32 newName);

    constructor() public {
        name = "nobody";
    }

    function setName(bytes32 _newName) public {
        name = _newName;
        emit NameChanged(_newName);
    }

    function getName() public view returns (bytes32) {
        return name;
    }
}