// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
// import "./interfaces/ILand.sol";
import "./Land.sol";
import "./PubgItems.sol";

import "hardhat/console.sol";

contract Main {
    uint256 tokenCounter = 1;
    address private _LandContractAddress;
    address private _PubgItemsContractAddress;

    struct TokenInfo {
        address holder;
        bool isFungible;
        uint256 _quantity;
        uint256 collectionId; // tokenId
    }

    mapping(uint256 => TokenInfo) public tokenDetails;

    modifier onlyExistingToken(uint256 _tokenID) {
        require(
            tokenDetails[_tokenID].holder != address(0) || _tokenID == 1,
            "Main:  Token Does not Exist!"
        );
        _;
    }

    constructor(address _LandContract, address _PubgItemsContract) {
        require(_LandContract != address(0), "Invalid Address!");
        require(_PubgItemsContract != address(0), "Invalid Address!");
        _LandContractAddress = _LandContract;
        _PubgItemsContractAddress = _PubgItemsContract;
        tokenDetails[tokenCounter].isFungible = true;
        tokenDetails[tokenCounter].collectionId = 1;
    }

    function mint(uint256 _quantity, uint256 _collectionId)
        public
        payable
        returns (uint256)
    {
        tokenCounter++;
        tokenDetails[tokenCounter].holder = msg.sender;
        tokenDetails[tokenCounter].isFungible = _quantity > 1 ? true : false;
        tokenDetails[tokenCounter]._quantity = _quantity;

        if (tokenDetails[tokenCounter].isFungible) {
            tokenDetails[tokenCounter]._quantity = _quantity;
            tokenDetails[tokenCounter].collectionId = _collectionId;
            PubgItems(_PubgItemsContractAddress).mintToCollection(
                msg.sender,
                _collectionId,
                _quantity
            );
            // PubgItems(_PubgItemsContractAddress).setApprovalForAll(address(this), true);
        } else {
            Land(_LandContractAddress).mint{value: msg.value}(
                msg.sender,
                tokenCounter
            );
            tokenDetails[tokenCounter].collectionId = tokenCounter;
        }
        return tokenCounter;
        // tokenToOwner[tokenCounter] = msg.sender;
        // ILand(_LandContractAddress)._mint{value: msg.value}(msg.sender);
    }

    // function mint(TokenInfo memory tInfo) public payable {
    //     tokenCounter++;
    //     tokenDetails[tokenCounter].holder = tInfo.holder;
    //     tokenDetails[tokenCounter].isFungible = tInfo._quantity > 1 ? true : false;
    //     tokenDetails[tokenCounter]._quantity = tInfo._quantity;

    //     if (tokenDetails[tokenCounter].isFungible) {
    //         tokenDetails[tokenCounter]._quantity = tInfo._quantity;
    //         tokenDetails[tokenCounter].collectionId =tInfo.collectionId;
    //         PubgItems(_PubgItemsContractAddress).mintToCollection(
    //             msg.sender,
    //             tInfo.collectionId,
    //             tInfo._quantity
    //         );
    //         // PubgItems(_PubgItemsContractAddress).setApprovalForAll(address(this), true);
    //     } else {
    //         Land(_LandContractAddress)._mint{value: msg.value}(msg.sender);
    //     }
    //     // tokenToOwner[tokenCounter] = msg.sender;
    //     // ILand(_LandContractAddress)._mint{value: msg.value}(msg.sender);
    // }

    function transfer(
        uint256 _tokenID,
        address _recipient,
        uint256 _amount
    ) external onlyExistingToken(_tokenID) returns (bool) {
        TokenInfo memory tInfo = tokenDetails[_tokenID];
        if (tInfo.isFungible) {
            require(
                PubgItems(_PubgItemsContractAddress).balanceOf(
                    msg.sender,
                    tInfo.collectionId
                ) >= _amount,
                "Main: You Don't have The Tokens!"
            );
        } else {
            require(
                Land(_LandContractAddress).ownerOf(
                    tokenDetails[_tokenID].collectionId
                ) == msg.sender,
                "Main: Only Owner Can Transfer!"
            );
        }

        _transfer(_tokenID, _recipient, _amount);
        tokenDetails[_tokenID].holder = _recipient;
        return true;
    }

    function _transfer(
        uint256 _tokenID,
        address _recipient,
        uint256 _amount
    ) internal {
        TokenInfo memory tokenInfo = tokenDetails[_tokenID];
        console.log(tokenInfo.isFungible);
        if (tokenInfo.isFungible) {
            PubgItems(_PubgItemsContractAddress).safeTransferFrom(
                msg.sender,
                _recipient,
                tokenInfo.collectionId,
                _amount,
                ""
            );
        } else {
            Land(_LandContractAddress).transferFrom(
                msg.sender,
                _recipient,
                tokenInfo.collectionId
            );
        }
        tokenInfo.holder = _recipient;
    }

    function getPbgTokens(uint256 _quantity) public payable {
        PubgItems(_PubgItemsContractAddress).getPBGTokens{value: msg.value}(
            msg.sender,
            _quantity
        );
    }
}
