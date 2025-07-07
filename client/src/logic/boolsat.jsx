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
        if (clause1[index1] == clause2[index2]) {
            index1++;
            index2++;
        } else if (clause1[index1] == -clause2[index2]) {
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
    return index2 == clause2.length;
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
        if (clause1[index1] == clause2[index2]) {
            //if the literals are the same, add them to the new clause
            newClause.push(clause1[index1]);
            index1++;
            index2++;
        } else if (clause1[index1] == -clause2[index2]) {
            index1++;
            index2++;
            if (hasOpposingLiteral) {
                // two or more opposing literals means that no meaningful resolution is possible
                return null
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
        return null
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
    if (clause1.length != clause2.length) {
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
    //bubble sort is totally find in this case.
    let writtenClauses = clauses;
    let sorted = false;
    while (!sorted) {
        sorted = true;
        for (let i = 0; i < writtenClauses.length - 1; i++) {
            let swap = false;
            let reachedEnd = true
            let clause1 = writtenClauses[i];
            let clause2 = writtenClauses[i + 1];
            //literal by literal, compare the clauses lexically
            for (let j = 0; j < clause1.length; j++) {
                if (Math.abs(clause1[j]) > Math.abs(clause2[j]) || (Math.abs(clause1[j]) == Math.abs(clause2[j]) && clause1[j] < clause2[j])) {
                    swap = true;
                    reachedEnd = false;
                    break;
                } else if (clause1[j] != clause2[j]) {
                    reachedEnd = false;
                    break;
                }
            }
            if (reachedEnd) {
                swap = clause2.length > clause1.length;
            }
            if (swap) {
                sorted = false;
                let temp = writtenClauses[i];
                writtenClauses[i] = writtenClauses[i + 1];
                writtenClauses[i + 1] = temp;
            }
        }
    }
    return writtenClauses;
}

function getSizeCNF(clauses) {
    let size = clauses.length;
    for (let i = 0; i < clauses.length; i++) {
        size += clauses[i].length;
    }
    return size
}

export {
    resolve,
    isSubclause,
    isEqual,
    getSizeCNF
}

//and they say mathemeticians can't code :p
