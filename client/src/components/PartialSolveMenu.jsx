import { useState } from "react";
import "./PartialSolveMenu.css"
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
        setAssignments(assignmentsLocal);
    };
    const removeAssignment = (index) => {
        let assignmentsLocal = assignments;
        assignmentsLocal.splice(index, 1);
        setAssignments(assignmentsLocal);
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
                        className="assignment"
                        onClick={() => {
                            removeAssignment(index);
                        }}
                        key={index}
                    >
                        {assignment}
                    </span>
                ))}
            </p>
        </div>
    );
}

export default PartialSolveMenu;
