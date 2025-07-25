import "./ConfirmWindow.css";
const ConfirmWindow = ({ action, message }) => {
    return (
        <div className="confirm-window-overlay">
            <div className="confirm-window-content">
                <p>{message}</p>
                <p><button onClick={action}>Confirm</button></p>
            </div>
        </div>
    );
};

export default ConfirmWindow;
