const SuccessAlert = ({ message, onClose }) => {
    if (!message) return null;
    return (
        <div className="alert alert-success">
            <span>{message}</span>
            {onClose && (
                <button onClick={onClose} className="alert-close">×</button>
            )}
        </div>
    );
};

window.SuccessAlert = SuccessAlert;