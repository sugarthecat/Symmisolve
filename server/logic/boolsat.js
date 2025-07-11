const e = require("express");

/**
 * Validates the formatting of a CNF formula
 * @param {String} formulaText
 * @returns {Boolean} Whether the formula is valid
 */
function validateCNF(formulaText) {
    const lines = formulaText.replaceAll("\t", " ").replaceAll("\r", "").split("\n");
    let numvars = -1;
    let numclauses = -1;
    for (const line of lines) {
        if (line.startsWith("c") || line.length < 2) {
            //skip comment lines AND empty lines
            continue;
        } else if (line.startsWith("p cnf")) {
            const parts = line.replaceAll("  ", " ").split(" ");
            numvars = parseInt(parts[2]);
            numclauses = parseInt(parts[3]);
        } else if (numvars < 0 || numclauses < 1) {
            return false;
        } else {
            const parts = line.split(" ");
            for (const part of parts) {
                if (part === "0") {
                    break;
                }
                if (part.length === 0) {
                    continue;
                }
                let partInt = parseInt(part);
                if (isNaN(partInt)) {
                    return false;
                }
                if (Math.abs(partInt) > numvars) {
                    return false;
                }
            }
        }
    }
    return numvars > -1;
}

/**
 * Parses a CNF formula into a list of clauses
 * @param {String} formulaText The text of the CNF formula (in DIMACS format)
 * @returns A list of clauses
 */
function parseCNF(formulaText) {
    if (!validateCNF(formulaText)) {
        throw new Error("Invalid CNF");
    }
    const lines = formulaText.replaceAll("\t", " ").replaceAll("\r", "").split("\n");
    let clauses = [];
    let currClause = [];
    for (const line of lines) {
        if (line.startsWith("c")) {
            continue;
        } else if (line.startsWith("p cnf")) {
            const parts = line.split(" ");
            numvars = parseInt(parts[2]);
        } else {
            const parts = line.split(" ");
            for (const part of parts) {
                if (part === "0") {
                    clauses.push(currClause);
                    currClause = [];
                    break;
                } else {
                    if (part.length === 0) {
                        continue;
                    }
                    if (isNaN(parseInt(part))) {
                        continue;
                    }
                    currClause.push(parseInt(part));
                }
            }
        }
    }
    return clauses;
}
/**
 * Reduces a CNF formula, removing redundant clauses and subclauses, and taking simple resolution-rule steps to shrink the size of the formula.
 * @param {List<Clause>} clauses New Clauses to be added to the CNF formula / reduced
 * @param {List<Clause>} alreadyReducedClauses A collection of clauses that have already been reduced.
 * @returns A list of reduced clauses
 */
