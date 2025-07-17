import "./VariableComponent.css"
import "../logic/variableColors.css"
const VariableComponent = ({ assignment, clickFunc }) => {
    return (
        <span
            className={
                (assignment < 0 ? "assignment assignment-overline" : "assignment")
                + (` var-color-${Math.abs(assignment) % 6 + 1}`)}
            onClick={() => {
                clickFunc();
            }}
        >
            {Math.abs(assignment)}
        </span>
    );
};

export default VariableComponent;
