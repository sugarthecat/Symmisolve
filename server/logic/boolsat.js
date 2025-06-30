function validateCNF(formulaText) {
    const lines = formulaText.replaceAll("\r", "").split('\n');
    let numvars = -1;
    let numclauses = -1;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith("c") || lines[i].length < 2) {
            //skip comment lines AND empty lines
            continue;
        } else if (lines[i].startsWith("p cnf")) {
            const parts = lines[i].replaceAll("  ","").split(" ");
            numvars = parseInt(parts[2]);
            numclauses = parseInt(parts[3]);
        } else if (numvars < 0 || numclauses < 1) {
            console.log("Bad variable / clause count");
            return false;
        } else {
            const parts = lines[i].split(" ");
            for (let i = 0; i < parts.length; i++) {
                if (parts[i] == "0") {
                    numclauses--;
                    break;
                }
                if(parts[i].length == 0) {
                    continue;
                }
                let partInt = parseInt(parts[i]);
                if (isNaN(partInt)) {
                    return false;
                }
                if (Math.abs(partInt) > numvars) {
                    console.log("Variable out of bounds: " + partInt);
                    return false;
                }
            }
        }
    }
    return numclauses == 0;
}

function parseCNF(formulaText) {
    if (!validateCNF(formulaText)) {
        throw new Error("Invalid CNF");
    }
    const lines = formulaText.replaceAll("\r", "").split('\n');
    let clauses = [];
    let currClause = [];
    for (let i = 0; i < lines.length; i++) {
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
                    currClause = [];
                }else{
                    if(parts[i].length == 0) {
                        continue;
                    }
                    if(isNaN(parseInt(parts[i]))){
                        continue;
                    }
                    currClause.push(parseInt(parts[i]));
                }
            }
        }
    }
    return clauses;
}

function reduceCNF(clauses) {
    //TODO: Make this better
    return clauses;
}

module.exports = { validateCNF, parseCNF, reduceCNF}