function reduceCNF(clauses, alreadyReducedClauses = []) {
    let writtenClauses = alreadyReducedClauses.slice();
    let toAdd = []; //used as a stack
    let mappings = {}; //used as a dictionary
    function getFinalLiteralMapping(literal) {
        let newLiteral = literal;
        while (Math.abs(newLiteral) in mappings) {
            newLiteral = mappings[Math.abs(newLiteral)] * (newLiteral < 0 ? -1 : 1);
        }
        return newLiteral;
    }
    //copy clauses into toAdd
    for (let i = 0; i < clauses.length; i++) {
        toAdd.push(clauses[i]);
    }
    while (toAdd.length > 0) {
        let currClause = formatClause(toAdd.pop());
        if (currClause === null) {
            //tautological clause, ignore
            continue;
        }
        let willAdd = true;
        for (let i = 0; i < writtenClauses.length; i++) {
            const writtenClause = writtenClauses[i];
            //remove duplicates and subclauses
            if (isEqual(writtenClause, currClause)) {
                willAdd = false;
                break;
            } else if (isSubclause(currClause, writtenClause)) {
                willAdd = false;
                break;
            } else if (isSubclause(writtenClause, currClause)) {
                writtenClauses.splice(i, 1);
                i--;
                continue;
            }
            //nice resolutions
            let newClause = resolve(currClause, writtenClause);
            if (newClause !== null) {
                //if the two clauses resolve to something meaningful, see if it can be used for an immediate size reduction
                if (isSubclause(writtenClause, newClause)) {
                    //if the new clause is a subclause of the written clause the written clause is redundant
                    //doesn't mean the new clause can replace it, though, so add it to the stack
                    writtenClauses.splice(i, 1);
                    toAdd.push(newClause);
                    i--;
                    continue;
                } else if (isSubclause(currClause, newClause)) {
                    //if the new clause is a subclause of the current clause, the current clause is redundant
                    //it does mean the new clause can replace it, but we have to check relations with all other clauses now
                    toAdd.push(newClause);
                    willAdd = false;
                    break;
                }
            }
            //check for an equality relation
            //we already know they dont resolve, so if there both 2 literals, they must be either an equality or inequality relation

            if (
                currClause.length === 2 &&
                writtenClauses[i].length === 2 &&
                Math.abs(currClause[0]) === Math.abs(writtenClause[0]) &&
                Math.abs(currClause[1]) === Math.abs(writtenClause[1])
            ) {
                let lit1 = currClause[0];
                let lit2 = currClause[1];
                let abslit1 = Math.abs(lit1);
                let abslit2 = Math.abs(lit2);
                let isEqual = lit1 * lit2 < 0; //equality if opposite signs, opposite if same signs
                if (abslit2 in mappings && Math.abs(mappings[abslit2]) < abslit1) {
                    //if the literal is already mapped to a lexically earlier variable, set up the ingredients to map the other way
                    if (isEqual) {
                        //insert outselves in the middle of this equality relation and add the new preserving clauses
                        toAdd.push([-abslit1, mappings[abslit2]]);
                        toAdd.push([abslit1, -mappings[abslit2]]);
                    } else {
                        toAdd.push([abslit1, mappings[abslit2]]);
                        toAdd.push([-abslit1, -mappings[abslit2]]);
                    }
                } else if (isEqual) {
                    mappings[abslit2] = abslit1;
                } else {
                    mappings[abslit2] = -abslit1;
                }
            }
        }
        if (willAdd) {
            writtenClauses.push(currClause);
        }
        if (toAdd.length == 0) {
            //check all mappings - If a variable is supposed to be swapped to a lexically earlier variable, swap it.
            //at the same time, check for variables that can be set positive or negative
            let unmappedClauses = [];
            let literalCount = {};
            while (writtenClauses.length > 0) {
                const writtenClause = writtenClauses.pop();
                if (
                    writtenClause.length == 2 &&
                    writtenClause[0] in mappings &&
                    writtenClause[1] in mappings &&
                    getFinalLiteralMapping(writtenClause[0]) !== writtenClause[0] &&
                    getFinalLiteralMapping(writtenClause[1]) !== writtenClause[1]
                ) {
                    let newClause = [getFinalLiteralMapping(writtenClause[0]), writtenClause[1]];
                    toAdd.push(newClause);
                    continue;
                }
                let newClause = [];
                let changed = false;
                for (const prevLiteral of writtenClause) {
                    //follow the mapping chain until we reach an unmapped variable
                    let literal = getFinalLiteralMapping(prevLiteral);
                    if(prevLiteral != literal) {
                        changed = true;
                    }
                    newClause.push(literal);
                    if (literal in literalCount) {
                        literalCount[literal]++;
                    } else if (writtenClause.length > 1) {
                        literalCount[literal] = 1;
                    }
                }
                if (changed) {
                    newClause = formatClause(newClause);
                    if (newClause !== null) {
                        toAdd.push(newClause);
                    }
                } else {
                    unmappedClauses.push(writtenClause);
                }
            }
            //if a variable is only positive, or only negative, we can set it to be positive or negative
            for (const literal in literalCount) {
                if (literal < 0) {
                    //we do the compute in the positive branch
                    continue;
                }
                if (literalCount[literal] === 0 && literalCount[-literal] > 0) {
                    toAdd.push([-literal]);
                } else if (literalCount[literal] > 0 && literalCount[-literal] === 0) {
                    toAdd.push([literal]);
                }
            }
            writtenClauses = unmappedClauses;
        }
    }
    //now, sort written clauses.
    return sortClauses(writtenClauses);
}

/**
 * Uses all tools to reduce the size of a CNF formula.
 * @param {*} clauses
 * @returns
 */
function optimizeCNF(clauses) {
    // TODO add symmetry reduction
    return reduceCNF(clauses);
}

/**
 * Finds a symmetry of a CNF formula.
 * @param {*} clauses The CNF formula
 * @returns A symmetry of the formula, or null if no symmetry is found.
 */
