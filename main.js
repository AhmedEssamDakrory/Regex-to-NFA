const splitExpressions = require('./parse');
const {Node, decompose, generateNFA, printNFA, toJson} = require('./nfa');
const {validate_regex} = require('./validate');

const regex = process.argv[2];

/**
 * (ab)*+cd
 * (a+b)*
 * a+bc
 * (1+0)*1
 * ((1+0)*+(10)*)*
 */


if (validate_regex(regex)) {
    const root = generateNFA(regex);
    toJson(root);
} else {
    console.log("Invalid Regex");
}


