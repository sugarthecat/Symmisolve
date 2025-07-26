import "./ConfirmWindow.css";
const ConfirmWindow = ({ action, message, deleteSelf }) => {
    return (
        <div className="confirm-window-overlay" onClick={() => { deleteSelf(); }}>
            <div className="confirm-window-content" onClick={(event) => { event.stopPropagation(); }}>
                <p>{message}</p>
                <p><button onClick={action}>Confirm</button><button onClick={deleteSelf}>Cancel</button></p>
            </div>
        </div>
    );
};

export default ConfirmWindow;