function findSymmetry(clauses) {
    //TODO: add symmetry finding algorithm
}

/**
 * Verifies a symmetry of a CNF Formula is valid.
 * Symmetries are to be given in a format of cyclic mapping:
 * For example, [[2,3]] is a symmetry that maps 2->3, 3->2 and everthing else to itself.
 * TODO: implement negative symmetries.
 * precondition: clauses are sorted and formatted
 * @param {List} clauses
 * @param {List} symmetry
 */
function validateSymmetry(clauses, symmetry) {
    let variablesInSymmetry = [];
    let mapping = {};
    for (let i = 0; i < symmetry.length; i++) {
        for (let j = 0; j < symmetry[i].length; j++) {
            if (variablesInSymmetry.includes(Math.abs(symmetry[i][j]))) {
                //already in symmetry,  duplicate mapping.
                return false;
            }
            variablesInSymmetry.push(Math.abs(symmetry[i][j]));
            let isNegative = symmetry[i][j] < 0;
            let nextIsNegative = symmetry[i][(j + 1) % symmetry[i].length] < 0;
            let flipNext = isNegative != nextIsNegative;
            mapping[Math.abs(symmetry[i][j])] =
                Math.abs(symmetry[i][(j + 1) % symmetry[i].length]) * (flipNext ? -1 : 1);
        }
    }
    let newFormula = [];
    for (let i = 0; i < clauses.length; i++) {
        let newClause = [];
        for (let j = 0; j < clauses[i].length; j++) {
            let literal = clauses[i][j];
            let isNegative = literal < 0;
            if (isNegative) {
                literal = -literal;
            }
            let nextLiteral =
                mapping[Math.abs(clauses[i][j])] * (isNegative ? -1 : 1) || clauses[i][j];
            newClause.push(nextLiteral);
        }
        newClause = formatClause(newClause);
        newFormula.push(newClause);
    }
    newFormula = sortClauses(newFormula);
    for (let i = 0; i < newFormula.length; i++) {
        if (!isEqual(newFormula[i], clauses[i])) {
            return false;
        }
    }
    return true;
}
/**
 * Formats a clause by removing duplicates and sorting literals by absolute value (ascending). If the clause is tautological, returns null.
 * @param {Clause} clause A CNF Clause to be formatted
 * @returns The clause with duplicates removed and literals sorted by absolute value
 */
function formatClause(clause) {
    let finalClause = [];
    let tautological = false; // if two opposing literals are in the clause, the clause is tautological
    //fast insertion sort with binary search
    for (let i = 0; i < clause.length; i++) {
        let ub = finalClause.length; // insertion upper bound
        let lb = 0; // insertion lower bound
        let add = true; // whether to add. Flagged as false if duplicate is found
        while (ub > lb) {
            let mid = Math.floor((ub + lb) / 2);
            if (Math.abs(finalClause[mid]) === Math.abs(clause[i])) {
                add = false;
                if (finalClause[mid] === -clause[i]) {
                    tautological = true;
                    break;
                } else {
                    //copy of the same literal
                    break;
                }
            } else if (Math.abs(finalClause[mid]) < Math.abs(clause[i])) {
                lb = mid + 1;
            } else {
                ub = mid;
            }
        }
        if (add) {
            finalClause.splice(ub, 0, clause[i]);
        }
    }
    if (tautological) {
        return null;
    }
    return finalClause;
}
/**
 * Checks if clause1 is a subclause of clause2.
 * Precondition: clause1 and clause2 are formatted
 * For example, [1,2] is a subclause of [1], since [1] implies [1,2], so [1,2] is redundant.
 * @param {Clause} clause1 The possible subclause
 * @param {Clause} clause2 The possible superclause
 */
