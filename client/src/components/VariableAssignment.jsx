const VariableAssignmentComponent = ({ assignment, clickFunc }) => {
    return (
        <span
            className={assignment < 0 ? "assignment assignment-overline" : "assignment"}
            onClick={() => {
                clickFunc();
            }}
        >
            {Math.abs(assignment)}
        </span>
    );
};

export default VariableAssignmentComponent;
