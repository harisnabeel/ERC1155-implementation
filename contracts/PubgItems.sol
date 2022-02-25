// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

import "hardhat/console.sol";

contract PubgItems is ERC1155, Ownable {
    uint256 private _PBG_coin_supply;
    uint256 private _PBG_price;
    mapping(uint256 => uint256) public collectionsMintingFees; // collections to fees in PBG tokens
    uint256 collectionsCount; //total collections count

    // _initial_PBG_price is value in WEI
    constructor(uint256 _initial_supply, uint256 _initial_PBG_price)
        ERC1155("")
    {
        _PBG_price = _initial_PBG_price;
        _PBG_coin_supply = _initial_supply;
        tokenCounter.increment();
        _mint(msg.sender, tokenCounter.current(), _initial_supply, "");
    }

    using Counters for Counters.Counter;

    Counters.Counter tokenCounter;

    // e.g 1 = PBG tokens , 2 = cars collection , 3 = guns collection and so on
    function createCollection(
        uint256 _quantityOfToken,
        uint256 _collectionMintingFees
    ) public onlyOwner {
        collectionsCount++;
        tokenCounter.increment();
        collectionsMintingFees[tokenCounter.current()] = _collectionMintingFees;
        _mint(msg.sender, tokenCounter.current(), _quantityOfToken, "");
    }

    // minting in a collection
    function mintToCollection(uint256 _id, uint256 _quantityOfToken) public {
        require(_id != 1, "You can not mint PGB tokens");
        require(
            balanceOf(msg.sender, 1) >=
                _quantityOfToken * collectionsMintingFees[_id],
            "Need to spend some more PBG tokens"
        );
        _safeTransferFrom(
            msg.sender,
            owner(),
            1,
            _quantityOfToken * collectionsMintingFees[_id],
            ""
        );
        _mint(msg.sender, _id, _quantityOfToken, "");
    }

    // transfers PBG against ETH.
    function getPBGTokens(uint256 _quantity) public payable {
        require(
            msg.value >= _quantity * _PBG_price,
            "Need to spend some more ethers"
        );
        _safeTransferFrom(owner(), address(msg.sender), 1, _quantity, "");
    }

    //owners can mint utility/PBG token
    function mintPBG(uint256 _quantityOfToken) external onlyOwner {
        _PBG_coin_supply += _quantityOfToken;
        _mint(msg.sender, 1, _quantityOfToken, "");
    }

    // sets fees is in PBG tokens
    function setCollectionMintingFees(uint256 _id, uint256 _newFees)
        public
        onlyOwner
    {
        collectionsMintingFees[_id] = _newFees;
    }

    function getCollectionsCount() public view returns (uint256) {
        return collectionsCount;
    }

    function withDraw() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    // new price in WEI
    function set_PBG_price(uint256 _newPrice) public onlyOwner {
        _PBG_price = _newPrice;
    }

    // returns PBG coin supply
    function get_PBG_supply() public view returns (uint256) {
        return _PBG_coin_supply;
    }
}
