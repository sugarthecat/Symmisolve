const CURR_ALGO_VER = 7;
/**
 * Validates the formatting of a CNF formula
 * @param {String} formulaText
 * @returns {Boolean} Whether the formula is valid
 */
function validateCNF(formulaText) {
    const lines = formulaText.replaceAll("\t", " ").replaceAll("\r", "").split("\n");
    let numvars = -1;
    let numclauses = -1;
    for (let line of lines) {
        while (line.includes("  ")) {
            line = line.replaceAll("  ", " ");
        }
        if (line.startsWith("c") || line.length < 2) {
            //skip comment lines AND empty lines
            continue;
        } else if (line.startsWith("p cnf")) {
            const parts = line.split(" ");
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
 * Performs all self-subsuming resolution steps, removes tautologies, and sorts the clauses
 * @param {*} clauses
 * @returns
 */
function reduceCNF(clauses, alreadyReduced = [], justCompare = []) {
    let toAdd = [];
    let newClauses = [];
    let relatingToLiteral = {};
    //set up relatingToLiteral, contains all clauses relating to each literal
    for (let clause of clauses) {
        clause = formatClause(clause);
        if (clause === null) {
            continue;
        }
        for (const literal of clause) {
            const absLiteral = Math.abs(literal);
            if (!(absLiteral in relatingToLiteral)) {
                relatingToLiteral[absLiteral] = [];
            }
        }
        toAdd.push(clause);
    }
    for (let clause of alreadyReduced) {
        for (const literal of clause) {
            const absLiteral = Math.abs(literal);
            if (!(absLiteral in relatingToLiteral)) {
                relatingToLiteral[absLiteral] = [];
            }
            relatingToLiteral[absLiteral].push(clause);
        }
        newClauses.push(clause);
    }
    let toRemove = new Set();
    let toCompare = justCompare.slice();
    //every iteration moves everything from oldClauses to newClauses
    //since the relating to literal structure is updated, but the newClauses array is not
    while (toAdd.length > 0 || toCompare.length > 0) {
        let add = true;
        let newClause;
        if (toAdd.length > 0) {
            newClause = toAdd.pop();
        } else {
            newClause = justCompare.pop();
            add = false;
        }
        if (newClause.length === 0) {
            //if we have the empty clause, we can stop
            return [[]];
        }

        for (const literal of newClause) {
            const absLiteral = Math.abs(literal);
            const relatingClauses = relatingToLiteral[absLiteral];
            //console.log("relating clauses", relatingClauses.length);
            for (let i = 0; i < relatingClauses.length; i++) {
                let relatingClause = relatingClauses[i];
                if (isSubclause(relatingClause, newClause)) {
                    //relating clause is a subclause of new clause
                    toRemove.add(relatingClause);
                    //console.log(relatingClause,newClause)
                    relatingClauses.splice(i, 1);
                    i--;
                    add = true;
                    continue;
                }
                if (isSubclause(newClause, relatingClause)) {
                    //new clause is a subclause of related clause
                    add = false;
                    break;
                }
                //nice resolutions
                let resolvedClause = resolve(newClause, relatingClause);
                if (resolvedClause !== null) {
                    //if the two clauses resolve to something meaningful, see if it can be used for an immediate size reduction
                    if (isSubclause(relatingClause, resolvedClause)) {
                        //if the new clause is a subclause of the written clause the written clause is redundant
                        //doesn't mean the new clause can replace it, though, so add it to the stack
                        toAdd.push(resolvedClause);
                        toRemove.add(relatingClause);
                        relatingClauses.splice(i, 1);
                        i--;
                        continue;
                    } else if (isSubclause(newClause, resolvedClause)) {
                        //if the new clause is a subclause of the current clause, the current clause is redundant
                        //it does mean the new clause can replace it, but we have to check relations with all other clauses now
                        toAdd.push(resolvedClause);
                        add = false;
                        break;
                    }
                }
            }
            if (add) {
                relatingClauses.push(newClause);
            } else {
                break;
            }
        }
        if (add) {
            newClauses.push(newClause);
        }
    }
    //remove duplicates & sort
    newClauses = sortClauses(newClauses);
    let finalClauses = [];
    for (let i = 0; i < newClauses.length; i++) {
        if (i !== 0 && isEqual(newClauses[i], newClauses[i - 1])) {
            //continue, this is a duplicate
            continue;
        }
        if (toRemove.has(newClauses[i])) {
            //clause flagged for removal
            continue;
        }
        finalClauses.push(newClauses[i]);
    }
    return finalClauses;
}
/**
 * Reduces a CNF formula, removing redundant clauses and subclauses, and taking simple resolution-rule steps to shrink the size of the formula.
 * Strictly inverse non-destructive, so any solution to this formula is a solution to the original formula.
 * @param {List<Clause>} clauses New Clauses to be added to the CNF formula / reduced
 * @returns A list of reduced clauses
 */
function optimizeCNF(clauses) {
    function getFinalLiteralMapping(literal) {
        let newLiteral = literal;
        while (Math.abs(newLiteral) in mappings) {
            newLiteral = mappings[Math.abs(newLiteral)] * (newLiteral < 0 ? -1 : 1);
        }
        return newLiteral;
    }
    let toAdd = [];
    let newClauses = [];
    let relatingToLiteral = {};
    let mappings = {}; //used as a dictionary
    let implications = {};
    let causedLiterals = new Set();
    let causingLiterals = new Set();
    //set up relatingToLiteral, contains all clauses relating to each literal
    for (let clause of clauses) {
        clause = formatClause(clause);
        let skip = false;
        if (clause === null) {
            continue;
        }
        for (const literal of clause) {
            const absLiteral = Math.abs(literal);

            if (!(absLiteral in relatingToLiteral)) {
                relatingToLiteral[absLiteral] = [];
            }
            if (!(literal in implications)) {
                implications[literal] = [];
                implications[-literal] = [];
            }
            let hasDuplicate = false;
            for (const relatingClause of relatingToLiteral[absLiteral]) {
                if (isEqual(relatingClause, clause)) {
                    hasDuplicate = true;
                }
            }
            if (hasDuplicate) {
                skip = true;
            }
        }
        if (!skip) {
            toAdd.push(clause);
        }
    }
    let toRemove = new Set();
    //every iteration moves everything from oldClauses to newClauses
    //since the relating to literal structure is updated, but the newClauses array is not
    while (toAdd.length > 0) {
        let add = true;
        let newClause;
        newClause = formatClause(toAdd.pop());
        if (newClause === null) {
            continue;
        }

        if (newClause.length === 0) {
            //if we have the empty clause, we can stop
            return [[]];
        }

        //Remove everything solved from the implication cycle
        if (newClause.length === 1) {
            causedLiterals.delete(newClause[0]);
            causedLiterals.delete(-newClause[0]);
            causingLiterals.delete(newClause[0]);
            causingLiterals.delete(-newClause[0]);
            delete implications[-newClause[0]];
            delete implications[newClause[0]];
        }

        if (newClause.length === 2) {
            let lit1 = newClause[0];
            let lit2 = newClause[1];
            causedLiterals.add(lit1);
            causedLiterals.add(lit2);
            causingLiterals.add(-lit1);
            causingLiterals.add(-lit2);
            if (-lit1 in implications && -lit2 in implications) {
                implications[-lit1].push(lit2);
                implications[-lit2].push(lit1);
            }
        }

        for (const literal of newClause) {
            const absLiteral = Math.abs(literal);
            const relatingClauses = relatingToLiteral[absLiteral];
            //console.log("relating clauses", relatingClauses.length);
            for (let i = 0; i < relatingClauses.length; i++) {
                let relatingClause = relatingClauses[i];
                if (toRemove.has(relatingClause)) {
                    relatingClauses.splice(i, 1);
                    i--;
                    continue;
                }
                if (isSubclause(relatingClause, newClause)) {
                    //relating clause is a subclause of new clause
                    toRemove.add(relatingClause);
                    //console.log(relatingClause,newClause)
                    relatingClauses.splice(i, 1);
                    i--;
                    add = true;
                    continue;
                }
                if (isSubclause(newClause, relatingClause) || isEqual(newClause, relatingClause)) {
                    //new clause is a subclause of related clause
                    add = false;
                    break;
                }
                //nice resolutions
                let resolvedClause = resolve(newClause, relatingClause);
                if (resolvedClause !== null) {
                    //if the two clauses resolve to something meaningful, see if it can be used for an immediate size reduction
                    if (isSubclause(relatingClause, resolvedClause)) {
                        //if the new clause is a subclause of the written clause the written clause is redundant
                        //doesn't mean the new clause can replace it, though, so add it to the stack
                        toAdd.push(resolvedClause);
                        toRemove.add(relatingClause);
                        relatingClauses.splice(i, 1);
                        i--;
                        continue;
                    } else if (isSubclause(newClause, resolvedClause)) {
                        //if the new clause is a subclause of the current clause, the current clause is redundant
                        //it does mean the new clause can replace it, but we have to check relations with all other clauses now
                        toAdd.push(resolvedClause);
                        add = false;
                        break;
                    }
                }

                if (
                    newClause.length === 2 &&
                    relatingClause.length === 2 &&
                    Math.abs(newClause[0]) === Math.abs(relatingClause[0]) &&
                    Math.abs(newClause[1]) === Math.abs(relatingClause[1]) &&
                    !isEqual(newClause, relatingClause)
                ) {
                    let lit1 = newClause[0];
                    let lit2 = newClause[1];
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
                        //remove the 2 old ones and add the foundations for the new mapping
                        willAdd = false;
                        toRemove.add(relatingClause);
                        relatingClauses.splice(i, 1);
                        i--;
                        break;
                    } else if (isEqual) {
                        mappings[abslit2] = abslit1;
                    } else {
                        mappings[abslit2] = -abslit1;
                    }
                }
            }
            if (add) {
                relatingClauses.push(newClause);
            } else {
                break;
            }
        }
        if (add) {
            newClauses.push(newClause);
        }

        if (toAdd.length === 0) {
            //check all mappings - If a variable is supposed to be swapped to a lexically earlier variable, swap it.
            //at the same time, check for variables that can be set positive or negative
            let unmappedClauses = [];
            let literalCount = {};
            while (newClauses.length > 0) {
                const writtenClause = newClauses.pop();
                if (toRemove.has(writtenClause)) {
                    continue;
                }
                //console.log(newClauses.length, writtenClause);
                if (writtenClause.length === 1) {
                    unmappedClauses.push(writtenClause);
                    continue;
                }

                if (
                    writtenClause.length === 2 &&
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
                    if (prevLiteral != literal) {
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
            newClauses = unmappedClauses;
        }
        if (toAdd.length === 0) {
            //Check for literals that can be set positive or negative

            let allLiterals = new Set();
            for (const clause of newClauses) {
                if (clause.length === 1) {
                    continue;
                }
                for (const literal of clause) {
                    allLiterals.add(literal);
                }
            }
            for (const literal of allLiterals) {
                if (!allLiterals.has(-literal)) {
                    toAdd.push([literal]);
                }
            }
        }
        if (toAdd.length === 0) {
            const alreadyImpliedLiterals = new Set();
            for (const startLiteral of Object.keys(implications)) {
                const literalsToAdd = [startLiteral];
                const implied = new Set();
                if(alreadyImpliedLiterals.has(startLiteral)){
                    continue;
                }
                while (literalsToAdd.length > 0) {
                    const currLiteral = literalsToAdd.pop();
                    alreadyImpliedLiterals.add(currLiteral)
                    if (implied.has(currLiteral)) {
                        continue;
                    }
                    if (relatingToLiteral[Math.abs(currLiteral)].length === 1) {
                        //console.log(relatingToLiteral[Math.abs(currLiteral)])
                        continue;
                    }
                    if (!(currLiteral in implications)) {
                        continue;
                    }
                    for (const relatedLiteral of implications[currLiteral]) {
                        if(relatedLiteral === startLiteral){
                            console.log(currLiteral,"=",startLiteral)
                            console.log(getFinalLiteralMapping(currLiteral),"=",getFinalLiteralMapping(startLiteral))
                        }
                        literalsToAdd.push(relatedLiteral);
                    }
                    if (implied.has(-currLiteral)) {
                        /*console.log(
                            "Found Contradiction",
                            currLiteral,
                            "implies",
                            currLiteral,
                            "and",
                            -currLiteral
                        );*/
                        toAdd.push([-startLiteral]);
                        break;
                    }
                    implied.add(currLiteral);
                }
                if (implied.size < 2) {
                    continue;
                }
                //console.log(startLiteral, "implies", implied.size, "vars");
            }
        }
    }
    //remove duplicates & sort
    newClauses = sortClauses(newClauses);
    let finalClauses = [];
    for (let i = 0; i < newClauses.length; i++) {
        if (i !== 0 && isEqual(newClauses[i], newClauses[i - 1])) {
            //continue, this is a duplicate
            continue;
        }
        if (toRemove.has(newClauses[i])) {
            //clause flagged for removal
            continue;
        }
        finalClauses.push(newClauses[i]);
    }
    return finalClauses;
}

/**
 * Finds a symmetry of a CNF formula.
 * @param {*} clauses The CNF formula
 * @returns A symmetry of the formula, or null if no symmetry is found.
 */
function findSymmetry(clauses) {
    let variables = new Map();
    let maxClauseLength = 0;
    for (const clause of clauses) {
        maxClauseLength = Math.max(clause.length, maxClauseLength);
        for (const literal of clause) {
            if (!variables.has(Math.abs(literal))) {
                variables.set(Math.abs(literal), []);
            }
        }
    }
    //We map the occurrences of each variable to (number of occurrences in clauses of size N = position 2N (+1 if negated))
    let defaultArray = [];
    for (let i = 0; i < maxClauseLength; i++) {
        defaultArray.push(0);
        defaultArray.push(0);
    }
    for (const variable of variables.keys()) {
        variables.set(variable, defaultArray.slice());
    }
    for (const clause of clauses) {
        for (const literal of clause) {
            const abslit = Math.abs(literal);
            variables.get(abslit)[clause.length * 2 + (abslit === literal ? 1 : 0)]++;
        }
    }
    let relstrings = new Map(); // a mapping of relation keys
    for (const variable of variables.keys()) {
        relstrings.set(variable, JSON.stringify(variables.get(variable)));
    }
    const checkedSwaps = new Set();
    for (const clause of clauses) {
        for (let i = 0; i < clause.length; i++) {
            const var1 = clause[i];
            for (let j = i + 1; j < clause.length; j++) {
                const var2 = clause[j];
                //remove non-same-positivity
                if ((var1 < 0 && var2 > 0) || (var1 > 0 && var2 < 0)) {
                    continue;
                }
                const absvar1 = Math.abs(var1);
                const absvar2 = Math.abs(var2);
                if (relstrings.get(absvar1) !== relstrings.get(absvar2)) {
                    continue;
                }
                const symmetry = [[absvar1, absvar2]];

                if (checkedSwaps.has(JSON.stringify(symmetry))) {
                    //already checked
                    continue;
                }
                const validSymmetry = validateSymmetry(clauses, symmetry);
                if (validSymmetry) {
                    return symmetry;
                } else {
                    checkedSwaps.add(JSON.stringify(symmetry));
                }
            }
        }
    }
    return null;
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
    if (clause1.length <= clause2.length) {
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

//poorly optimized, but it works

/**
 *  Verifies a partial assignment is valid.
 *
 * @param {Array} clauses The list of clauses int he formula
 * @param {Array} assignments The list of partial assignments. Ex [1,2,-3]
 * @returns
 */
function verifyPartialAssignment(clauses, assignments) {
    for (const clause of clauses) {
        let literalsRemoved = false;
        let satisfied = false;
        for (const literal of clause) {
            for (const assignment of assignments) {
                if (literal === assignment) {
                    satisfied = true;
                    break;
                } else if (literal === -assignment) {
                    literalsRemoved = true;
                    break;
                }
            }
        }
        if (literalsRemoved && !satisfied) {
            //invalid partial assignment
            return false;
        }
    }
    return true;
}

function verifyConflict(clauses, assignments) {
    let newClauses = assignments.map((assignment) => {
        return [assignment];
    });
    let reducedForm = reduceCNF(newClauses, clauses);
    if (reducedForm.length === 1 && reducedForm[0].length === 0) {
        return true;
    }
    return false;
}
module.exports = {
    verifyPartialAssignment,
    verifyConflict,
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