function isSubclause(clause1, clause2) {
    if (clause1.length < clause2.length) {
        return false;
    }
    let index1 = 0;
    let index2 = 0;
    while (index1 < clause1.length && index2 < clause2.length) {
        if (clause1[index1] === clause2[index2]) {
            index1++;
            index2++;
        } else if (clause1[index1] === -clause2[index2]) {
            //opposing literals - no overlap, not a subclause
            return false;
        } else if (Math.abs(clause1[index1]) < Math.abs(clause2[index2])) {
            //clause 1 has some quality clause 2 doesn't, that's ok!. Clause 2 is more general
            index1++;
        } else if (Math.abs(clause1[index1]) > Math.abs(clause2[index2])) {
            //clause 2 has some quality clause 1 doesn't
            return false;
        }
    }
    return index2 === clause2.length;
}
/**
 * Resolves two clauses
 * Precondition: clause1 and clause2 are formatted
 * For example, [1,2] and [1,-2] resolve to [1]
 * For further reference, google "Resolution Rule"
 * @param {Clause} clause1 a CNF Clause
 * @param {Clause} clause2 a CNF Clause
 * @returns {Clause} The resolution of clause1 and clause2. Null if resolution is not possible.
 */
function resolve(clause1, clause2) {
    let newClause = [];
    let index1 = 0;
    let index2 = 0;
    let hasOpposingLiteral = false;
    while (index1 < clause1.length && index2 < clause2.length) {
        if (clause1[index1] === clause2[index2]) {
            //if the literals are the same, add them to the new clause
            newClause.push(clause1[index1]);
            index1++;
            index2++;
        } else if (clause1[index1] === -clause2[index2]) {
            index1++;
            index2++;
            if (hasOpposingLiteral) {
                // two or more opposing literals means that no meaningful resolution is possible
                return null;
            }
            hasOpposingLiteral = true;
        } else if (Math.abs(clause1[index1]) < Math.abs(clause2[index2])) {
            newClause.push(clause1[index1]);
            index1++;
        } else if (Math.abs(clause1[index1]) > Math.abs(clause2[index2])) {
            newClause.push(clause2[index2]);
            index2++;
        }
    }
    while (index1 < clause1.length) {
        newClause.push(clause1[index1]);
        index1++;
    }
    while (index2 < clause2.length) {
        newClause.push(clause2[index2]);
        index2++;
    }
    if (!hasOpposingLiteral) {
        // no opposing literals means that no meaningful resolution is possible
        return null;
    }
    return newClause;
}
/**
 * Checks if clause1 is equal to clause2.
 * Precondition: clause1 and clause2 are formatted
 * @param {Clause} clause1
 * @param {Clause} clause2
 */
function isEqual(clause1, clause2) {
    if (clause1.length !== clause2.length) {
        return false;
    }
    for (let i = 0; i < clause1.length; i++) {
        if (clause1[i] != clause2[i]) {
            return false;
        }
    }
    return true;
}

/**
 *  Sorts a list of clauses lexicographically
 * @param {List} clauses
 * @returns a list of clauses sorted lexically
 */
function sortClauses(clauses) {
    function compare(clause1, clause2) {
        //literal by literal, compare the clauses lexically
        let swap = false;
        let reachedEnd = true;
        for (let j = 0; j < clause1.length; j++) {
            if (
                Math.abs(clause1[j]) > Math.abs(clause2[j]) ||
                (Math.abs(clause1[j]) === Math.abs(clause2[j]) && clause1[j] < clause2[j])
            ) {
                swap = true;
                reachedEnd = false;
                break;
            } else if (clause1[j] != clause2[j]) {
                reachedEnd = false;
                break;
            }
        }
        if (swap) {
            return 1;
        } else {
            return -1;
        }
    }
    return clauses.sort(compare);
}

function stringifyCNF(clauses) {
    const clauseCount = clauses.length;
    let n_variables = 0;
    for (const clause of clauses) {
        for (const literal of clause) {
            n_variables = Math.max(n_variables, Math.abs(literal));
        }
    }
    let string = `p cnf ${n_variables} ${clauseCount}\n`; //line 1
    for (const clause of clauses) {
        for (const literal of clause) {
            string += literal;
            string += " ";
        }
        string += "0\n";
    }
    return string;
}

function getSizeCNF(clauses) {
    let size = clauses.length;
    for (let i = 0; i < clauses.length; i++) {
        size += clauses[i].length;
    }
    return size;
}

const CURR_ALGO_VER = 2;
module.exports = {
    CURR_ALGO_VER,
    validateCNF,
    parseCNF,
    reduceCNF,
    validateSymmetry,
    sortClauses,
    optimizeCNF,
    stringifyCNF,
    getSizeCNF,
    resolve,
    isEqual,
    isSubclause,
};

//and they say mathematicians can't code :p
