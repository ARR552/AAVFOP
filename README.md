# AAVFOP (Automatic Age Verifier For Online Purchases)

## Pre-requisites

- [circom](https://docs.circom.io/getting-started/installation/#installing-dependencies)
- [nodejs](https://nodejs.org/en/)

## Circuit explanation

`age-checker.circom` verifies that a certain user is older or equal to the minimum age allowed to buy some products.

## Constraints

- checks that `age` provided is greater or equal than 18 with [GreaterEqThan](https://github.com/iden3/circomlib/blob/master/circuits/comparators.circom#L131)
- checks that `ethAddr` provided is equal than `ethAddrPriv`.

## Public inputs

- `ethAddr`: `msg.sender` used a a proof of account ownership

## Private inputs

- `age`, `ethAddrPriv`

## Create a mock powers of Tau and a zKey:

```
    circom age-checker.circom --r1cs --wasm --sym --c
    snarkjs powersoftau new bn128 13 pot13_0000.ptau -v
    snarkjs powersoftau contribute pot13_0000.ptau pot13_0001.ptau --name="First contribution" -v
    snarkjs powersoftau prepare phase2 pot13_0001.ptau pot13_final.ptau -v
    snarkjs groth16 setup age-checker.r1cs pot13_final.ptau age-checker_0000.zkey
    snarkjs zkey contribute age-checker_0000.zkey age-checker_0001.zkey --name="1st Contributor Name" -v
    snarkjs zkey export verificationkey age-checker_0001.zkey verification_key.json
    snarkjs zkey export solidityverifier age-checker_0001.zkey verifier.sol
```

## Generate witness.wtns
```
node generate_witness.js age-checker.wasm ../input.json witness.wtns
```

## Generate proof
```
snarkjs groth16 prove age-checker_0001.zkey witness.wtns proof.json public.json
public y proof son ficheros de salida
```

## Verify proof
```
snarkjs groth16 verify ../verification_key.json public.json proof.json
```
