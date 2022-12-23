const path = require("path");
const Scalar = require("ffjavascript").Scalar;
const {expect} = require("chai")

const wasm_tester = require("circom_tester").wasm;
const stateUtils = require("@hermeznetwork/commonjs").stateUtils;

describe("Test age-checker", function () {
    this.timeout(0);
    let circuit;

    before( async() => {
        circuit = await wasm_tester(path.join(__dirname, "../src", "age-checker.circom"));
    });

    it("Should check age of an old person", async () => {
        const state = {
            age: 49,
            ethAddrPriv: "0x7e5f4552091a69125d5dfcb7b8c2659029395bdf",
            ethAddr: "0x7e5f4552091a69125d5dfcb7b8c2659029395bdf",
        };

        const input = {
            age: Scalar.e(state.age),
            ethAddrPriv: Scalar.e(state.ethAddrPriv),
            ethAddr: Scalar.e(state.ethAddr)
        };

        const witness = await circuit.calculateWitness(input, true);
        await circuit.checkConstraints(witness);
    });
    it("Should check age of 18 years old", async () => {
        const state = {
            age: 18,
            ethAddrPriv: "0x7e5f4552091a69125d5dfcb7b8c2659029395bdf",
            ethAddr: "0x7e5f4552091a69125d5dfcb7b8c2659029395bdf",
        };

        const input = {
            age: Scalar.e(state.age),
            ethAddrPriv: Scalar.e(state.ethAddrPriv),
            ethAddr: Scalar.e(state.ethAddr)
        };

        const witness = await circuit.calculateWitness(input, true);
        await circuit.checkConstraints(witness);
    });
    it("Should check age of a minor", async () => {
        const state = {
            age: 17,
            ethAddrPriv: "0x7e5f4552091a69125d5dfcb7b8c2659029395bdf",
            ethAddr: "0x7e5f4552091a69125d5dfcb7b8c2659029395bdf",
        };

        const input = {
            age: Scalar.e(state.age),
            ethAddrPriv: Scalar.e(state.ethAddrPriv),
            ethAddr: Scalar.e(state.ethAddr)
        };

        try {
            await circuit.calculateWitness(input, true);
            expect(true == false)
        } catch (error){
            expect(error.message.includes("Error in template AgeCheck_3 line: 24")).to.be.equal(true);
        }
    });
    it("Try to reuse a proof", async () => {
        const state = {
            age: 18,
            ethAddrPriv: "0x7e5f4552091a69125d5dfcb7b8c2659029395bdf",
            ethAddr: "0xae4bb80be56b819606589de61d5ec3b522eeb032",
        };

        const input = {
            age: Scalar.e(state.age),
            ethAddrPriv: Scalar.e(state.ethAddrPriv),
            ethAddr: Scalar.e(state.ethAddr)
        };

        try {
            await circuit.calculateWitness(input, true);
            expect(true == false)
        } catch (error){
            expect(error.message.includes("Error in template AgeCheck_3 line: 17")).to.be.equal(true);
        }
    });
});