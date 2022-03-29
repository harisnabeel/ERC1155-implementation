// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

import "hardhat/console.sol";

contract PubgItems is ERC1155, Ownable {
    uint256 private _PBG_coin_supply;
    uint256 private _PBG_price;
    mapping(uint256 => uint256) public collectionsMintingFees; // collections to fees in PBG tokens
    uint256 collectionsCount; //total collections count
    address private _mainContract;

    // _initial_PBG_price is value in WEI
    constructor(uint256 _initial_supply, uint256 _initial_PBG_price)
        ERC1155(
            "https://gateway.pinata.cloud/ipfs/Qmbr3JNPkRFZ3rXEKWdgy5wmeXMjNWqcpX9VcTuFyCML3p/"
        )
    {
        _PBG_price = _initial_PBG_price;
        _PBG_coin_supply = _initial_supply;
        tokenCounter.increment(); // this will be PBG/utility token, and will be FT token.
        _mint(msg.sender, tokenCounter.current(), _initial_supply, "");
    }

    modifier onlyMainCaller() {
        require(msg.sender == _mainContract, "PubgItems: Unauthorized Access!");
        _;
    }

    function configureMain(address _mainContractAddress) external onlyOwner {
        // TODO: Only Owner Modifier
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

    using Counters for Counters.Counter;

    Counters.Counter tokenCounter;

    // e.g 1 = PBG tokens , 2 = cars collection , 3 = guns collection and so on
    function createCollection(
        uint256 _quantityOfToken,
        uint256 _collectionMintingFees
    ) public onlyOwner {
        collectionsCount++;
        tokenCounter.increment();
        collectionsMintingFees[collectionsCount] = _collectionMintingFees;
        _mint(msg.sender, tokenCounter.current(), _quantityOfToken, "");
        // console.log(collectionsMintingFees[collectionsCount]);
    }

    function uri(uint256 _id) public pure override returns (string memory) {
        return
            string(
                abi.encodePacked(
                    "https://gateway.pinata.cloud/ipfs/Qmbr3JNPkRFZ3rXEKWdgy5wmeXMjNWqcpX9VcTuFyCML3p/",
                    Strings.toString(_id),
                    ".json"
                )
            );
    }

    // minting in a collection
    function mintToCollection(
        address _to,
        uint256 _id,
        uint256 _quantityOfToken
    ) external onlyMainCaller {
        require(_id != 1, "You can not mint PGB tokens");
        require(_id <= collectionsCount, "Collection not created YET");
        require(
            balanceOf(_to, 1) >=
                _quantityOfToken * collectionsMintingFees[_id - 1],
            "Need to spend some more PBG tokens"
        );
        _safeTransferFrom(
            _to,
            owner(),
            1,
            _quantityOfToken * collectionsMintingFees[_id - 1],
            ""
        );
        // console.log(balanceOf(msg.sender, 1), "haris nabeel");
        _mint(_to, _id, _quantityOfToken, "");
        // setApprovalForAll(_mainContract, true);
    }

    // transfers PBG against ETH.
    function getPBGTokens(address _to, uint256 _quantity) public payable {
        require(
            msg.value >= _quantity * _PBG_price,
            "Need to spend some more ethers"
        );
        _safeTransferFrom(owner(), address(_to), 1, _quantity, "");
        setApprovalForAll(_mainContract, true);
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

    function getCollectionMintingFees(uint256 _id)
        public
        view
        returns (uint256)
    {
        // console.log(collectionsMintingFees[_id], "Haris nabeel", _id);
        return collectionsMintingFees[_id];
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

    function get_PBG_price() public view returns (uint256) {
        return _PBG_price;
    }
}
