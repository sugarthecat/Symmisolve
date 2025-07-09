import { useState } from "react";

function PartialSolveMenu({ clauses }) {
    const [assignments, setAssignments] = useState([]);
    const [inputValue, setInputValue] = useState("");

    const handleInputChange = (event) => {
        const newValue = event.target.value;
        if (newValue.length == 0 || newValue == "-" || /^[+-]?\d+$/.test(newValue)) {
            setInputValue(newValue);
        }
    };
    return (
        <div>
            <h2>Partial Solve</h2>
            <input onChange={handleInputChange} value={inputValue} />
            <button>Add</button>
        </div>
    );
}

export default PartialSolveMenu;
