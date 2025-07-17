const VariableAssignmentComponent = ({ assignment, clickFunc }) => {
    return (
        <button
            className={assignment < 0 ? "assignment assignment-overline" : "assignment"}
            onClick={() => {
                clickFunc();
            }}
        >
            {Math.abs(assignment)}
        </button>
    );
};

export default VariableAssignmentComponent;
