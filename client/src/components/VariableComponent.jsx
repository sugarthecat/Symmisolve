import "./VariableComponent.css"
import "../logic/variableColors.css"
import getColorTag from "../logic/variableColors";
const VariableComponent = ({ assignment, clickFunc = () => { } }) => {
    return (
        <span
            className={
                (assignment < 0 ? "assignment assignment-overline " : "assignment ")
                + getColorTag(Math.abs(assignment))}
            onClick={() => {
                clickFunc();
            }}
        >
            {Math.abs(assignment)}
        </span>
    );
};

export default VariableComponent;
