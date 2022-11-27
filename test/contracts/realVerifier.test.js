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

    beforeEach("Deploy contract", async () => {
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

    it("Should check age proof", async () => {
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

        expect(await verifierContract.verifyProof(
            proofA,
            proofB,
            proofC,
            prove.publicSignals,
        )).to.be.equal(true);

        wrongAddr = [Scalar.fromString(deployer.address, 16).toString()];
        expect(await verifierContract.verifyProof(
            proofA,
            proofB,
            proofC,
            wrongAddr,
        )).to.be.equal(false);
    });
});