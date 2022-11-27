// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IVerifierRollup.sol";

contract AAVFOP is Ownable {

    // Product information struct
    struct ProductInformation {
        string name;
        uint256 price;
        uint256 amount;
    }

    // Store name
    string public storeName;
    // ZK verifier
    IVerifierRollup public zkVerifier;

    // Number of Purchases
    uint256 public lastPurchaseIndex;

    // Number of products
    uint256 public lastProduct;

    mapping(uint256 => ProductInformation) public ProductInfo;

    /**
     * @dev Emitted when a new payment is received
     */
    event Payment(address indexed client, uint256 amount, uint256 lastPurchaseIndex, uint256 indexed productIndex);

    /**
     * @dev Emitted when a new product is added or modified
     */
    event Product(string name, uint256 indexed productIndex, uint256 price, uint256 amount);

    /**
     * @dev Emitted when funds are claimed
     */
    event Claimed(address indexed destAddr, uint256 amount);

    constructor(
        string memory _storeName,
        IVerifierRollup _zkVerifier
    ) {
        storeName = _storeName;
        zkVerifier = _zkVerifier;
    }


    function buy(
        uint256 amount, // Units of product
        uint256 productIndex,
        uint256[2] calldata proofA,
        uint256[2][2] calldata proofB,
        uint256[2] calldata proofC
    ) public payable {
        // Check product exists
        require(
            keccak256(abi.encode(ProductInfo[productIndex].name)) != keccak256(abi.encode("")),
            "OnlinePurchaseSystem::buy: PRODUCT_DOES_NOT_EXIST"
        );

        // Check product exists
        require(
            ProductInfo[productIndex].amount != 0,
            "OnlinePurchaseSystem::buy: PRODUCT_SOLD_OUT"
        );

        // Check that amount * productPrice == msg.Value
        require(
            amount * ProductInfo[productIndex].price == msg.value,
            "OnlinePurchaseSystem::buy: INCORRECT_AMOUNT"
        );

        // Verify proof
        require(
            zkVerifier.verifyProof(proofA, proofB, proofC, [uint256(uint160(msg.sender))]),
            "OnlinePurchaseSystem::buy: INVALID_PROOF"
        );

        lastPurchaseIndex++;
        ProductInfo[productIndex].amount -= amount;

        emit Payment(msg.sender, amount, lastPurchaseIndex, productIndex);
    }

    // Add product
    function addProduct(string memory name, uint256 price, uint256 amount) external onlyOwner {
        lastProduct++;

        ProductInfo[lastProduct].name = name;
        ProductInfo[lastProduct].price = price;
        ProductInfo[lastProduct].amount = amount;

        emit Product(name, lastProduct, price, amount);
    }

    // Modify product
    function modifyProduct(string memory name, uint256 productIndex, uint256 price, uint256 amount) external onlyOwner {
        require(
            keccak256(abi.encode(ProductInfo[productIndex].name)) != keccak256(abi.encode("")),
            "OnlinePurchaseSystem::modifyProduct: PRODUCT_DOES_NOT_EXIST"
        );
        ProductInfo[productIndex].name = name;
        ProductInfo[productIndex].price = price;
        ProductInfo[productIndex].amount = amount;

        emit Product(name, productIndex, price, amount);
    }

    function claimFunds(address destAddr, uint256 amount) external onlyOwner {
        // Transfer ether
        /* solhint-disable avoid-low-level-calls */
        (bool success, ) = destAddr.call{value: amount}(
            new bytes(0)
        );

        require(success, "OnlinePurchaseSystem::claimFunds: ETH_TRANSFER_FAILED");
        emit Claimed(destAddr, amount);
    }
}
