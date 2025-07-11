const VariableAssignmentComponent = ({ assignment, removeFunction }) => {
    return (
        <span
            className={assignment < 0 ? "assignment assignment-overline" : "assignment"}
            onClick={() => {
                removeFunction();
            }}
        >
            {Math.abs(assignment)}
        </span>
    );
};

export default VariableAssignmentComponent;
