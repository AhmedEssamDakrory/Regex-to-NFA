const splitExpressions = require('./parse');
const {Node, decompose, generateNFA, printNFA, toJson} = require('./nfa')

/**
 * (ab)*+cd
 * (a+b)*
 * a+bc
 * (1+0)*1
 */

const root = generateNFA("a+bc");
toJson(root);
