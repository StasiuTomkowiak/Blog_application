
const ErrorAlert = ({ error, onClose }) => {
    if (!error) return null;
    return (
        <div className="alert alert-error">
            <span>{error}</span>
            {onClose && (
                <button onClick={onClose} className="alert-close">×</button>
            )}
        </div>
    );
};

window.ErrorAlert = ErrorAlert;