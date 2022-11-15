const snarkjs = require("snarkjs");
const { execSync } = require("child_process");
const path = require("path");

async function main(){
    const pathCircuit = path.join(__dirname, "../src/circuits/age-checker.circom");
    const cmd = `circom ${pathCircuit} --r1cs --wasm`;
    console.log("Building circuit");
    execSync(cmd);

    let cmdSnarkjs = "npx snarkjs powersoftau new bn128 13 pot13_0000.ptau";
    console.log("snarkjs powersoftau new bn128 13");
    execSync(cmdSnarkjs);
    cmdSnarkjs = "npx snarkjs powersoftau contribute pot13_0000.ptau pot13_0001.ptau --name='First contribution' --entropy='TFMAlonso'";
    console.log("contribute");
    execSync(cmdSnarkjs);
    cmdSnarkjs = "npx snarkjs powersoftau prepare phase2 pot13_0001.ptau pot13_final.ptau";
    console.log("prepare phase2");
    execSync(cmdSnarkjs);
    cmdSnarkjs = "npx snarkjs groth16 setup age-checker.r1cs pot13_final.ptau age-checker_0000.zkey";
    console.log("groth16 setup");
    execSync(cmdSnarkjs);
    cmdSnarkjs = "npx snarkjs zkey contribute age-checker_0000.zkey age-checker_0001.zkey --name='1st Contributor Name' --entropy='TFMAlonso'";
    console.log("zkey contribute");
    execSync(cmdSnarkjs);
    cmdSnarkjs = "npx snarkjs zkey export verificationkey age-checker_0001.zkey verification_key.json";
    console.log("zkey export");
    execSync(cmdSnarkjs);
    cmdSnarkjs = "npx snarkjs zkey export solidityverifier age-checker_0001.zkey verifier.sol";
    console.log("zkey export solidityverifier");
    execSync(cmdSnarkjs);
}

main();