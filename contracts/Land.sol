// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

// import "hardhat/console.sol";

contract Land is ERC721 {
    address private _owner;
    address private _mainContract;

    mapping(uint256 => address) tokenToOwner;

    constructor() ERC721("My Land", "ML") {
        _owner = msg.sender;
    }

    modifier onlyMainCaller() {
        require(msg.sender == _mainContract, "Land: Unauthorized Access!");
        _;
    }

    function configureMain(address _mainContractAddress)
        external
        onlyOwner(msg.sender)
    {
        require(
            _mainContractAddress != address(0),
            "PubgItems: Invalid Main Contract Address!"
        );
        require(
            _mainContract == address(0),
            "PubgItems: Main Contract Alredy Configured!"
        );

        _mainContract = _mainContractAddress;
    }

    // using Counters for Counters.Counter;

    // Counters.Counter public tokenCounter;
    // uint public tokenCounter;

    function mint(address _to, uint256 _tokenID) public payable onlyMainCaller {
        // console.log(msg.value);
        require(msg.value == 1, "Send more ethers: 1 ether is required");
        require(balanceOf(_to) == 0, "You can not have more than 1 Land");
        _safeMint(_to, _tokenID);
        tokenToOwner[_tokenID] = _to;
        _approve(_mainContract, _tokenID);
    }

    function transferFrom(
        address _sender,
        address _recipient,
        uint256 _tokenID
    ) public override onlyMainCaller {
        require(_tokenID > 0, "Land: Token Id should be non-zero");
        require(
            _isApprovedOrOwner(_msgSender(), _tokenID),
            "Land: transfer caller is neither owner nor approved"
        );

        safeTransferFrom(_sender, _recipient, _tokenID);
        tokenToOwner[_tokenID] = _recipient;
        _approve(_mainContract, _tokenID);
    }

    function withdraw() public onlyOwner(msg.sender) {
        payable(msg.sender).transfer(address(this).balance);
    }

    function owner() public view returns (address) {
        return _owner;
    }

    modifier onlyOwner(address callerOfFunction) {
        require(callerOfFunction == _owner, "Caller is not the owner");
        _;
    }
}
