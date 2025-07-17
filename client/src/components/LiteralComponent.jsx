import "./literalComponent.css"
const LiteralComponent = ({ assignment }) => {
    return (
        <span
            className={assignment < 0 ? "literal-component overline" : "literal-component"}
        >
            {Math.abs(assignment)}
        </span>
    );
};

export default LiteralComponent;
