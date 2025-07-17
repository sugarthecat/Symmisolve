import "./literalComponent.css";
const LiteralComponent = ({ assignment }) => {
    return (
        <span
            className={
                (assignment < 0 ? "literal-component overline" : "literal-component") +
                ` var-color-${Math.abs(assignment) % 6 + 1}`
            }
        >
            {Math.abs(assignment)}
        </span>
    );
};

export default LiteralComponent;
