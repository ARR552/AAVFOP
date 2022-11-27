const path = require("path");
const { expect } = require("chai");
const Scalar = require("ffjavascript").Scalar;
const snarkjs = require("snarkjs");
const { ethers } = require("hardhat");

describe("Test age-checker", function () {
    this.timeout(0);
    let deployer;
    let userAWallet;
    let verifierContract;
    let aavfopContract;

    before("Deploy contract", async () => {
        // Load signers
        const signers = await ethers.getSigners();
        const storeName = "AavFop Store"

        // Assign signers
        deployer = signers[0];
        userAWallet = signers[1];        

        // Deploy mock verifier
        verifierFactory = await ethers.getContractFactory(
            'Verifier',
        );
        verifierContract = await verifierFactory.deploy();

        // Deploy aavfop
        const aavfopFactory = await ethers.getContractFactory("AAVFOP");
        aavfopContract = await aavfopFactory.deploy(storeName, verifierContract.address);

        await aavfopContract.deployed();
    });

    it("Should check buy and addProduct", async () => {
        const input = {
            age: Scalar.e(18),
            ethAddr: Scalar.fromString(userAWallet.address, 16),
            ethAddrPriv: Scalar.fromString(userAWallet.address, 16),

        };
        const prove = await snarkjs.groth16.fullProve(input, path.join(__dirname, "./circuits/age-checker-test.wasm"), path.join(__dirname, "./circuits/age-checker-test_0001.zkey"));
        const proofA = [prove.proof.pi_a[0],
        prove.proof.pi_a[1]
        ];
        let proofB = [
            [
                prove.proof.pi_b[0][1],
                prove.proof.pi_b[0][0]
            ],
            [
                prove.proof.pi_b[1][1],
                prove.proof.pi_b[1][0]
            ]
        ];
        const proofC = [prove.proof.pi_c[0],
        prove.proof.pi_c[1]
        ];

        // Add product
        let price = ethers.utils.parseEther('1.0');
        let units = 5;
        await expect(aavfopContract.addProduct("product 1", price, units))
        .to.emit(aavfopContract, "Product").withArgs("product 1", 1, ethers.utils.parseEther('1.0'), 5);

        await expect(aavfopContract.connect(userAWallet).addProduct("product 1", price, units))
        .to.be.revertedWith('Ownable: caller is not the owner');

        let items = 1;
        let productIndex = 1;
        let amount = price

        await expect(aavfopContract.connect(userAWallet).buy(items, productIndex, proofA, proofB, proofC))
        .to.be.revertedWith('OnlinePurchaseSystem::buy: INCORRECT_AMOUNT');

        await expect(aavfopContract.connect(userAWallet).buy(items, 2, proofA, proofB, proofC, { value: amount }))
        .to.be.revertedWith('OnlinePurchaseSystem::buy: PRODUCT_DOES_NOT_EXIST');

        await expect(aavfopContract.buy(items, productIndex, proofA, proofB, proofC, { value: amount }))
        .to.be.revertedWith('OnlinePurchaseSystem::buy: INVALID_PROOF');

        items = 5;
        amount = ethers.utils.parseEther('5.0');
        await expect(aavfopContract.connect(userAWallet).buy(items, productIndex, proofA, proofB, proofC, { value: amount }))
        .to.emit(aavfopContract, "Payment").withArgs(userAWallet.address, items, 1, productIndex);

        await expect(aavfopContract.buy(items, productIndex, proofA, proofB, proofC, { value: amount }))
        .to.be.revertedWith('OnlinePurchaseSystem::buy: PRODUCT_SOLD_OUT');
    });
    it("Should check modifyProduct", async () => {
        let productIndex = 1;
        let units = 15;
        let price = ethers.utils.parseEther('1.5')
        await expect(aavfopContract.modifyProduct("product 1", productIndex, price, units))
        .to.emit(aavfopContract, "Product").withArgs("product 1", productIndex, price, units);

        await expect(aavfopContract.connect(userAWallet).modifyProduct("product 1", productIndex, price, units))
        .to.be.revertedWith('Ownable: caller is not the owner');

        productIndex = 2
        await expect(aavfopContract.modifyProduct("product 1", productIndex, price, units))
        .to.be.revertedWith('OnlinePurchaseSystem::modifyProduct: PRODUCT_DOES_NOT_EXIST');
    });
    it("Should check claimFunds", async () => {
        let amount = ethers.utils.parseEther('1.0')
        await expect(aavfopContract.claimFunds(deployer.address, amount))
        .to.emit(aavfopContract, "Claimed").withArgs(deployer.address, amount);

        await expect(aavfopContract.connect(userAWallet).claimFunds(deployer.address, amount))
        .to.be.revertedWith('Ownable: caller is not the owner');

        amount = ethers.utils.parseEther('50.0')
        await expect(aavfopContract.claimFunds(deployer.address, amount))
        .to.be.revertedWith('OnlinePurchaseSystem::claimFunds: ETH_TRANSFER_FAILED');
    });
});