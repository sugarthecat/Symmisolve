import { useEffect, useState } from "react";
import "./PartialSolveMenu.css";
import VariableAssignmentComponent from "./VariableAssignment";
function PartialSolveMenu({ clauses, submitPartialSolve, submitConflict }) {
    const [assignments, setAssignments] = useState([]);
    const [impliedAssignments, setImpliedAssignments] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        verifyCurrAssignment();
    }, [JSON.stringify(assignments)]);

    const handleInputChange = (event) => {
        const newValue = event.target.value;
        if (newValue.length == 0 || newValue == "-" || /^[+-]?\d+$/.test(newValue)) {
            setInputValue(newValue);
        }
    };

    const attemptAssignment = () => {
        if (inputValue.length == 0) {
            setError("Please enter a value");
            return;
        } else if (inputValue == "-") {
            setError("Please enter a value other than -");
            return;
        }
        const value = parseInt(inputValue);
        if (isNaN(value)) {
            setError("Please enter a valid integer");
            return;
        }
        let assignmentsLocal = assignments;
        for (const prevAssignment of assignmentsLocal) {
            if (prevAssignment === value) {
                setError("This assignment has already been included");
                return;
            }
            if (prevAssignment === -value) {
                setError("The negation of this assignment has already been included");
                return;
            }
        }
        for (const clause of clauses) {
            if (clause.length === 1 && clause[0] === value) {
                setError("This assignment is already included in the problem");
                return;
            }
            if (clause.length === 1 && clause[0] === -value) {
                setError("The negation of this assignment is already included in the problem");
                return;
            }
        }
        setError("");
        setInputValue("");
        assignmentsLocal.push(value);
        setAssignments(assignmentsLocal.slice());
    };
    const removeAssignment = (index) => {
        let assignmentsLocal = assignments.slice();
        assignmentsLocal.splice(index, 1);
        setAssignments(assignmentsLocal);
    };
    const updateImplications = () => {
        let implications = [];
        let activeSearch = true;
        while (activeSearch) {
            activeSearch = false;
            for (const clause of clauses) {
                let satisfied = false;
                let conflicts = 0;
                let implication = null;
                for (const literal of clause) {
                    if (assignments.includes(literal) || implications.includes(literal)) {
                        satisfied = true;
                        break;
                    } else if (assignments.includes(-literal) || implications.includes(-literal)) {
                        conflicts++;
                    } else {
                        implication = literal;
                    }
                }

                if (conflicts === clause.length - 1 && !satisfied && clause.length !== 1) {
                    implications.push(implication);
                    activeSearch = true;
                }
            }
        }
        implications = implications.sort((a, b) => Math.abs(a) - Math.abs(b))
        setImpliedAssignments(implications);
        return implications
    };
    const verifyCurrAssignment = () => {
        let conflictingClauses = [];
        let impliedAssignments = updateImplications();
        let lostCause = false; // if no solution exists with these assignments
        for (const clause of clauses) {
            let satisfied = false;
            let conflicting = 0;
            let nonconflict = 0;
            for (const literal of clause) {
                let hasConflict = false;
                for (const assignment of assignments) {
                    if (assignment === literal) {
                        satisfied = true;
                        break;
                    } else if (assignment === -literal) {
                        conflicting++;
                        hasConflict = true;
                    }
                }
                for (const impliedAssignment of impliedAssignments) {
                    if (impliedAssignment === literal) {
                        satisfied = true;
                        break;
                    } else if (impliedAssignment === -literal) {
                        conflicting++;
                        hasConflict = true;
                    }
                }
                if (!hasConflict && !satisfied) {
                    nonconflict = literal;
                }
            }
            if (conflicting > 0 && !satisfied) {
                conflictingClauses.push(clause);
                if (conflicting === clause.length) {
                    lostCause = clause;
                    break;
                    //no possible solution with these assignments
                }
            }
        }
        let errorNode = <></>;
        if (assignments.length === 0) {
            errorNode = <></>;
            //keep it like this, nothing happens. Nothing EVER happens.
        } else if (lostCause) {
            errorNode = (
                <>This partial assignment is not satisfiable: {JSON.stringify(lostCause)}</>
            );
        } else if (conflictingClauses.length > 0) {
            errorNode = (
                <>
                    This partial assignment is not fully satisfying ({conflictingClauses.length}{" "}
                    altered unsatisfied clauses): {JSON.stringify(conflictingClauses[0])}{" "}
                </>
            );
        } else {
            let allAssignments = assignments.concat(impliedAssignments);
            submitPartialSolve(allAssignments);
            errorNode = <></>;
        }
        setError(errorNode);
    };
    return (
        <div>
            <h2>Partial Solve</h2>
            <p>
                <input
                    onChange={handleInputChange}
                    value={inputValue}
                    onKeyDown={(event) => {
                        if (event.key == "Enter") {
                            attemptAssignment();
                            event.preventDefault();
                        }
                    }}
                />
                <button onClick={attemptAssignment}>Add</button>
            </p>
            <p className="error">{error}</p>
            Chosen
            <p id="assignments">
                {assignments.map((assignment, index) => (
                    <VariableAssignmentComponent
                        key={assignment}
                        assignment={assignment}
                        removeFunction={() => {
                            removeAssignment(index);
                        }}
                    ></VariableAssignmentComponent>
                ))}
            </p>
            Implied
            <p id="implied-assignments">
                {impliedAssignments.map((assignment, index) => (
                    <VariableAssignmentComponent
                        key={assignment}
                        assignment={assignment}
                        removeFunction={() => { }}
                    ></VariableAssignmentComponent>
                ))}
            </p>
            <p>
                <button onClick={() => setAssignments([])}>Clear</button>
                <button onClick={verifyCurrAssignment}>Submit Partial Solve</button>
            </p>
        </div>
    );
}

export default PartialSolveMenu;
