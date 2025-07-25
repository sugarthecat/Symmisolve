import getColorTag from "../logic/variableColors";
import "./LiteralComponent.css";
const LiteralComponent = ({ assignment }) => {
    return (
        <span
            className={
                (assignment < 0 ? "literal-component overline " : "literal-component ") + getColorTag(Math.abs(assignment))
            }
        >
            {Math.abs(assignment)}
        </span>
    );
};

export default LiteralComponent;
