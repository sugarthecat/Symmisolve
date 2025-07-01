function validateCNF(formulaText) {
    const lines = formulaText.replaceAll("\t", " ").replaceAll("\r", "").split('\n');
    let numvars = -1;
    let numclauses = -1;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith("c") || lines[i].length < 2) {
            //skip comment lines AND empty lines
            continue;
        } else if (lines[i].startsWith("p cnf")) {
            const parts = lines[i].replaceAll("  ", " ").split(" ");
            numvars = parseInt(parts[2]);
            numclauses = parseInt(parts[3]);
        } else if (numvars < 0 || numclauses < 1) {
            console.log("Bad variable / clause count");
            return false;
        } else {
            const parts = lines[i].split(" ");
            for (let i = 0; i < parts.length; i++) {
                if (parts[i] == "0") {
                    break;
                }
                if (parts[i].length == 0) {
                    continue;
                }
                let partInt = parseInt(parts[i]);
                if (isNaN(partInt)) {
                    console.log("Invalid character: " + parts[i]);
                    return false;
                }
                if (Math.abs(partInt) > numvars) {
                    console.log("Variable out of bounds: " + partInt);
                    return false;
                }
            }
        }
    }
    return numvars > -1;
}

function parseCNF(formulaText) {
    if (!validateCNF(formulaText)) {
        throw new Error("Invalid CNF");
    }
    const lines = formulaText.replaceAll("\t", " ").replaceAll("\r", "").split('\n');
    let clauses = [];
    for (let i = 0; i < lines.length; i++) {
        let currClause = [];
        if (lines[i].startsWith("c")) {
            continue;
        } else if (lines[i].startsWith("p cnf")) {
            const parts = lines[i].split(" ");
            numvars = parseInt(parts[2]);
        } else {
            const parts = lines[i].split(" ");
            for (let i = 0; i < parts.length; i++) {
                if (parts[i] == "0") {
                    clauses.push(currClause);
                    break
                } else {
                    if (parts[i].length == 0) {
                        continue;
                    }
                    if (isNaN(parseInt(parts[i]))) {
                        continue;
                    }
                    currClause.push(parseInt(parts[i]));
                }
            }
        }
    }
    return clauses;
}
/**
 *
 * @param {List<Clause>} clauses
 * @returns
 */
function reduceCNF(clauses) {
    let writtenClauses = []
    let toAdd = []; //used as a stack
    //copy clauses into toAdd
    for(let i = 0; i < clauses.length; i++){
        toAdd.push(clauses[i]);
    }
    while (toAdd.length > 0) {
        let currClause = formatClause(toAdd.pop());
        let willAdd = true;
        for (let i = 0; i < writtenClauses.length; i++) {
            if (isEqual(writtenClauses[i], currClause)) {
                willAdd = false;
                break;
            }else if (isSubclause(currClause, writtenClauses[i])) {
                willAdd = false;
                break;
            }else if (isSubclause(writtenClauses[i], currClause)) {
                writtenClauses.splice(i, 1);
                i--;
            }
        }
        if(willAdd){
            writtenClauses.push(currClause);
        }
    }
    return writtenClauses;
}

/**
 * Formats a clause by removing duplicates and sorting literals by absolute value (ascending)
 * @param {Clause} clause A CNF Clause to be formatted
 * @returns The clause with duplicates removed and literals sorted by absolute value
 */
function formatClause(clause) {
    let finalClause = []
    let tautological = false // if two opposing literals are in the clause, the clause is tautological
    //fast insertion sort with binary search
    for (let i = 0; i < clause.length; i++) {
        let ub = finalClause.length; // insertion upper bound
        let lb = 0; // insertion lower bound
        let add = true; // whether to add. Flagged as false if duplicate is found
        while(ub > lb){
            let mid = Math.floor((ub+lb)/2);
            if(Math.abs(finalClause[mid]) == Math.abs(clause[i])){
                add = false;
                if(finalClause[mid] == -clause[i]){
                    tautological = true;
                }
            } else if (Math.abs(finalClause[mid]) < Math.abs(clause[i])){
                lb = mid+1;
            }else{
                ub = mid;
            }
        }
        if(add){
            finalClause.splice(ub, 0, clause[i]);
        }
    }
    if(tautological){
        return [];
    }
    return finalClause;

}
/**
 * Checks if clause1 is a subclause of clause2.
 * Precondition: clause1 and clause2 are formatted
 * @param {Clause} clause1 The possible subclause
 * @param {Clause} clause2 The possible superclause
 */
function isSubclause(clause1, clause2) {
    if(clause1.length < clause2.length){
        return false;
    }
    let index1 = 0;
    let index2 = 0;
    while(index1 < clause1.length && index2 < clause2.length){
        if(clause1[index1] == clause2[index2]){
            index1++;
            index2++;
        }else if(clause1[index1] == -clause2[index2]){
            //opposing literals - no overlap, not a subclause
            return false;
        }else if(Math.abs(clause1[index1]) < Math.abs(clause2[index2])){
            //clause 1 has some quality clause 2 doesn't, that's ok!. Clause 2 is more general
            index1++;
        }else if(Math.abs(clause1[index1]) > Math.abs(clause2[index2])){
            //clause 2 has some quality clause 1 doesn't
            return false;
        }

    }
    //TODO: Implement this
    return index2 == clause2.length;
}
/**
 * Checks if clause1 is equal to clause2.
 * Precondition: clause1 and clause2 are formatted
 * @param {Clause} clause1
 * @param {Clause} clause2
 */
function isEqual(clause1, clause2) {
    if(clause1.length != clause2.length){
        return false;
    }
    for(let i = 0; i < clause1.length; i++){
        if(clause1[i] != clause2[i]){
            return false;
        }
    }
    return true;
}
module.exports = { validateCNF, parseCNF, reduceCNF}
