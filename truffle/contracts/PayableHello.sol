pragma solidity ^0.5.16;

import "./Ownable.sol";

contract PayableHello is Ownable {

    string private name;

    event NameChanged(string newName, address userAddress, uint value);
    event Withdraw(address ownerAddress, uint balance);

    constructor() public {
        name = "nobody";
    }

    function setName(string memory _newName) public payable {
        require(msg.value >= 2 ether, "Pay 2 ETH or more");
        name = _newName;
        emit NameChanged(_newName, msg.sender, msg.value);
    }

    function getName() public view returns (string memory) {
        return name;
    }

    function withdraw() public onlyOwner {
        uint balance = address(this).balance;
        msg.sender.transfer(balance);
        emit Withdraw(msg.sender, balance);
    }

    function() external payable {
        revert();
    }

}