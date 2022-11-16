pragma circom 2.1.0;

include "../node_modules/circomlib/circuits/comparators.circom";

/**
 * Verifies that a user is older than 18 years old.
 * @input age - {Uint40} - age
 */
template AgeCheck() {
    
    // Age of the buyer
    signal input age;
    signal input ethAddrPriv;
    signal input ethAddr; // public input

    //Check ethAddrPriv with public input
    ethAddrPriv === ethAddr;

    // checks: age > MIN_AGE
    var MIN_AGE = 18;

    signal outpt <== GreaterEqThan(252)([age,MIN_AGE]);
    log(outpt);
    outpt === 1;
}

component main {public [ethAddr]}= AgeCheck();


/**
OLD SYNAXIS

pragma circom 2.1.0;

include "../node_modules/circomlib/circuits/comparators.circom";

/**
 * Verifies that a user is older than 18 years old.
 * @input age - {Uint40} - age
 *
template AgeCheck() {
    
    // Age of the buyer
    signal input age;
    signal input ethAddrPriv;
    signal input ethAddr; // public input

    //Check ethAddrPriv with public input
    ethAddrPriv === ethAddr;

    // checks: age > MIN_AGE
    var MIN_AGE = 18;
    component minAge = GreaterEqThan(252);

    minAge.in[0] <== age;
    minAge.in[1] <== MIN_AGE;

    minAge.out === 1;
}

component main {public [ethAddr]}= AgeCheck();
*/