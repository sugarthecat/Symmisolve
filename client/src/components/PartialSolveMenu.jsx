import { useEffect, useState } from "react";
import "./PartialSolveMenu.css";
function PartialSolveMenu({ clauses, submitPartialSolve }) {
    const [assignments, setAssignments] = useState([]);
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
    const verifyCurrAssignment = () => {
        let conflictingClauses = [];
        let implications = [];
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
                if (!hasConflict && !satisfied) {
                    nonconflict = literal;
                }
            }
            if (conflicting > 0 && !satisfied) {
                conflictingClauses.push(clause);
                if (conflicting + 1 === clause.length) {
                    implications.push(nonconflict);
                } else if (conflicting === clause.length) {
                    lostCause = clause;
                    break;
                    //no possible solution with these assignments
                }
            }
        }

        if (assignments.length === 0) {
            setError("");
        } else if (lostCause) {
            setError(<>This partial assignment is not satisfiable: {JSON.stringify(lostCause)}</>);
        } else if (implications.length > 0) {
            const setImplications = () => {
                let newAssignments = assignments.slice();
                for (const implication of implications) {
                    let found = false;
                    for (const prevAssignment of newAssignments) {
                        if (Math.abs(prevAssignment) === Math.abs(implication)) {
                            found = true;
                        }
                    }
                    if (!found) {
                        newAssignments.push(implication);
                    }
                }
                setAssignments(newAssignments.sort((a, b) => Math.abs(a) - Math.abs(b)));
                setError("");
                verifyCurrAssignment();
            };
            setError(
                <>
                    This partial assignment is not fully satisfying ({conflictingClauses.length}{" "}
                    altered unsatisfied clauses): {JSON.stringify(conflictingClauses[0])} <br />
                    Some implications exist, would you like to add them as assignments?{" "}
                    <button onClick={setImplications}>Add</button>
                </>
            );
        } else if (conflictingClauses.length > 0) {
            setError(
                <>
                    This partial assignment is not fully satisfying ({conflictingClauses.length}{" "}
                    altered unsatisfied clauses): {JSON.stringify(conflictingClauses[0])}{" "}
                </>
            );
        } else {
            submitPartialSolve(assignments);
            setError("");
        }
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
            <p id="assignments">
                {assignments.map((assignment, index) => (
                    <span
                        className={assignment < 0 ? "assignment assignment-overline" : "assignment"}
                        onClick={() => {
                            removeAssignment(index);
                        }}
                        key={index}
                    >
                        {Math.abs(assignment)}
                    </span>
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
