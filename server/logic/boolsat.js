function validateCNF(formulaText){
    const lines = formulaText.replaceAll("\r","").split('\n');
    let numvars = -1;
    let numclauses = -1;
    for(let i = 0; i < lines.length; i++){
        if(lines[i].startsWith("c")){
            continue;
        }else if(lines[i].startsWith("p cnf")){
            const parts = lines[i].split(" ");
            numvars = parseInt(parts[2]);
            numclauses = parseInt(parts[3]);
        }else if(numvars < 0 || numclauses < 1){
            return false;
        }else{
            const parts = lines[i].split(" ");
            for(let i= 0; i < parts.length; i++){
                if(parts[i] == "0"){
                    numclauses--;
                    break;
                }
                let partInt = parseInt(parts[i]);
                if( isNaN(partInt)){
                    return false;
                }
                if(Math.abs(partInt) > numvars){
                    return false;
                }
            }
        }
    }
    return numclauses == 0;
}

module.exports = { validateCNF };
