import LiteralComponent from "./LiteralComponent";
import "./ClauseComponent.css";
const ClauseComponent = ({ clause, clickFunc = () => { } }) => {
    return (
        <button
            className={"clause-component"}
            onClick={() => {
                clickFunc();
            }}
        >
            {clause.map((item, index) => <LiteralComponent assignment={item} key={item} />)}
        </button>
    );
};

export default ClauseComponent;
