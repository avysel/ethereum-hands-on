pragma solidity ^0.5.0;

contract owned {
    address payable owner;

    // Contract constructor: set owner
    constructor() public {
        owner = msg.sender;
    }

    // Access control modifier
    modifier onlyOwner {
        require(msg.sender == owner, "Only the contract owner can call this function");
        _;
    }

    // Contract destructor
    function destroy() public onlyOwner {
        selfdestruct(owner);
    }

}

contract ProposableHello is owned {

    string private name;

    event NameChanged(string newName, address userAddress, uint value);
    event Withdraw(address ownerAddress, uint balance);

    struct Proposal {
        address payable sender;
        string name;
        uint value;
        uint time;
    }

    address [] public proposers;

    mapping(address => Proposal) public proposals;

    constructor() public {
        name = "nobody";
    }

    function setName(string memory newName) public payable {
        require(msg.value >= 2 ether, "Pay 2 ETH or more");
        name = newName;
        emit NameChanged(newName, msg.sender, msg.value);
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

    function createProposal(string memory newName) public payable {
        require(msg.value >= 2 ether, "Pay 2 ETH or more");
        proposers.push(msg.sender);
        proposals[msg.sender] = Proposal(msg.sender, newName, msg.value, now);
    }

    function selectBestProposal() public onlyOwner {

        Proposal memory bestProposal = proposals[proposers[0]];
        delete proposers[0];

        // search best proposal
        for (uint i=1; i<proposers.length; i++) {
            Proposal memory currentProposal = proposals[proposers[i]];

            if(( currentProposal.value > bestProposal.value) || (currentProposal.value == bestProposal.value && currentProposal.time < bestProposal.time)) {

                address payable sender = bestProposal.sender;
                uint value = bestProposal.value;

                bestProposal = currentProposal;

                // refund sender of previous best
                sender.transfer(value);

            }
            else {
                // refund sender
                currentProposal.sender.transfer(currentProposal.value);
            }

            delete proposals[proposers[i]];
            delete proposers[i];
        }

        // change value
        name = bestProposal.name;
        emit NameChanged(bestProposal.name, bestProposal.sender, bestProposal.value);

    }

}