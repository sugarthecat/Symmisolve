import { useState } from "react";
import "./PartialSolveMenu.css";
import { verifyPartialAssignment } from "../logic/boolsat";
function PartialSolveMenu({ clauses }) {
    const [assignments, setAssignments] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const [error, setError] = useState("");
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
        console.log(assignmentsLocal);
        setAssignments(assignmentsLocal);
    };
    const verifyCurrAssignment = () => {
        let conflictingClauses = [];
        for (const clause of clauses) {
            let satisfied = false;
            let conflicting = false;
            for (const literal of clause) {
                for (const assignment of assignments) {
                    if (assignment === literal) {
                        satisfied = true;
                        break;
                    }
                    if (assignment === -literal) {
                        conflicting = true;
                    }
                }
            }
            if (conflicting && !satisfied) {
                conflictingClauses.push(clause);
            }
        }
        if (conflictingClauses.length > 0) {
            setError("This partial assignment is not fully satisfying: " + JSON.stringify(conflictingClauses[0]));
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
            <p>
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
                <button onClick={verifyCurrAssignment}>Confirm Partial Solve</button>
            </p>
        </div>
    );
}

export default PartialSolveMenu;
